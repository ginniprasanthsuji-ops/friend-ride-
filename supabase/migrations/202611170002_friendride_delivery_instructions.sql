-- FRIEND RIDE: private delivery instruction metadata + RLS + Storage bucket.
-- Applied to the connected production Supabase project after explicit user approval.
create table if not exists public.fr_delivery_instructions (
  id uuid primary key default gen_random_uuid(),
  order_type text not null check (order_type in ('ride','parcel','food','shop')),
  order_id uuid not null,
  building_photo_path text,
  voice_directions_path text,
  voice_duration_seconds integer check (voice_duration_seconds between 1 and 120),
  landmark_text text,
  landmark_lat double precision,
  landmark_lng double precision,
  arrival_photo_path text,
  delivery_otp_hash text,
  delivery_otp_expires_at timestamptz,
  delivery_otp_verified_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_type, order_id),
  check ((landmark_lat is null and landmark_lng is null) or
         (landmark_lat between -90 and 90 and landmark_lng between -180 and 180))
);
create index if not exists fr_delivery_instructions_order_idx on public.fr_delivery_instructions(order_type, order_id);
create index if not exists fr_delivery_instructions_created_by_idx on public.fr_delivery_instructions(created_by);
create or replace function public.fr_can_access_delivery_order(p_order_type text, p_order_id uuid)
returns boolean language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare v_uid uuid := auth.uid();
begin
 if v_uid is null or p_order_id is null then return false; end if;
 if p_order_type='ride' then
  return exists(select 1 from public.rides r where r.id=p_order_id and (r.customer_id=v_uid or r.driver_id=v_uid));
 elsif p_order_type='parcel' then
  return exists(select 1 from public.fr_parcel_orders p where p.id=p_order_id and (p.customer_id=v_uid or p.driver_id=v_uid));
 elsif p_order_type='food' then
  return exists(select 1 from public.fr_food_orders o where o.id=p_order_id and o.customer_id=v_uid)
   or exists(select 1 from public.fr_food_deliveries d where d.order_id=p_order_id and d.delivery_partner_id=v_uid);
 elsif p_order_type='shop' then
  return exists(select 1 from public.shop_orders o where o.id=p_order_id and o.customer_id=v_uid)
   or exists(select 1 from public.shop_delivery_assignments a where a.order_id=p_order_id and a.driver_id=v_uid);
 end if;
 return false;
end; $$;
revoke all on function public.fr_can_access_delivery_order(text,uuid) from public;
grant execute on function public.fr_can_access_delivery_order(text,uuid) to authenticated;
alter table public.fr_delivery_instructions enable row level security;
drop policy if exists fr_delivery_instructions_select on public.fr_delivery_instructions;
create policy fr_delivery_instructions_select on public.fr_delivery_instructions for select to authenticated
 using(public.fr_can_access_delivery_order(order_type,order_id));
drop policy if exists fr_delivery_instructions_insert_customer on public.fr_delivery_instructions;
create policy fr_delivery_instructions_insert_customer on public.fr_delivery_instructions for insert to authenticated
 with check(created_by=auth.uid() and public.fr_can_access_delivery_order(order_type,order_id));
