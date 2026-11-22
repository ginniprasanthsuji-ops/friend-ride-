-- FRIEND RIDE Laundry Services workflow
-- Uses the existing shared service bookings and provider applications tables.
alter table public.fr_service_bookings
  add column if not exists laundry_unit text,
  add column if not exists laundry_quantity numeric(8,2),
  add column if not exists laundry_unit_price numeric(10,2);

do $$ begin
  alter table public.fr_service_bookings
    add constraint fr_service_bookings_laundry_unit_check
    check (laundry_unit is null or laundry_unit in ('kg','piece'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.fr_service_bookings
    add constraint fr_service_bookings_laundry_quantity_check
    check (laundry_quantity is null or (laundry_quantity > 0 and laundry_quantity <= 200));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.fr_service_bookings
    add constraint fr_service_bookings_laundry_unit_price_check
    check (laundry_unit_price is null or laundry_unit_price > 0);
exception when duplicate_object then null; end $$;

create or replace function public.fr_laundry_provider_transition(
  p_booking_id uuid,
  p_action text
) returns public.fr_service_bookings
language plpgsql security definer
set search_path = public, auth
as $$
declare v_row public.fr_service_bookings;
declare v_next text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_action not in ('accept','start','complete') then raise exception 'Invalid action'; end if;
  select * into v_row from public.fr_service_bookings
   where id=p_booking_id and service_type='laundry'
     and assigned_provider_id=auth.uid()
   for update;
  if not found then raise exception 'Assigned Laundry booking not found'; end if;
  if p_action='accept' and v_row.status='assigned' then v_next:='accepted';
  elsif p_action='start' and v_row.status='accepted' then v_next:='in_progress';
  elsif p_action='complete' and v_row.status='in_progress' then v_next:='completed';
  else raise exception 'Invalid Laundry status transition'; end if;
  update public.fr_service_bookings set status=v_next,updated_at=now()
   where id=p_booking_id returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.fr_laundry_provider_transition(uuid,text) from public;
grant execute on function public.fr_laundry_provider_transition(uuid,text) to authenticated;
