-- Project X2: passenger cancellation for station ERS/RRS bookings
-- Restrict to the booking owner; restore seat availability atomically.
create or replace function public.fr_station_cancel_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $function$
declare
  v_booking public.fr_station_ride_bookings%rowtype;
  v_ride public.fr_station_rides%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Login required';
  end if;

  select * into v_booking
  from public.fr_station_ride_bookings
  where id = p_booking_id and passenger_id = auth.uid()
  for update;

  if not found then
    raise exception 'Booking not found or access denied';
  end if;

  if v_booking.status <> 'confirmed' then
    raise exception 'Only confirmed bookings can be cancelled';
  end if;

  select * into v_ride
  from public.fr_station_rides
  where id = v_booking.ride_id
  for update;

  if not found then
    raise exception 'Ride not found';
  end if;

  update public.fr_station_ride_bookings
  set status = 'cancelled'
  where id = p_booking_id and passenger_id = auth.uid() and status = 'confirmed';

  if not found then
    raise exception 'Booking is no longer cancellable';
  end if;

  update public.fr_station_rides
  set passengers_booked = greatest(0, passengers_booked - 1),
      status = case when status = 'booked' then 'live' else status end
  where id = v_ride.id;
end;
$function$;

revoke all on function public.fr_station_cancel_booking(uuid) from public, anon;
grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;
