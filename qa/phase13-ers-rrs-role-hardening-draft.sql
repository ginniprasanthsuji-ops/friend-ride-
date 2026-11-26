-- DRAFT ONLY — review required; do not apply to QA or production.
-- Phase 13 ERS/RRS role, booking, and participant-contact hardening.
-- Live QA audit found: ride creation lacks role/approval checks; booking lacks
-- customer-role check; guest profile save lacks customer-role check.
-- Intended supported ride publishers: approved Driver, or Customer with own guest-driver profile.
-- This draft preserves the guest-driver path and does not permit pending Driver,
-- Partner, Admin, or arbitrary authenticated users to publish rides.

begin;

create or replace function public.fr_road_ride_create(
  p_from_label text,
  p_to_label text,
  p_fare numeric,
  p_departure_at timestamptz,
  p_booking_cutoff_at timestamptz default null,
  p_route_note text default null,
  p_from_lat double precision default null,
  p_from_lng double precision default null,
  p_to_lat double precision default null,
  p_to_lng double precision default null,
  p_pickup_radius_km numeric default 3
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists (
    select 1 from public.profiles p
    where p.id=auth.uid()
      and (
        (p.role='driver' and p.driver_approval_status='approved')
        or (p.role='customer' and exists(
          select 1 from public.fr_road_ride_guest_profiles g where g.driver_id=auth.uid()
        ))
      )
  ) then raise exception 'Approved Driver or Customer guest-driver profile required'; end if;
  if p_from_label is null or length(trim(p_from_label))=0 or p_to_label is null or length(trim(p_to_label))=0 then
    raise exception 'From and To are required';
  end if;
  if p_fare is null or p_fare<0 then raise exception 'Fare must be zero or more'; end if;
  if p_departure_at is null or p_departure_at<=now() then raise exception 'Departure must be in future'; end if;
  if p_booking_cutoff_at is not null and (p_booking_cutoff_at<=now() or p_booking_cutoff_at>=p_departure_at) then
    raise exception 'Booking cutoff must be future and before departure';
  end if;
  if p_pickup_radius_km is null or p_pickup_radius_km<0 or p_pickup_radius_km>25 then raise exception 'Pickup radius invalid'; end if;
  if (p_from_lat is null)<>(p_from_lng is null) or (p_to_lat is null)<>(p_to_lng is null) then
    raise exception 'Coordinates must be supplied in pairs';
  end if;
  if p_from_lat is not null and (p_from_lat < -90 or p_from_lat > 90 or p_from_lng < -180 or p_from_lng > 180) then
    raise exception 'Origin coordinates invalid';
  end if;
  if p_to_lat is not null and (p_to_lat < -90 or p_to_lat > 90 or p_to_lng < -180 or p_to_lng > 180) then
    raise exception 'Destination coordinates invalid';
  end if;
  insert into public.fr_road_rides(driver_id,from_label,to_label,fare,departure_at,booking_cutoff_at,route_note,from_lat,from_lng,to_lat,to_lng,pickup_radius_km)
  values(auth.uid(),trim(p_from_label),trim(p_to_label),p_fare,p_departure_at,p_booking_cutoff_at,p_route_note,p_from_lat,p_from_lng,p_to_lat,p_to_lng,p_pickup_radius_km)
  returning id into v_id;
  insert into public.fr_road_ride_events(ride_id,actor_id,event_type,details)
  values(v_id,auth.uid(),'road_ride_published',jsonb_build_object('from',p_from_label,'to',p_to_label,'fare',p_fare,'departure_at',p_departure_at));
  return v_id;
end;
$function$;

create or replace function public.fr_road_ride_book(
  p_ride_id uuid,
  p_pickup_label text,
  p_drop_label text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride public.fr_road_rides%rowtype; v_booking uuid; v_existing_status text;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then
    raise exception 'Customer account required';
  end if;
  if p_ride_id is null or p_pickup_label is null or length(trim(p_pickup_label))=0 or p_drop_label is null or length(trim(p_drop_label))=0 then
    raise exception 'Ride, pickup, and drop are required';
  end if;
  select * into v_ride from public.fr_road_rides where id=p_ride_id for update;
  if not found then raise exception 'Ride not found'; end if;
  if v_ride.driver_id=auth.uid() then raise exception 'Cannot book your own ride'; end if;
  if v_ride.status<>'live' then raise exception 'Ride unavailable'; end if;
  if v_ride.departure_at<=now() then raise exception 'Departure has passed'; end if;
  if v_ride.booking_cutoff_at is not null and now()>=v_ride.booking_cutoff_at then raise exception 'Booking closed'; end if;
  select b.id,b.status into v_booking,v_existing_status
  from public.fr_road_ride_bookings b where b.ride_id=p_ride_id and b.passenger_id=auth.uid() for update;
  if found then
    if v_existing_status not in ('cancelled','refunded') then raise exception 'Passenger already has an active booking'; end if;
    -- The schema has UNIQUE(ride_id,passenger_id); reuse the cancelled/refunded row.
    update public.fr_road_ride_bookings
    set pickup_label=trim(p_pickup_label),drop_label=trim(p_drop_label),fare_snapshot=v_ride.fare,
        status='booking_pending',passenger_completed_at=null,driver_completed_at=null,
        created_at=now(),updated_at=now()
    where id=v_booking returning id into v_booking;
  else
    insert into public.fr_road_ride_bookings(ride_id,passenger_id,pickup_label,drop_label,fare_snapshot,status)
    values(p_ride_id,auth.uid(),trim(p_pickup_label),trim(p_drop_label),v_ride.fare,'booking_pending')
    returning id into v_booking;
  end if;
  update public.fr_road_rides set status='booked',updated_at=now() where id=p_ride_id;
  insert into public.fr_road_ride_events(ride_id,booking_id,actor_id,event_type,details)
  values(p_ride_id,v_booking,auth.uid(),'passenger_booking_created',jsonb_build_object('fare_snapshot',v_ride.fare,'pickup',p_pickup_label,'drop',p_drop_label));
  return v_booking;
end;
$function$;

create or replace function public.fr_road_ride_confirm_booking(p_booking_id uuid)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare v_ride_id uuid; v_ride public.fr_road_rides%rowtype; v_booking public.fr_road_ride_bookings%rowtype;
begin
  if auth.uid() is null then raise exception 'Login required'; end if;
  select b.ride_id into v_ride_id from public.fr_road_ride_bookings b
  where b.id=p_booking_id and b.status='booking_pending';
  if not found then raise exception 'Pending booking unavailable'; end if;
  -- Ride-first locking matches booking RPC and serializes status changes.
  select * into v_ride from public.fr_road_rides r where r.id=v_ride_id for update;
  if not found or v_ride.driver_id<>auth.uid() or v_ride.status<>'booked' or v_ride.departure_at<=now() then
    raise exception 'Ride owner cannot confirm this booking';
  end if;
  if not exists(
    select 1 from public.profiles p where p.id=auth.uid()
      and ((p.role='driver' and p.driver_approval_status='approved')
        or (p.role='customer' and exists(select 1 from public.fr_road_ride_guest_profiles g where g.driver_id=auth.uid())))
  ) then raise exception 'Approved Driver or Customer guest-driver profile required'; end if;
  select * into v_booking from public.fr_road_ride_bookings b
  where b.id=p_booking_id and b.ride_id=v_ride_id and b.status='booking_pending' for update;
  if not found then raise exception 'Pending booking unavailable'; end if;
  update public.fr_road_ride_bookings set status='confirmed',updated_at=now()
  where id=p_booking_id and status='booking_pending';
  insert into public.fr_road_ride_events(ride_id,booking_id,actor_id,event_type,details)
  values(v_ride_id,p_booking_id,auth.uid(),'driver_booking_confirmed',jsonb_build_object('booking_status','confirmed'));
  return true;
end;
$function$;

create or replace function public.fr_road_ride_get_participant_contact(p_ride_id uuid)
returns table(contact_role text,contact_name text,contact_phone text)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_uid uuid:=auth.uid(); v_ride public.fr_road_rides%rowtype;
begin
  if v_uid is null then raise exception 'Login required'; end if;
  select * into v_ride from public.fr_road_rides r where r.id=p_ride_id;
  if not found then raise exception 'Ride not found'; end if;
  if exists(
    select 1 from public.fr_road_ride_bookings b join public.profiles c on c.id=b.passenger_id
    where b.ride_id=p_ride_id and b.passenger_id=v_uid and c.role='customer'
      and b.status in ('confirmed','boarding','in_progress','dropped','completed','disputed')
  ) then
    if not exists(select 1 from public.profiles p where p.id=v_ride.driver_id
      and ((p.role='driver' and p.driver_approval_status='approved')
        or (p.role='customer' and exists(select 1 from public.fr_road_ride_guest_profiles g where g.driver_id=v_ride.driver_id)))
    ) then raise exception 'Ride driver is not eligible for participant contact'; end if;
    return query select 'driver'::text,coalesce(nullif(v_ride.driver_display_name,''),g.driver_display_name),
      coalesce(nullif(trim(v_ride.driver_phone),''),g.driver_phone)
    from public.fr_road_ride_guest_profiles g where g.driver_id=v_ride.driver_id;
    if not found then
      return query select 'driver'::text,v_ride.driver_display_name,v_ride.driver_phone;
    end if;
    return;
  end if;
  if v_ride.driver_id=v_uid and exists(
    select 1 from public.profiles p where p.id=v_uid
      and ((p.role='driver' and p.driver_approval_status='approved')
        or (p.role='customer' and exists(select 1 from public.fr_road_ride_guest_profiles g where g.driver_id=v_uid)))
  ) and exists(
    select 1 from public.fr_road_ride_bookings b where b.ride_id=p_ride_id
      and b.status in ('confirmed','boarding','in_progress','dropped','completed','disputed')
  ) then
    return query select 'customer'::text,p.full_name,coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))::text
    from public.fr_road_ride_bookings b join public.profiles p on p.id=b.passenger_id
    where b.ride_id=p_ride_id and b.status in ('confirmed','boarding','in_progress','dropped','completed','disputed')
      and p.role='customer' order by b.created_at desc limit 1;
    return;
  end if;
  raise exception 'Contact details are available only to confirmed ride participants';
