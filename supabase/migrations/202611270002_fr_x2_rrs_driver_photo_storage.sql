-- Project X2: RRS guest photo storage and RPC path
begin;
alter table public.fr_station_rides add column if not exists driver_photo_path text;
-- Reuse existing private driver-profile-photos bucket. RRS guest photo objects are limited to this folder.
drop policy if exists fr_x2_rrs_guest_photo_insert on storage.objects;
create policy fr_x2_rrs_guest_photo_insert on storage.objects for insert to anon,authenticated
with check (bucket_id='driver-profile-photos' and (storage.foldername(name))[1]='rrs-guest');
drop policy if exists fr_x2_rrs_guest_photo_read on storage.objects;
create policy fr_x2_rrs_guest_photo_read on storage.objects for select to anon,authenticated
using (bucket_id='driver-profile-photos' and (storage.foldername(name))[1]='rrs-guest');
create or replace view public.fr_station_live_rides_public as
 select id,ride_kind,driver_name,vehicle_number,driver_photo_path,from_label,to_label,fare,status,payment_method,passenger_capacity,passengers_booked,(passenger_capacity-passengers_booked) as passengers_remaining,created_at
 from public.fr_station_rides where status='live' and passengers_booked<passenger_capacity;
drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer);
create or replace function public.fr_station_post_rrs_guest(
 p_name text,p_phone text,p_vehicle text,p_from text,p_to text,p_fare numeric,p_passengers integer default 1,p_photo_path text default null
)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid;
begin
 if trim(coalesce(p_name,''))='' or p_phone !~ '^[0-9]{10}$' or trim(coalesce(p_vehicle,''))='' or trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0 or p_passengers not between 1 and 10 or coalesce(p_photo_path,'') !~ '^rrs-guest/[A-Za-z0-9-]+[.]jpg$'
 then raise exception 'Required RRS details, capacity and driver photo path are invalid'; end if;
 insert into public.fr_station_rides(ride_kind,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity,driver_photo_path)
 values('RRS',trim(p_name),p_phone,upper(trim(p_vehicle)),trim(p_from),trim(p_to),p_fare,p_passengers,p_photo_path) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,text) from public;
grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
