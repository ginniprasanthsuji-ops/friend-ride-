-- Project X2 transfer to YT Test 1-15: atomic, owner-scoped ERS/RRS cancellation.
begin;
create or replace function public.fr_station_cancel_booking(p_booking_id uuid)
returns boolean language plpgsql security definer set search_path=public,auth
as $$
declare
  v_booking public.fr_station_ride_bookings%rowtype;
  v_ride public.fr_station_rides%rowtype;
  v_ride_id uuid;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;

  select ride_id into v_ride_id
  from public.fr_station_ride_bookings
  where id=p_booking_id and passenger_id=auth.uid();
  if not found then raise exception 'Booking not found or not yours'; end if;

  select * into v_ride from public.fr_station_rides where id=v_ride_id for update;
  if not found then raise exception 'Ride not found'; end if;

  select * into v_booking
  from public.fr_station_ride_bookings
  where id=p_booking_id and passenger_id=auth.uid()
  for update;
  if not found then raise exception 'Booking not found or not yours'; end if;
  if v_booking.status not in ('requested','confirmed') then raise exception 'Booking is not cancellable'; end if;
  if v_ride.status not in ('live','booked') then raise exception 'Ride is no longer cancellable'; end if;

  update public.fr_station_ride_bookings set status='cancelled'
  where id=v_booking.id and passenger_id=auth.uid() and status in ('requested','confirmed');
  if not found then raise exception 'Booking is no longer cancellable'; end if;

  update public.fr_station_rides
  set passengers_booked=greatest(0,passengers_booked-v_booking.passenger_count),
      status='live'
  where id=v_ride.id and status in ('live','booked');

  return true;
end $$;
revoke all on function public.fr_station_cancel_booking(uuid) from public,anon;
grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
