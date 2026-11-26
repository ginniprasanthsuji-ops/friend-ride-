-- FRIEND RIDE Phase 13D QA draft: ERS/RRS booking + cash-only persistence
-- QA ONLY. Review schema, permissions, and RPC deployment before applying to any Supabase project.
begin;

create table if not exists public.fr_phase13d_ers_rrs_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  ride_kind text not null check (ride_kind in ('ERS','RRS')),
  pickup_text text not null,
  drop_text text not null,
  fare_offer numeric(10,2) not null check (fare_offer > 0),
  driver_id uuid references auth.users(id),
  status text not null default 'pending' check (status in ('pending','assigned','cancelled','completed')),
  payment_method text not null default 'cash' check (payment_method = 'cash'),
  payment_status text not null default 'cash_pending' check (payment_status in ('cash_pending','cash_received')),
  cash_received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((payment_status='cash_pending' and cash_received_at is null) or
         (payment_status='cash_received' and cash_received_at is not null))
);

alter table public.fr_phase13d_ers_rrs_bookings enable row level security;
revoke all on public.fr_phase13d_ers_rrs_bookings from anon, authenticated;

create or replace function public.fr_phase13d_create_ers_rrs_booking(
  p_ride_kind text, p_pickup_text text, p_drop_text text, p_fare_offer numeric
) returns uuid
language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_ride_kind not in ('ERS','RRS') then raise exception 'Invalid ride kind'; end if;
  if length(trim(coalesce(p_pickup_text,''))) < 3 or length(trim(coalesce(p_drop_text,''))) < 3 then
    raise exception 'Pickup and drop are required';
  end if;
  if p_fare_offer is null or p_fare_offer <= 0 then raise exception 'Fare must be greater than zero'; end if;
  insert into public.fr_phase13d_ers_rrs_bookings(customer_id,ride_kind,pickup_text,drop_text,fare_offer,payment_method,payment_status)
  values(auth.uid(),p_ride_kind,trim(p_pickup_text),trim(p_drop_text),p_fare_offer,'cash','cash_pending')
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.fr_phase13d_assign_ers_rrs_booking(p_booking_id uuid,p_driver_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $$
begin
  if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;
  if p_driver_id is null then raise exception 'Driver required'; end if;
  update public.fr_phase13d_ers_rrs_bookings
    set driver_id=p_driver_id,status='assigned',updated_at=now()
    where id=p_booking_id and status='pending' and driver_id is null;
  if not found then raise exception 'Booking unavailable or already assigned'; end if;
end $$;

create or replace function public.fr_phase13d_driver_complete_ers_rrs_ride(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.fr_phase13d_ers_rrs_bookings
    set status='completed',updated_at=now()
    where id=p_booking_id and driver_id=auth.uid() and status='assigned';
  if not found then raise exception 'Only the assigned driver can complete an assigned ride'; end if;
end $;

create or replace function public.fr_phase13d_driver_confirm_cash(p_booking_id uuid)
returns void language plpgsql security definer set search_path=public,auth
as $
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.fr_phase13d_ers_rrs_bookings
    set payment_status='cash_received',cash_received_at=now(),updated_at=now()
    where id=p_booking_id and driver_id=auth.uid() and status='completed'
      and payment_method='cash' and payment_status='cash_pending';
  if not found then raise exception 'Assigned driver can confirm cash only after ride completion'; end if;
end $;

create or replace function public.fr_phase13d_list_ers_rrs_bookings()
returns setof public.fr_phase13d_ers_rrs_bookings
language sql security definer set search_path=public,auth
as $$
  select * from public.fr_phase13d_ers_rrs_bookings
  where auth.uid() is not null and public.is_friend_ride_admin()
  order by created_at desc limit 200
$$;

create or replace function public.fr_phase13d_get_my_ers_rrs_bookings()
returns setof public.fr_phase13d_ers_rrs_bookings
language sql security definer set search_path=public,auth
as $$
  select * from public.fr_phase13d_ers_rrs_bookings
  where auth.uid() is not null and (customer_id=auth.uid() or driver_id=auth.uid())
  order by created_at desc limit 100
$$;

revoke all on function public.fr_phase13d_create_ers_rrs_booking(text,text,text,numeric) from public,anon;
revoke all on function public.fr_phase13d_assign_ers_rrs_booking(uuid,uuid) from public,anon;
revoke all on function public.fr_phase13d_driver_complete_ers_rrs_ride(uuid) from public,anon;
revoke all on function public.fr_phase13d_driver_confirm_cash(uuid) from public,anon;
revoke all on function public.fr_phase13d_list_ers_rrs_bookings() from public,anon;
revoke all on function public.fr_phase13d_get_my_ers_rrs_bookings() from public,anon;
grant execute on function public.fr_phase13d_create_ers_rrs_booking(text,text,text,numeric) to authenticated;
grant execute on function public.fr_phase13d_assign_ers_rrs_booking(uuid,uuid) to authenticated;
grant execute on function public.fr_phase13d_driver_complete_ers_rrs_ride(uuid) to authenticated;
grant execute on function public.fr_phase13d_driver_confirm_cash(uuid) to authenticated;
grant execute on function public.fr_phase13d_list_ers_rrs_bookings() to authenticated;
grant execute on function public.fr_phase13d_get_my_ers_rrs_bookings() to authenticated;

commit;
