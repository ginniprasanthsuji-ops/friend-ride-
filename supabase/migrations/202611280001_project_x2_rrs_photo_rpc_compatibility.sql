-- Project X2 compatibility correction: restore frontend RRS photo-data RPC signature.
-- This supersedes the alternate storage-path RPC migration and matches index.html.
begin;
drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,text);
drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text);
create or replace function public.fr_station_post_rrs_guest(
 p_name text,p_phone text,p_vehicle text,p_from text,p_to text,p_fare numeric,
 p_passengers integer,p_departure_at timestamptz,p_photo_data text
) returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid; v_photo_bytes integer;
begin
 if trim(coalesce(p_name,''))='' or p_phone !~ '^[0-9]{10}$' or trim(coalesce(p_vehicle,''))=''
    or trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0
    or p_passengers not between 1 and 10 or p_departure_at is null or p_departure_at<=now()
    or p_photo_data is null or p_photo_data !~ '^data:image/jpeg;base64,'
 then raise exception 'Name, 10-digit mobile, vehicle, route, fare, seats, future departure and compressed driver photo required'; end if;
 v_photo_bytes:=floor(length(split_part(p_photo_data,',',2))*3/4);
 if v_photo_bytes>1048576 or length(p_photo_data)>1400000 then raise exception 'Compressed RRS driver photo must be at most 1 MB'; end if;
 insert into public.fr_station_rides(ride_kind,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity,departure_at,driver_photo_data)
 values('RRS',trim(p_name),p_phone,upper(trim(p_vehicle)),trim(p_from),trim(p_to),p_fare,p_passengers,p_departure_at,p_photo_data) returning id into v_id;
 return v_id;
end $$;
revoke all on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text) from public;
grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