end;
$function$;

create or replace function public.fr_road_ride_save_driver_profile(
  p_ride_id uuid,p_driver_phone text,p_driver_photo_path text,p_bike_registration_number text,p_driver_display_name text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profiles p where p.id=auth.uid()
    and ((p.role='driver' and p.driver_approval_status='approved')
      or (p.role='customer' and exists(select 1 from public.fr_road_ride_guest_profiles g where g.driver_id=auth.uid())))
  ) then raise exception 'Approved Driver or Customer guest-driver profile required'; end if;
  if p_driver_phone is null or p_driver_phone !~ '^[0-9]{10}$' then raise exception 'Enter a valid 10 digit phone number'; end if;
  if p_driver_display_name is null or length(trim(p_driver_display_name))=0 then raise exception 'Driver name required'; end if;
  if p_bike_registration_number is null or length(trim(p_bike_registration_number))<4 or length(trim(p_bike_registration_number))>20 then
    raise exception 'Bike registration must be 4-20 characters';
  end if;
  if p_driver_photo_path is not null and (storage.foldername(p_driver_photo_path))[1]<>auth.uid()::text then
    raise exception 'Invalid private photo path';
  end if;
  update public.fr_road_rides set driver_phone=trim(p_driver_phone),driver_photo_path=p_driver_photo_path,
    bike_registration_number=upper(trim(p_bike_registration_number)),driver_display_name=trim(p_driver_display_name),
    phone_verified=false,updated_at=now()
  where id=p_ride_id and driver_id=auth.uid();
  if not found then raise exception 'Ride not found or not owned by user'; end if;
  return true;