drop policy if exists fr_delivery_instructions_update_access on public.fr_delivery_instructions;
create policy fr_delivery_instructions_update_access on public.fr_delivery_instructions for update to authenticated
 using(created_by=auth.uid() and public.fr_can_access_delivery_order(order_type,order_id))
 with check(created_by=auth.uid() and public.fr_can_access_delivery_order(order_type,order_id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('fr-delivery-instructions','fr-delivery-instructions',false,5242880,
 array['image/jpeg','image/png','image/webp','audio/webm','audio/ogg','audio/mp4'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists fr_delivery_instruction_storage_select on storage.objects;
create policy fr_delivery_instruction_storage_select on storage.objects for select to authenticated
 using(bucket_id='fr-delivery-instructions' and exists(
  select 1 from public.fr_delivery_instructions i
  where (i.building_photo_path=name or i.voice_directions_path=name or i.arrival_photo_path=name)
   and public.fr_can_access_delivery_order(i.order_type,i.order_id)));
drop policy if exists fr_delivery_instruction_storage_insert on storage.objects;
create policy fr_delivery_instruction_storage_insert on storage.objects for insert to authenticated
 with check(bucket_id='fr-delivery-instructions' and (storage.foldername(name))[1]=auth.uid()::text);


-- RLS correction: Drivers must not directly UPDATE customer-created rows.
-- Assigned drivers use this narrow RPC to attach only their arrival proof.
drop policy if exists fr_delivery_instructions_update_access on public.fr_delivery_instructions;

create or replace function public.fr_driver_set_delivery_arrival_photo(
  p_instruction_id uuid,
  p_storage_path text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_instruction public.fr_delivery_instructions%rowtype;
  v_assigned boolean := false;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_instruction_id is null or p_storage_path is null
     or split_part(p_storage_path, '/', 1) <> v_uid::text then
    raise exception 'Invalid arrival photo path' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p
    where p.id = v_uid and lower(coalesce(p.role, '')) = 'driver') then
    raise exception 'Driver account required' using errcode = '42501';
  end if;

  select * into v_instruction from public.fr_delivery_instructions
  where id = p_instruction_id for update;
  if not found then
    raise exception 'Delivery instruction not found' using errcode = 'P0002';
  end if;

  if v_instruction.order_type = 'ride' then
    select exists(select 1 from public.rides r
      where r.id = v_instruction.order_id and r.driver_id = v_uid) into v_assigned;
  elsif v_instruction.order_type = 'parcel' then
    select exists(select 1 from public.fr_parcel_orders p
      where p.id = v_instruction.order_id and p.driver_id = v_uid) into v_assigned;
  elsif v_instruction.order_type = 'food' then
    select exists(select 1 from public.fr_food_deliveries d
      where d.order_id = v_instruction.order_id and d.delivery_partner_id = v_uid) into v_assigned;
  elsif v_instruction.order_type = 'shop' then
    select exists(select 1 from public.shop_delivery_assignments a
      where a.order_id = v_instruction.order_id and a.driver_id = v_uid) into v_assigned;
  end if;
  if not v_assigned then
    raise exception 'Only the assigned driver can add arrival proof' using errcode = '42501';
  end if;

  if not exists (select 1 from storage.objects o
    where o.bucket_id = 'fr-delivery-instructions' and o.name = p_storage_path) then
    raise exception 'Arrival photo must be uploaded to the private delivery bucket first';
  end if;

  update public.fr_delivery_instructions
  set arrival_photo_path = p_storage_path, updated_at = pg_catalog.now()
  where id = p_instruction_id;
end;
$$;

revoke all on function public.fr_driver_set_delivery_arrival_photo(uuid, text) from public;
grant execute on function public.fr_driver_set_delivery_arrival_photo(uuid, text) to authenticated;


-- Only the actual customer may create the instruction row; drivers cannot
-- smuggle arrival proof or OTP state through INSERT.
create or replace function public.fr_is_delivery_order_customer(p_order_type text, p_order_id uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
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
    return exists(select 1 from public.shop_orders o where o.id=p_order_id and o.customer_id=v_uid);
  end if;
  return false;
end;
$$;
revoke all on function public.fr_is_delivery_order_customer(text,uuid) from public;
grant execute on function public.fr_is_delivery_order_customer(text,uuid) to authenticated;

drop policy if exists fr_delivery_instructions_insert_customer on public.fr_delivery_instructions;
create policy fr_delivery_instructions_insert_customer
on public.fr_delivery_instructions for insert to authenticated
with check (
  created_by = auth.uid()
  and public.fr_is_delivery_order_customer(order_type, order_id)
  and arrival_photo_path is null
  and delivery_otp_hash is null
  and delivery_otp_expires_at is null
  and delivery_otp_verified_at is null
);
