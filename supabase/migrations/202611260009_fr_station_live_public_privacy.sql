-- ERS/RRS station live-list privacy: never expose guest driver's phone in public LIVE rows.
begin;
create or replace view public.fr_station_live_rides_public as
 select id,ride_kind,driver_name,vehicle_number,from_label,to_label,fare,status,payment_method,created_at
 from public.fr_station_rides where status='live';
revoke all on public.fr_station_rides from anon,authenticated;
grant select on public.fr_station_live_rides_public to anon,authenticated;
notify pgrst,'reload schema';
commit;