end;
$function$;

create or replace function public.fr_road_ride_save_guest_driver_profile(
  p_driver_phone text,p_driver_photo_path text,p_bike_registration_number text,p_driver_display_name text
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare v_uid uuid:=auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profiles p where p.id=v_uid and p.role='customer') then raise exception 'Customer account required'; end if;
  if p_driver_phone is null or p_driver_phone !~ '^[0-9]{10}$' then raise exception 'Enter a valid 10 digit phone number'; end if;
  if p_driver_display_name is null or length(trim(p_driver_display_name))=0 or p_bike_registration_number is null or length(trim(p_bike_registration_number))<4 or length(trim(p_bike_registration_number))>20 then
    raise exception 'Name and bike registration are required';
  end if;
  if p_driver_photo_path is null or (storage.foldername(p_driver_photo_path))[1]<>v_uid::text then raise exception 'Invalid private photo path'; end if;
  insert into public.fr_road_ride_guest_profiles(driver_id,driver_phone,driver_photo_path,bike_registration_number,driver_display_name)
  values(v_uid,trim(p_driver_phone),p_driver_photo_path,upper(trim(p_bike_registration_number)),trim(p_driver_display_name))
  on conflict(driver_id) do update set driver_phone=excluded.driver_phone,driver_photo_path=excluded.driver_photo_path,
    bike_registration_number=excluded.bike_registration_number,driver_display_name=excluded.driver_display_name,updated_at=now();
  return true;
end;
$function$;

revoke all on function public.fr_road_ride_create(text,text,numeric,timestamptz,timestamptz,text,double precision,double precision,double precision,double precision,numeric) from public,anon;
revoke all on function public.fr_road_ride_book(uuid,text,text) from public,anon;
revoke all on function public.fr_road_ride_confirm_booking(uuid) from public,anon;
revoke all on function public.fr_road_ride_get_participant_contact(uuid) from public,anon;
revoke all on function public.fr_road_ride_save_driver_profile(uuid,text,text,text,text) from public,anon;
revoke all on function public.fr_road_ride_save_guest_driver_profile(text,text,text,text) from public,anon;
grant execute on function public.fr_road_ride_create(text,text,numeric,timestamptz,timestamptz,text,double precision,double precision,double precision,double precision,numeric) to authenticated;
grant execute on function public.fr_road_ride_book(uuid,text,text) to authenticated;
grant execute on function public.fr_road_ride_confirm_booking(uuid) to authenticated;
grant execute on function public.fr_road_ride_get_participant_contact(uuid) to authenticated;
grant execute on function public.fr_road_ride_save_driver_profile(uuid,text,text,text,text) to authenticated;
grant execute on function public.fr_road_ride_save_guest_driver_profile(text,text,text,text) to authenticated;

commit;
