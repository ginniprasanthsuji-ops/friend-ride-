-- DRAFT ONLY — do not apply until reviewed and approved.
-- Phase 13 Shared Ride authorization and client-privilege hardening.
-- QA review artifact only; not a migration and not applied to any database.
-- Current source branch index.html has no Shared Ride UI/RPC references; this
-- draft hardens the QA database's exposed Shared Ride functions/table ACLs only.

begin;

create or replace function public.fr_shared_ride_create(
  p_vehicle_type text,
  p_from_label text,
  p_to_label text,
  p_total_seats integer,
  p_price_per_seat numeric,
  p_departure_at timestamptz,
  p_booking_cutoff_at timestamptz default null,
  p_from_lat double precision default null,
  p_from_lng double precision default null,
  p_to_lat double precision default null,
  p_to_lng double precision default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved'
  ) then raise exception 'Approved driver account required'; end if;
  if p_vehicle_type is null or p_vehicle_type not in ('auto','car') then raise exception 'Vehicle type must be auto or car'; end if;
  if p_from_label is null or length(trim(p_from_label))=0 or p_to_label is null or length(trim(p_to_label))=0 then raise exception 'Route labels required'; end if;
  if p_total_seats is null or p_total_seats<1 or p_total_seats>12 then raise exception 'Invalid passenger seat capacity'; end if;
  if p_price_per_seat is null or p_price_per_seat<0 then raise exception 'Fare cannot be negative'; end if;
  if p_departure_at is null or p_departure_at<=now() then raise exception 'Departure must be in the future'; end if;
  if p_booking_cutoff_at is not null and (p_booking_cutoff_at<=now() or p_booking_cutoff_at>=p_departure_at) then raise exception 'Booking cutoff must be future and before departure'; end if;
  if (p_from_lat is null)<>(p_from_lng is null) or (p_to_lat is null)<>(p_to_lng is null) then raise exception 'Latitude and longitude must be provided as pairs'; end if;
  if p_from_lat is not null and (p_from_lat < -90 or p_from_lat > 90 or p_from_lng < -180 or p_from_lng > 180) then raise exception 'Invalid origin coordinates'; end if;
  if p_to_lat is not null and (p_to_lat < -90 or p_to_lat > 90 or p_to_lng < -180 or p_to_lng > 180) then raise exception 'Invalid destination coordinates'; end if;
  insert into public.fr_shared_rides(driver_id,vehicle_type,from_label,to_label,total_seats,price_per_seat,departure_at,booking_cutoff_at,from_lat,from_lng,to_lat,to_lng)
  values(auth.uid(),p_vehicle_type,p_from_label,p_to_label,p_total_seats,p_price_per_seat,p_departure_at,p_booking_cutoff_at,p_from_lat,p_from_lng,p_to_lat,p_to_lng)
  returning id into v_id;
  insert into public.fr_shared_ride_events(ride_id,actor_id,event_type,details)
  values(v_id,auth.uid(),'ride_created',jsonb_build_object('vehicle_type',p_vehicle_type,'from',p_from_label,'to',p_to_label,'seats',p_total_seats,'price_per_seat',p_price_per_seat,'departure_at',p_departure_at));
  return v_id;
end;
$function$;

create or replace function public.fr_shared_ride_book_seats(
  p_ride_id uuid,
  p_seats integer,
  p_pickup_label text,
  p_drop_label text
)
returns table(booking_id uuid,amount numeric,seats_remaining integer)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.fr_shared_rides%rowtype; v_booking uuid; v_amount numeric;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then raise exception 'Customer account required'; end if;
  if p_ride_id is null then raise exception 'Ride ID required'; end if;
  if p_seats is null or p_seats<1 or p_seats>12 then raise exception 'Invalid seat count'; end if;
  if p_pickup_label is null or length(trim(p_pickup_label))=0 or p_drop_label is null or length(trim(p_drop_label))=0 then raise exception 'Pickup and drop labels required'; end if;
  select * into v_ride from public.fr_shared_rides where id=p_ride_id for update;
  if not found then raise exception 'Ride not found'; end if;
  if v_ride.driver_id=auth.uid() then raise exception 'Driver cannot book own ride'; end if;
  if v_ride.status not in ('live','full') then raise exception 'Ride is not open for booking'; end if;
  if v_ride.departure_at<=now() then raise exception 'Ride departure has passed'; end if;
  if v_ride.booking_cutoff_at is not null and now()>=v_ride.booking_cutoff_at then raise exception 'Booking cutoff has passed'; end if;
  if v_ride.total_seats-v_ride.booked_seats<p_seats then raise exception 'Not enough seats available'; end if;
  if exists(select 1 from public.fr_shared_ride_bookings b where b.ride_id=p_ride_id and b.passenger_id=auth.uid() and b.status not in ('cancelled','refunded')) then raise exception 'Passenger already has an active booking on this ride'; end if;
  v_amount:=v_ride.price_per_seat*p_seats;
  insert into public.fr_shared_ride_bookings(ride_id,passenger_id,seats_booked,pickup_label,drop_label,fare_per_seat_snapshot,total_fare,status)
  values(p_ride_id,auth.uid(),p_seats,p_pickup_label,p_drop_label,v_ride.price_per_seat,v_amount,'booking_pending')
  returning id into v_booking;
  update public.fr_shared_rides set booked_seats=booked_seats+p_seats,status=case when booked_seats+p_seats>=total_seats then 'full' else 'live' end,updated_at=now()
  where id=p_ride_id;
  insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details)
  values(p_ride_id,v_booking,auth.uid(),'seat_booking_created',jsonb_build_object('seats',p_seats,'amount',v_amount,'pickup',p_pickup_label,'drop',p_drop_label));
  return query select v_booking,v_amount,v_ride.total_seats-v_ride.booked_seats-p_seats;
