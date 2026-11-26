-- ERS/RRS backend functions missing from schema cache: create standalone branch-safe tables/RPCs.
create table if not exists public.fr_ers_rrs_rides (
 id uuid primary key default gen_random_uuid(), driver_id uuid not null references auth.users(id) on delete cascade,
 from_label text not null,to_label text not null,fare numeric(10,2) not null check(fare>0),
 departure_at timestamptz not null,status text not null default 'open' check(status in ('open','cancelled','completed')),
 route_note text,pickup_radius_km numeric default 3,created_at timestamptz not null default now()
);
create table if not exists public.fr_ers_rrs_bookings (
 id uuid primary key default gen_random_uuid(),ride_id uuid not null references public.fr_ers_rrs_rides(id) on delete cascade,
 passenger_id uuid not null references auth.users(id) on delete cascade,
 pickup_label text not null,drop_label text not null,status text not null default 'requested' check(status in ('requested','confirmed','cancelled','completed')),
 payment_method text not null default 'cash' check(payment_method='cash'),created_at timestamptz not null default now(),
 unique(ride_id,passenger_id)
);
alter table public.fr_ers_rrs_rides enable row level security;
alter table public.fr_ers_rrs_bookings enable row level security;
drop policy if exists fr_ers_rrs_rides_select on public.fr_ers_rrs_rides;
create policy fr_ers_rrs_rides_select on public.fr_ers_rrs_rides for select to authenticated using(status='open' or driver_id=auth.uid());
drop policy if exists fr_ers_rrs_rides_insert on public.fr_ers_rrs_rides;
create policy fr_ers_rrs_rides_insert on public.fr_ers_rrs_rides for insert to authenticated with check(driver_id=auth.uid());
drop policy if exists fr_ers_rrs_rides_update on public.fr_ers_rrs_rides;
create policy fr_ers_rrs_rides_update on public.fr_ers_rrs_rides for update to authenticated using(driver_id=auth.uid()) with check(driver_id=auth.uid());
drop policy if exists fr_ers_rrs_bookings_select on public.fr_ers_rrs_bookings;
create policy fr_ers_rrs_bookings_select on public.fr_ers_rrs_bookings for select to authenticated using(passenger_id=auth.uid() or exists(select 1 from public.fr_ers_rrs_rides r where r.id=ride_id and r.driver_id=auth.uid()));
drop policy if exists fr_ers_rrs_bookings_insert on public.fr_ers_rrs_bookings;
create policy fr_ers_rrs_bookings_insert on public.fr_ers_rrs_bookings for insert to authenticated with check(passenger_id=auth.uid());
grant select,insert,update on public.fr_ers_rrs_rides to authenticated;
grant select,insert,update on public.fr_ers_rrs_bookings to authenticated;
create or replace function public.fr_road_ride_create(p_from_label text,p_to_label text,p_fare numeric,p_departure_at timestamptz,p_booking_cutoff_at timestamptz default null,p_route_note text default null,p_from_lat numeric default null,p_from_lng numeric default null,p_to_lat numeric default null,p_to_lng numeric default null,p_pickup_radius_km numeric default 3)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if trim(coalesce(p_from_label,''))='' or trim(coalesce(p_to_label,''))='' or p_fare<=0 or p_departure_at<=now() then raise exception 'Enter valid route, fare and future departure'; end if;
 insert into public.fr_ers_rrs_rides(driver_id,from_label,to_label,fare,departure_at,route_note,pickup_radius_km)
 values(auth.uid(),trim(p_from_label),trim(p_to_label),p_fare,p_departure_at,p_route_note,coalesce(p_pickup_radius_km,3)) returning id into v_id;
 return v_id;
end $$;
create or replace function public.fr_road_ride_book(p_ride_id uuid,p_pickup_label text,p_drop_label text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if trim(coalesce(p_pickup_label,''))='' or trim(coalesce(p_drop_label,''))='' then raise exception 'Pickup and drop required'; end if;
 if not exists(select 1 from public.fr_ers_rrs_rides where id=p_ride_id and status='open' and departure_at>now() and driver_id<>auth.uid()) then raise exception 'Ride unavailable or cannot book own ride'; end if;
 insert into public.fr_ers_rrs_bookings(ride_id,passenger_id,pickup_label,drop_label,payment_method)
 values(p_ride_id,auth.uid(),trim(p_pickup_label),trim(p_drop_label),'cash') returning id into v_id;
 return v_id;
end $$;
create or replace function public.fr_phase13d_list_ers_rrs_bookings()
returns table(id uuid,pickup_text text,drop_text text,fare_offer numeric,status text,driver_display_name text,departure_at timestamptz,station_type text)
language sql security definer set search_path=public as $$
 select r.id,r.from_label,r.to_label,r.fare,r.status,coalesce(p.full_name,'Driver'),r.departure_at,'RRS'
 from public.fr_ers_rrs_rides r left join public.profiles p on p.id=r.driver_id
 where r.status='open' and r.departure_at>now()
 order by r.departure_at asc limit 60
$$;
revoke all on function public.fr_road_ride_create(text,text,numeric,timestamptz,timestamptz,text,numeric,numeric,numeric,numeric,numeric) from public;
revoke all on function public.fr_road_ride_book(uuid,text,text) from public;
revoke all on function public.fr_phase13d_list_ers_rrs_bookings() from public;
grant execute on function public.fr_road_ride_create(text,text,numeric,timestamptz,timestamptz,text,numeric,numeric,numeric,numeric,numeric) to authenticated;
grant execute on function public.fr_road_ride_book(uuid,text,text) to authenticated;
grant execute on function public.fr_phase13d_list_ers_rrs_bookings() to authenticated;
