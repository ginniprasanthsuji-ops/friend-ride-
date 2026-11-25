-- FRIEND RIDE Shared Ride foundation (additive)
-- QA project migration applied separately during development.
-- Creates shared Auto/Car rides, passenger seat bookings, payment-state records,
-- event audit, RLS, and atomic ride creation/seat booking RPCs.
-- No payment gateway integration is included; paid_hold must only be set after
-- a trusted provider confirmation/webhook.

create table if not exists public.fr_shared_rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete cascade,
  vehicle_type text not null check (vehicle_type in ('auto','car')),
  from_label text not null,
  to_label text not null,
  from_lat double precision,
  from_lng double precision,
  to_lat double precision,
  to_lng double precision,
  total_seats integer not null check (total_seats between 1 and 12),
  booked_seats integer not null default 0 check (booked_seats between 0 and total_seats),
  price_per_seat numeric(10,2) not null check (price_per_seat >= 0),
  departure_at timestamptz not null,
  booking_cutoff_at timestamptz,
  status text not null default 'live' check (status in ('live','full','departed','in_progress','completed','cancelled','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists fr_shared_rides_live_route_idx on public.fr_shared_rides(status,departure_at,from_label,to_label);
create index if not exists fr_shared_rides_driver_idx on public.fr_shared_rides(driver_id,created_at desc);

create table if not exists public.fr_shared_ride_bookings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.fr_shared_rides(id) on delete cascade,
  passenger_id uuid not null references auth.users(id) on delete cascade,
  seats_booked integer not null check (seats_booked between 1 and 12),
  pickup_label text not null,
  drop_label text not null,
  fare_per_seat_snapshot numeric(10,2) not null check (fare_per_seat_snapshot >= 0),
  total_fare numeric(10,2) not null check (total_fare >= 0),
  status text not null default 'booking_pending' check (status in ('booking_pending','confirmed','cancel_requested','cancelled','boarding','in_progress','completed','no_show','disputed','refund_pending','refunded')),
  passenger_completed_at timestamptz,
  driver_boarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ride_id,passenger_id)
);
create index if not exists fr_shared_ride_bookings_ride_idx on public.fr_shared_ride_bookings(ride_id,status);
create index if not exists fr_shared_ride_bookings_passenger_idx on public.fr_shared_ride_bookings(passenger_id,created_at desc);

