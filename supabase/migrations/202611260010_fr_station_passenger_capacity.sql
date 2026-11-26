-- ERS/RRS passenger capacity and live seat decrement. QA branch only.
begin;
alter table public.fr_station_rides add column if not exists passenger_capacity integer not null default 1 check(passenger_capacity between 1 and 10);
alter table public.fr_station_rides add column if not exists passengers_booked integer not null default 0 check(passengers_booked between 0 and passenger_capacity);
create or replace view public.fr_station_live_rides_public as
 select id,ride_kind,driver_name,vehicle_number,from_label,to_label,fare,status,payment_method,passenger_capacity,passengers_booked,(passenger_capacity-passengers_booked) as passengers_remaining,created_at
 from public.fr_station_rides where status='live' and passengers_booked < passenger_capacity;
create or replace function public.fr_station_post_ers(p_from text,p_to text,p_fare numeric,p_passengers integer default 1)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid; v_name text; v_phone text; v_vehicle text;
begin
 if auth.uid() is null then raise exception 'Registered driver login required'; end if;
 select full_name,phone,vehicle_number into v_name,v_phone,v_vehicle from public.profiles where id=auth.uid() and role='driver' and lower(coalesce(driver_approval_status,'')) in ('approved','verified','active');
 if v_name is null or v_phone is null or v_vehicle is null then raise exception 'Approved registered driver profile with name, mobile and vehicle number required'; end if;
 if trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0 or p_passengers not between 1 and 10 then raise exception 'From, To, positive fare, and passenger capacity 1-10 required'; end if;
 insert into public.fr_station_rides(ride_kind,driver_id,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity)
 values('ERS',auth.uid(),v_name,v_phone,v_vehicle,trim(p_from),trim(p_to),p_fare,p_passengers) returning id into v_id;
 return v_id;
end $$;
create or replace function public.fr_station_post_rrs_guest(p_name text,p_phone text,p_vehicle text,p_from text,p_to text,p_fare numeric,p_passengers integer default 1)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_id uuid;
begin
 if trim(coalesce(p_name,''))='' or p_phone !~ '^[0-9]{10}$' or trim(coalesce(p_vehicle,''))='' or trim(coalesce(p_from,''))='' or trim(coalesce(p_to,''))='' or p_fare<=0 or p_passengers not between 1 and 10 then raise exception 'Name, 10-digit mobile, vehicle number, From, To, positive fare and passenger capacity 1-10 required'; end if;
 insert into public.fr_station_rides(ride_kind,driver_name,driver_phone,vehicle_number,from_label,to_label,fare,passenger_capacity)
 values('RRS',trim(p_name),p_phone,upper(trim(p_vehicle)),trim(p_from),trim(p_to),p_fare,p_passengers) returning id into v_id;
 return v_id;
end $$;
create or replace function public.fr_station_book_ride(p_ride_id uuid)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_booking uuid; v_ride public.fr_station_rides%rowtype;
begin
 if auth.uid() is null then raise exception 'Customer login required'; end if;
 select * into v_ride from public.fr_station_rides where id=p_ride_id and status='live' for update;
 if not found then raise exception 'Ride is not available'; end if;
 if v_ride.driver_id=auth.uid() then raise exception 'Cannot book own ride'; end if;
 if v_ride.passengers_booked >= v_ride.passenger_capacity then raise exception 'No passenger seats left'; end if;
 if exists(select 1 from public.fr_station_ride_bookings where ride_id=p_ride_id and passenger_id=auth.uid() and status in ('requested','confirmed')) then raise exception 'You already booked this ride'; end if;
 insert into public.fr_station_ride_bookings(ride_id,passenger_id,status) values(p_ride_id,auth.uid(),'confirmed') returning id into v_booking;
 update public.fr_station_rides set passengers_booked=passengers_booked+1,status=case when passengers_booked+1>=passenger_capacity then 'booked' else 'live' end where id=p_ride_id;
 return v_booking;
end $$;
notify pgrst,'reload schema';
commit;
