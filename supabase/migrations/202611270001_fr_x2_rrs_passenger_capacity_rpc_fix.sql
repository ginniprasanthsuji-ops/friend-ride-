-- Project X2: RRS guest post passenger capacity and RPC contract fix
-- Branch: yt-test-1-to-15 only
begin;
alter table public.fr_station_rides
  add column if not exists passenger_capacity integer not null default 1
  check (passenger_capacity between 1 and 10);

create or replace function public.fr_station_post_rrs_guest(
  p_name text,
  p_phone text,
  p_vehicle text,
  p_from text,
  p_to text,
  p_fare numeric,
  p_passengers integer default 1
)
returns uuid
language plpgsql
security definer
set search_path=public,auth
as $$
declare v_id uuid;
begin
 if trim(coalesce(p_name,''))='' or p_phone !~ '^[0-9]{10}$'
   or trim(coalesce(p_vehicle,''))='' or trim(coalesce(p_from,''))=''
   or trim(coalesce(p_to,''))='' or p_fare<=0
   or p_passengers not between 1 and 10
 then
   raise exception 'Name, 10-digit mobile, vehicle number, From, To, positive fare and passenger capacity 1-10 are required';
 end if;
 insert into public.fr_station_rides(
   ride_kind,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity
 )
 values(
   'RRS',trim(p_name),p_phone,upper(trim(p_vehicle)),trim(p_from),trim(p_to),p_fare,p_passengers
 )
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer) from public;
grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer) to anon,authenticated;
notify pgrst,'reload schema';
commit;