create table if not exists public.fr_shared_ride_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.fr_shared_ride_bookings(id) on delete cascade,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'INR',
  provider text,
  provider_transaction_id text,
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment','paid_hold','release_pending','released','refund_pending','refunded','failed','disputed')),
  paid_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.fr_shared_ride_events (
  id bigint generated always as identity primary key,
  ride_id uuid references public.fr_shared_rides(id) on delete cascade,
  booking_id uuid references public.fr_shared_ride_bookings(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.fr_shared_rides enable row level security;
alter table public.fr_shared_ride_bookings enable row level security;
alter table public.fr_shared_ride_payments enable row level security;
alter table public.fr_shared_ride_events enable row level security;

create policy fr_shared_rides_read_live_or_participant on public.fr_shared_rides for select to authenticated
using (status in ('live','full') or driver_id=(select auth.uid()) or exists(select 1 from public.fr_shared_ride_bookings b where b.ride_id=id and b.passenger_id=(select auth.uid())));
create policy fr_shared_bookings_participant_read on public.fr_shared_ride_bookings for select to authenticated
using (passenger_id=(select auth.uid()) or exists(select 1 from public.fr_shared_rides r where r.id=ride_id and r.driver_id=(select auth.uid())));
create policy fr_shared_payments_booking_participant_read on public.fr_shared_ride_payments for select to authenticated
using (exists(select 1 from public.fr_shared_ride_bookings b where b.id=booking_id and (b.passenger_id=(select auth.uid()) or exists(select 1 from public.fr_shared_rides r where r.id=b.ride_id and r.driver_id=(select auth.uid())))));
create policy fr_shared_events_participant_read on public.fr_shared_ride_events for select to authenticated
using (exists(select 1 from public.fr_shared_rides r where r.id=ride_id and (r.driver_id=(select auth.uid()) or exists(select 1 from public.fr_shared_ride_bookings b where b.ride_id=r.id and b.passenger_id=(select auth.uid())))));

grant select on public.fr_shared_rides,public.fr_shared_ride_bookings,public.fr_shared_ride_payments,public.fr_shared_ride_events to authenticated;
revoke insert,update on public.fr_shared_ride_bookings from authenticated;
revoke insert,update on public.fr_shared_rides from authenticated;

create or replace function public.fr_shared_ride_create(
  p_vehicle_type text,p_from_label text,p_to_label text,p_total_seats integer,
  p_price_per_seat numeric,p_departure_at timestamptz,p_booking_cutoff_at timestamptz default null,
  p_from_lat double precision default null,p_from_lng double precision default null,
  p_to_lat double precision default null,p_to_lng double precision default null
) returns uuid language plpgsql security definer set search_path=''
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if p_vehicle_type not in ('auto','car') then raise exception 'Vehicle type must be auto or car'; end if;
  if p_total_seats<1 or p_total_seats>12 then raise exception 'Invalid passenger seat capacity'; end if;
  if p_price_per_seat<0 then raise exception 'Fare cannot be negative'; end if;
  if p_departure_at<=now() then raise exception 'Departure must be in the future'; end if;
  insert into public.fr_shared_rides(driver_id,vehicle_type,from_label,to_label,total_seats,price_per_seat,departure_at,booking_cutoff_at,from_lat,from_lng,to_lat,to_lng)
  values(auth.uid(),p_vehicle_type,p_from_label,p_to_label,p_total_seats,p_price_per_seat,p_departure_at,p_booking_cutoff_at,p_from_lat,p_from_lng,p_to_lat,p_to_lng)
  returning id into v_id;
  insert into public.fr_shared_ride_events(ride_id,actor_id,event_type,details)
  values(v_id,auth.uid(),'ride_created',jsonb_build_object('vehicle_type',p_vehicle_type,'from',p_from_label,'to',p_to_label,'seats',p_total_seats,'price_per_seat',p_price_per_seat,'departure_at',p_departure_at));
  return v_id;
end;
$$;

create or replace function public.fr_shared_ride_book_seats(p_ride_id uuid,p_seats integer,p_pickup_label text,p_drop_label text)
returns table(booking_id uuid,amount numeric,seats_remaining integer)
language plpgsql security definer set search_path=''
as $$
declare v_ride public.fr_shared_rides%rowtype; v_booking uuid; v_amount numeric;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if p_seats<1 or p_seats>12 then raise exception 'Invalid seat count'; end if;
  select * into v_ride from public.fr_shared_rides where id=p_ride_id for update;
  if not found then raise exception 'Ride not found'; end if;
  if v_ride.driver_id=auth.uid() then raise exception 'Driver cannot book own ride'; end if;
  if v_ride.status not in ('live','full') then raise exception 'Ride is not open for booking'; end if;
  if v_ride.departure_at<=now() then raise exception 'Ride departure has passed'; end if;
  if v_ride.booking_cutoff_at is not null and now()>=v_ride.booking_cutoff_at then raise exception 'Booking cutoff has passed'; end if;
  if v_ride.total_seats-v_ride.booked_seats<p_seats then raise exception 'Not enough seats available'; end if;
  if exists(select 1 from public.fr_shared_ride_bookings b where b.ride_id=p_ride_id and b.passenger_id=auth.uid() and b.status not in ('cancelled','refunded')) then raise exception 'Passenger already has an active booking on this ride'; end if;
  v_amount:=v_ride.price_per_seat*p_seats;
  insert into public.fr_shared_ride_bookings(ride_id,passenger_id,seats_booked,pickup_label,drop_label,fare_per_seat_snapshot,total_fare,status)
  values(p_ride_id,auth.uid(),p_seats,p_pickup_label,p_drop_label,v_ride.price_per_seat,v_amount,'booking_pending')
  returning id into v_booking;
  update public.fr_shared_rides set booked_seats=booked_seats+p_seats,status=case when booked_seats+p_seats>=total_seats then 'full' else 'live' end,updated_at=now() where id=p_ride_id;
  insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details)
  values(p_ride_id,v_booking,auth.uid(),'seat_booking_created',jsonb_build_object('seats',p_seats,'amount',v_amount,'pickup',p_pickup_label,'drop',p_drop_label));
  return query select v_booking,v_amount,v_ride.total_seats-v_ride.booked_seats-p_seats;
end;
$$;
revoke all on function public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) from public,anon;
revoke all on function public.fr_shared_ride_book_seats(uuid,integer,text,text) from public,anon;
grant execute on function public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) to authenticated;
grant execute on function public.fr_shared_ride_book_seats(uuid,integer,text,text) to authenticated;
