-- Station rides seat request and passenger booking list (cash only), QA branch.
begin;
create table if not exists public.fr_station_ride_bookings(
 id uuid primary key default gen_random_uuid(),
 ride_id uuid not null references public.fr_station_rides(id) on delete cascade,
 passenger_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'requested' check(status in ('requested','confirmed','cancelled','completed')),
 payment_method text not null default 'cash' check(payment_method='cash'),
 created_at timestamptz not null default now(),
 unique(ride_id,passenger_id)
);
alter table public.fr_station_ride_bookings enable row level security;
drop policy if exists fr_station_booking_own_select on public.fr_station_ride_bookings;
create policy fr_station_booking_own_select on public.fr_station_ride_bookings for select to authenticated using(passenger_id=auth.uid() or exists(select 1 from public.fr_station_rides r where r.id=ride_id and r.driver_id=auth.uid()));
grant select on public.fr_station_ride_bookings to authenticated;
revoke insert,update,delete on public.fr_station_ride_bookings from anon,authenticated;
create or replace function public.fr_station_book_ride(p_ride_id uuid)
returns uuid language plpgsql security definer set search_path=public,auth
as $$
declare v_booking uuid; v_ride public.fr_station_rides%rowtype;
begin
 if auth.uid() is null then raise exception 'Customer login required'; end if;
 select * into v_ride from public.fr_station_rides where id=p_ride_id and status='live' for update;
 if not found then raise exception 'Ride is not available'; end if;
 if v_ride.driver_id=auth.uid() then raise exception 'Cannot book your own ride'; end if;
 if exists(select 1 from public.fr_station_ride_bookings where ride_id=p_ride_id and status in ('requested','confirmed')) then raise exception 'This bike ride seat has already been requested/booked'; end if;
 insert into public.fr_station_ride_bookings(ride_id,passenger_id) values(p_ride_id,auth.uid()) returning id into v_booking;
 update public.fr_station_rides set status='booked' where id=p_ride_id;
 return v_booking;
end $$;
create or replace function public.fr_station_my_bookings()
returns table(booking_id uuid,ride_id uuid,ride_kind text,driver_name text,driver_phone text,vehicle_number text,from_label text,to_label text,fare numeric,booking_status text,payment_method text,created_at timestamptz)
language sql security definer set search_path=public,auth
as $$
 select b.id,r.id,r.ride_kind,r.driver_name,r.driver_phone,r.vehicle_number,r.from_label,r.to_label,r.fare,b.status,b.payment_method,b.created_at
 from public.fr_station_ride_bookings b join public.fr_station_rides r on r.id=b.ride_id
 where b.passenger_id=auth.uid() order by b.created_at desc limit 50
$$;
revoke all on function public.fr_station_book_ride(uuid) from public,anon;
revoke all on function public.fr_station_my_bookings() from public,anon;
grant execute on function public.fr_station_book_ride(uuid),public.fr_station_my_bookings() to authenticated;
notify pgrst,'reload schema';
commit;