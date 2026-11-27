-- Project X2: ERS/RRS departure and RRS guest photo backend. YT 1–15 QA branch only.
begin;
alter table public.fr_station_rides add column if not exists departure_at timestamptz;
alter table public.fr_station_rides add column if not exists driver_photo_data text;

create or replace view public.fr_station_live_rides_public as
 select id,ride_kind,driver_name,vehicle_number,from_label,to_label,fare,status,payment_method,
        passenger_capacity,passengers_booked,(passenger_capacity-passengers_booked) as passengers_remaining,
        created_at,departure_at
 from public.fr_station_rides where status='live' and passengers_booked < passenger_capacity;
grant select on public.fr_station_live_rides_public to anon,authenticated;

-- Remove prior RPC signatures, including the legacy 3-argument and capacity 4-argument forms.
drop function if exists public.fr_station_post_ers(text,text,numeric,integer,timestamptz);
drop function if exists public.fr_station_post_ers(text,text,numeric,integer);
drop function if exists public.fr_station_post_ers(text,text,numeric);
create or replace function public.fr_station_post_ers(
 p_from text,p_to text,p_fare numeric,p_passengers integer,p_departure_at timestamptz
) returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid; v_name text; v_phone text; v_vehicle text;
begin
 if auth.uid() is null then raise exception 'Registered driver login required'; end if;
 select full_name,phone,vehicle_number into v_name,v_phone,v_vehicle
 from public.profiles where id=auth.uid() and role='driver'
 and lower(coalesce(driver_approval_status,'')) in ('approved','verified','active');
 if v_name is null or v_phone is null or v_vehicle is null then raise exception 'Approved registered driver profile with name, mobile and vehicle number required'; end if;
 if trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0
    or p_passengers not between 1 and 10 or p_departure_at is null or p_departure_at<=now()
 then raise exception 'From, To, positive fare, capacity 1-10 and future departure time required'; end if;
 insert into public.fr_station_rides(ride_kind,driver_id,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity,departure_at)
 values('ERS',auth.uid(),v_name,v_phone,v_vehicle,trim(p_from),trim(p_to),p_fare,p_passengers,p_departure_at) returning id into v_id;
 return v_id;
end $$;

drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text);
drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer);
drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric);
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

create or replace function public.fr_station_my_bookings()
returns table(booking_id uuid,ride_id uuid,ride_kind text,driver_name text,driver_phone text,vehicle_number text,
 from_label text,to_label text,fare numeric,booking_status text,payment_method text,created_at timestamptz,
 departure_at timestamptz,driver_photo_data text)
language sql security definer set search_path=public,auth
as $$
 select b.id,r.id,r.ride_kind,r.driver_name,
        case when b.status='confirmed' then r.driver_phone else null end,
        r.vehicle_number,r.from_label,r.to_label,r.fare,b.status,b.payment_method,b.created_at,r.departure_at,
        case when b.status='confirmed' and r.ride_kind='RRS' then r.driver_photo_data else null end
 from public.fr_station_ride_bookings b join public.fr_station_rides r on r.id=b.ride_id
 where b.passenger_id=auth.uid() order by b.created_at desc limit 50
$$;
revoke all on function public.fr_station_post_ers(text,text,numeric,integer,timestamptz) from public,anon;
revoke all on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text) from public;
grant execute on function public.fr_station_post_ers(text,text,numeric,integer,timestamptz) to authenticated;
grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text) to anon,authenticated;
revoke all on function public.fr_station_my_bookings() from public,anon;
grant execute on function public.fr_station_my_bookings() to authenticated;
notify pgrst,'reload schema';
commit;
