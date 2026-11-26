-- ERS/RRS station live-list privacy: never expose guest driver's phone in public LIVE rows.
begin;
create or replace view public.fr_station_live_rides_public as
 select id,ride_kind,driver_name,vehicle_number,from_label,to_label,fare,status,payment_method,created_at
 from public.fr_station_rides where status='live';
revoke all on public.fr_station_rides from anon,authenticated;
grant select on public.fr_station_live_rides_public to anon,authenticated;
notify pgrst,'reload schema';
commit;
-- Privacy condition: booking contacts only after confirmation.
begin;
create or replace function public.fr_station_my_bookings()
returns table(booking_id uuid,ride_id uuid,ride_kind text,driver_name text,driver_phone text,vehicle_number text,from_label text,to_label text,fare numeric,booking_status text,payment_method text,created_at timestamptz)
language sql security definer set search_path=public,auth
as $$
 select b.id,r.id,r.ride_kind,r.driver_name,case when b.status='confirmed' then r.driver_phone else null end,r.vehicle_number,r.from_label,r.to_label,r.fare,b.status,b.payment_method,b.created_at
 from public.fr_station_ride_bookings b join public.fr_station_rides r on r.id=b.ride_id
 where b.passenger_id=auth.uid() order by b.created_at desc limit 50
$$;
revoke all on function public.fr_station_my_bookings() from public,anon;
grant execute on function public.fr_station_my_bookings() to authenticated;
notify pgrst,'reload schema';
commit;
