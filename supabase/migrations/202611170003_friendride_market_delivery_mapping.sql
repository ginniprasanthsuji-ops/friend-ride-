-- FRIEND RIDE: additive delivery assignment mapping for the existing FR Market order model.
-- Does not alter shop_orders, shop_delivery_assignments, or the existing Shop checkout/quote/payment flows.

create table if not exists public.fr_market_order_delivery_assignments (
  order_id uuid primary key references public.fr_market_orders(id) on delete cascade,
  driver_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  status text not null default 'assigned'
    check (status in ('assigned','picked_up','delivered','cancelled')),
  delivered_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists fr_market_order_delivery_assignments_driver_idx
  on public.fr_market_order_delivery_assignments(driver_id, status);

alter table public.fr_market_order_delivery_assignments enable row level security;
revoke all on public.fr_market_order_delivery_assignments from anon, authenticated;

-- Customer and currently assigned driver can be resolved using the existing
-- FR Market order ID; legacy Shop tables remain untouched.
create or replace function public.fr_can_access_delivery_order(p_order_type text, p_order_id uuid)
returns boolean
language plpgsql stable security definer set search_path = pg_catalog, public
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_order_id is null then return false; end if;
  if p_order_type = 'ride' then
    return exists(select 1 from public.rides r where r.id=p_order_id and (r.customer_id=v_uid or r.driver_id=v_uid));
  elsif p_order_type = 'parcel' then
    return exists(select 1 from public.fr_parcel_orders p where p.id=p_order_id and (p.customer_id=v_uid or p.driver_id=v_uid));
  elsif p_order_type = 'food' then
    return exists(select 1 from public.fr_food_orders o where o.id=p_order_id and o.customer_id=v_uid)
      or exists(select 1 from public.fr_food_deliveries d where d.order_id=p_order_id and d.delivery_partner_id=v_uid);
  elsif p_order_type = 'shop' then
    return exists(select 1 from public.fr_market_orders o where o.id=p_order_id and o.customer_id=v_uid)
      or exists(select 1 from public.fr_market_order_delivery_assignments a
        where a.order_id=p_order_id and a.driver_id=v_uid and a.status in ('assigned','picked_up'));
  end if;
  return false;
end;
$$;
revoke all on function public.fr_can_access_delivery_order(text,uuid) from public;
grant execute on function public.fr_can_access_delivery_order(text,uuid) to authenticated;

create or replace function public.fr_is_delivery_order_customer(p_order_type text, p_order_id uuid)
returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null or p_order_id is null then return false; end if;
  if p_order_type = 'ride' then
    return exists(select 1 from public.rides r where r.id=p_order_id and r.customer_id=v_uid);
  elsif p_order_type = 'parcel' then
    return exists(select 1 from public.fr_parcel_orders p where p.id=p_order_id and p.customer_id=v_uid);
  elsif p_order_type = 'food' then
    return exists(select 1 from public.fr_food_orders o where o.id=p_order_id and o.customer_id=v_uid);
  elsif p_order_type = 'shop' then
    return exists(select 1 from public.fr_market_orders o where o.id=p_order_id and o.customer_id=v_uid);
  end if;
  return false;
end;
$$;
revoke all on function public.fr_is_delivery_order_customer(text,uuid) from public;
grant execute on function public.fr_is_delivery_order_customer(text,uuid) to authenticated;

create or replace function public.fr_driver_set_delivery_arrival_photo(
  p_instruction_id uuid,
  p_storage_path text
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_instruction public.fr_delivery_instructions%rowtype;
  v_assigned boolean := false;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_instruction_id is null or p_storage_path is null
     or split_part(p_storage_path, '/', 1) <> v_uid::text then
    raise exception 'Invalid arrival photo path' using errcode = '42501';
  end if;
  if not exists(select 1 from public.profiles p
    where p.id=v_uid and lower(coalesce(p.role,''))='driver'
      and lower(coalesce(p.driver_approval_status,''))='approved') then
    raise exception 'Approved Driver account required' using errcode = '42501';
  end if;
  select * into v_instruction from public.fr_delivery_instructions
    where id=p_instruction_id for update;
  if not found then raise exception 'Delivery instruction not found' using errcode = 'P0002'; end if;

  if v_instruction.order_type='ride' then
    select exists(select 1 from public.rides r where r.id=v_instruction.order_id and r.driver_id=v_uid) into v_assigned;
  elsif v_instruction.order_type='parcel' then
    select exists(select 1 from public.fr_parcel_orders p where p.id=v_instruction.order_id and p.driver_id=v_uid) into v_assigned;
  elsif v_instruction.order_type='food' then
    select exists(select 1 from public.fr_food_deliveries d where d.order_id=v_instruction.order_id and d.delivery_partner_id=v_uid) into v_assigned;
  elsif v_instruction.order_type='shop' then
    select exists(select 1 from public.fr_market_order_delivery_assignments a
      where a.order_id=v_instruction.order_id and a.driver_id=v_uid and a.status in ('assigned','picked_up')) into v_assigned;
  end if;
  if not v_assigned then raise exception 'Only the assigned driver can add arrival proof' using errcode = '42501'; end if;
  if not exists(select 1 from storage.objects o
    where o.bucket_id='fr-delivery-instructions' and o.name=p_storage_path) then
    raise exception 'Arrival photo must be uploaded to the private delivery bucket first';
  end if;
  update public.fr_delivery_instructions
    set arrival_photo_path=p_storage_path,updated_at=pg_catalog.now()
    where id=p_instruction_id;
end;
$$;
revoke all on function public.fr_driver_set_delivery_arrival_photo(uuid,text) from public;
grant execute on function public.fr_driver_set_delivery_arrival_photo(uuid,text) to authenticated;

-- Assignment is additive and only allowed to the owning approved Partner or Admin.
-- It does not change FR Market order status, payment, quotation, or checkout.
create or replace function public.fr_assign_market_order_delivery_driver(
  p_order_id uuid,
  p_driver_id uuid
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_status text;
  v_partner uuid;
begin
  if v_uid is null then raise exception 'Login required' using errcode='28000'; end if;
  if p_order_id is null or p_driver_id is null then raise exception 'Order and driver are required'; end if;
  select lower(coalesce(role,'')) into v_role from public.profiles where id=v_uid;
  if v_role not in ('admin','partner') then raise exception 'Admin or owning Partner required' using errcode='42501'; end if;
  if v_role='partner' and not exists(select 1 from public.profiles p where p.id=v_uid
    and lower(coalesce(p.partner_approval_status,''))='approved') then
    raise exception 'Approved Partner account required' using errcode='42501';
  end if;
  select status,partner_id into v_status,v_partner from public.fr_market_orders where id=p_order_id for update;
  if not found then raise exception 'FR Market order not found' using errcode='P0002'; end if;
  if v_role='partner' and v_partner<>v_uid then raise exception 'Only the owning Partner can assign delivery' using errcode='42501'; end if;
  if v_status not in ('ready','completed') then raise exception 'Market order must be ready before driver assignment'; end if;
  if not exists(select 1 from public.profiles p where p.id=p_driver_id and lower(coalesce(p.role,''))='driver'
    and lower(coalesce(p.driver_approval_status,''))='approved') then
    raise exception 'Select an approved Driver';
  end if;
  insert into public.fr_market_order_delivery_assignments(order_id,driver_id,assigned_by,status,assigned_at,updated_at)
  values(p_order_id,p_driver_id,v_uid,'assigned',now(),now())
  on conflict(order_id) do update set driver_id=excluded.driver_id,assigned_by=excluded.assigned_by,
    status='assigned',assigned_at=now(),delivered_at=null,updated_at=now();
  return jsonb_build_object('ok',true,'order_id',p_order_id,'driver_id',p_driver_id,'status','assigned');
end;
$$;
revoke all on function public.fr_assign_market_order_delivery_driver(uuid,uuid) from public;
grant execute on function public.fr_assign_market_order_delivery_driver(uuid,uuid) to authenticated;

create or replace function public.fr_driver_list_assigned_market_orders()
returns table(order_id uuid, order_number text, order_status text, delivery_address text, assigned_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null or not exists(
    select 1 from public.profiles p where p.id=auth.uid()
      and lower(coalesce(p.role,''))='driver'
      and lower(coalesce(p.driver_approval_status,''))='approved'
  ) then raise exception 'Approved Driver login required' using errcode='42501'; end if;
  return query
    select o.id,o.order_number,o.status,o.delivery_address,a.assigned_at
    from public.fr_market_order_delivery_assignments a
    join public.fr_market_orders o on o.id=a.order_id
    where a.driver_id=auth.uid() and a.status in ('assigned','picked_up')
    order by a.assigned_at desc;
end;
$$;
revoke all on function public.fr_driver_list_assigned_market_orders() from public;
grant execute on function public.fr_driver_list_assigned_market_orders() to authenticated;

create or replace function public.fr_partner_list_approved_delivery_drivers()
returns table(driver_id uuid, driver_name text)
language plpgsql stable security definer set search_path = ''
as $$
declare v_role text;
begin
  if auth.uid() is null then raise exception 'Login required' using errcode='28000'; end if;
  select lower(coalesce(role,'')) into v_role from public.profiles where id=auth.uid();
  if v_role not in ('admin','partner') then raise exception 'Admin or Partner login required' using errcode='42501'; end if;
  if v_role='partner' and not exists(select 1 from public.profiles p where p.id=auth.uid()
    and lower(coalesce(p.partner_approval_status,''))='approved') then
    raise exception 'Approved Partner account required' using errcode='42501';
  end if;
  return query select p.id,coalesce(nullif(p.full_name,''),'Approved Driver')
    from public.profiles p
    where lower(coalesce(p.role,''))='driver'
      and lower(coalesce(p.driver_approval_status,''))='approved'
    order by coalesce(p.full_name,'');
end;
$$;
revoke all on function public.fr_partner_list_approved_delivery_drivers() from public;
grant execute on function public.fr_partner_list_approved_delivery_drivers() to authenticated;