end;
$function$;

-- Booking confirmation is driver-owned and restricted to an approved driver.
create or replace function public.fr_shared_ride_confirm_booking(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride_id uuid; v_driver_id uuid; v_ride_status text;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then
    raise exception 'Approved driver account required';
  end if;
  select b.ride_id,r.driver_id,r.status into v_ride_id,v_driver_id,v_ride_status
  from public.fr_shared_ride_bookings b
  join public.fr_shared_rides r on r.id=b.ride_id
  where b.id=p_booking_id and b.status='booking_pending'
  for update of b,r;
  if not found then raise exception 'Pending booking unavailable'; end if;
  if v_driver_id<>auth.uid() then raise exception 'Only the assigned driver can confirm this booking'; end if;
  if v_ride_status not in ('live','full') then raise exception 'Ride is not open for confirmation'; end if;
  update public.fr_shared_ride_bookings set status='confirmed',updated_at=now()
  where id=p_booking_id and status='booking_pending';
  insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details)
  values(v_ride_id,p_booking_id,auth.uid(),'booking_confirmed',jsonb_build_object('booking_status','confirmed'));
  return true;
end;
$function$;

-- Contact disclosure is per booking and only to its confirmed passenger/driver.
-- It returns the counterpart's phone, never all passengers on the ride.
create or replace function public.fr_shared_ride_get_booking_contacts(p_booking_id uuid)
returns table(contact_role text,contact_name text,contact_phone text)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_booking public.fr_shared_ride_bookings%rowtype; v_driver_id uuid; v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'Login required'; end if;
  select * into v_booking from public.fr_shared_ride_bookings b where b.id=p_booking_id;
  if not found then raise exception 'Booking not found'; end if;
  select r.driver_id into v_driver_id from public.fr_shared_rides r where r.id=v_booking.ride_id;
  if not found then raise exception 'Ride not found'; end if;
  if v_booking.status not in ('confirmed','boarding','in_progress') then
    raise exception 'Contact details are available only for a confirmed active booking';
  end if;
  if v_uid=v_driver_id then
    return query select 'passenger'::text,p.full_name,
      coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))::text
      from public.profiles p where p.id=v_booking.passenger_id and p.role='customer';
    return;
  end if;
  if v_uid=v_booking.passenger_id then
    return query select 'driver'::text,p.full_name,
      coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))::text
      from public.profiles p where p.id=v_driver_id and p.role='driver' and p.driver_approval_status='approved';
    return;
  end if;
  raise exception 'Contact details are restricted to the confirmed booking participants';
end;
$function$;

-- Explicit RPC execution grants; no anonymous/public invocation.
revoke all on function public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) from public,anon;
revoke all on function public.fr_shared_ride_book_seats(uuid,integer,text,text) from public,anon;
revoke all on function public.fr_shared_ride_confirm_booking(uuid) from public,anon;
revoke all on function public.fr_shared_ride_get_booking_contacts(uuid) from public,anon;
revoke all on function public.fr_shared_ride_is_passenger(uuid) from public,anon;
grant execute on function public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) to authenticated;
grant execute on function public.fr_shared_ride_book_seats(uuid,integer,text,text) to authenticated;
grant execute on function public.fr_shared_ride_confirm_booking(uuid) to authenticated;
grant execute on function public.fr_shared_ride_get_booking_contacts(uuid) to authenticated;
grant execute on function public.fr_shared_ride_is_passenger(uuid) to authenticated;

-- Direct client writes are not the supported contract; the SECURITY DEFINER RPCs above are.
drop policy if exists fr_shared_rides_driver_insert on public.fr_shared_rides;
drop policy if exists fr_shared_rides_driver_update on public.fr_shared_rides;
drop policy if exists fr_shared_bookings_passenger_insert on public.fr_shared_ride_bookings;
drop policy if exists fr_shared_bookings_participant_update on public.fr_shared_ride_bookings;

revoke all privileges on table public.fr_shared_rides,public.fr_shared_ride_bookings,public.fr_shared_ride_events,public.fr_shared_ride_payments from anon,authenticated;
grant select on table public.fr_shared_rides,public.fr_shared_ride_bookings,public.fr_shared_ride_events,public.fr_shared_ride_payments to authenticated;

-- Remove unsafe TRUNCATE grants found on client roles across the current public schema.
revoke truncate on all tables in schema public from anon,authenticated;

commit;

-- Review before application:
-- * Source branch currently has no Shared Ride UI/API wiring; do not assume this feature is live.
-- * The Shared Ride confirmation/contact/payment/cancel RPC workflow is incomplete.
-- * Apply only to the dedicated QA project after a review; then test approved-driver,
--   pending-driver, customer, partner, anonymous, and admin role behavior.
-- * This draft has not been applied or runtime-tested.
