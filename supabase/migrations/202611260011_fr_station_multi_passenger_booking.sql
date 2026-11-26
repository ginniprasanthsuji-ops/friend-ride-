-- ERS/RRS multiple passenger booking per customer, with locked seat-capacity accounting. QA branch only.
begin;
alter table public.fr_station_ride_bookings add column if not exists passenger_count integer not null default 1 check(passenger_count between 1 and 10);
create or replace function public.fr_station_book_ride(p_ride_id uuid,p_passengers integer default 1)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_booking uuid; v_ride public.fr_station_rides%rowtype;
begin
 if auth.uid() is null then raise exception 'Customer login required'; end if;
 if p_passengers not between 1 and 10 then raise exception 'Passenger count must be 1-10'; end if;
 select * into v_ride from public.fr_station_rides where id=p_ride_id and status='live' for update;
 if not found then raise exception 'Ride is not available'; end if;
 if v_ride.driver_id=auth.uid() then raise exception 'Cannot book own ride'; end if;
 if v_ride.passengers_booked+p_passengers > v_ride.passenger_capacity then raise exception 'Only % passenger seats remaining',v_ride.passenger_capacity-v_ride.passengers_booked; end if;
 if exists(select 1 from public.fr_station_ride_bookings where ride_id=p_ride_id and passenger_id=auth.uid() and status in ('requested','confirmed')) then raise exception 'You already booked this ride'; end if;
 insert into public.fr_station_ride_bookings(ride_id,passenger_id,status,passenger_count) values(p_ride_id,auth.uid(),'confirmed',p_passengers) returning id into v_booking;
 update public.fr_station_rides set passengers_booked=passengers_booked+p_passengers,status=case when passengers_booked+p_passengers>=passenger_capacity then 'booked' else 'live' end where id=p_ride_id;
 return v_booking;
end $$;
create or replace function public.fr_station_my_bookings()
returns table(booking_id uuid,ride_id uuid,ride_kind text,driver_name text,driver_phone text,vehicle_number text,from_label text,to_label text,fare numeric,booking_status text,payment_method text,passenger_count integer,created_at timestamptz)
language sql security definer set search_path=public,auth
as $$
 select b.id,r.id,r.ride_kind,r.driver_name,case when b.status='confirmed' then r.driver_phone else null end,r.vehicle_number,r.from_label,r.to_label,r.fare,b.status,b.payment_method,b.passenger_count,b.created_at
 from public.fr_station_ride_bookings b join public.fr_station_rides r on r.id=b.ride_id
 where b.passenger_id=auth.uid() order by b.created_at desc limit 50
$$;
revoke all on function public.fr_station_book_ride(uuid,integer) from public,anon;
grant execute on function public.fr_station_book_ride(uuid,integer) to authenticated;
revoke all on function public.fr_station_my_bookings() from public,anon;
grant execute on function public.fr_station_my_bookings() to authenticated;
notify pgrst,'reload schema';
commit;
