-- PHASE 13B ROLE / APPROVAL VALIDATION REMEDIATION DRAFT
-- QA ONLY. REVIEW REQUIRED. NOT APPLIED.
-- Based on live QA function bodies/schema, approved driver literal='approved', registration initializes driver approval='pending'.
-- This draft adds server-side profile checks to current deployed RPC bodies.

CREATE OR REPLACE FUNCTION public.fr_shared_ride_create(
 p_vehicle_type text, p_from_label text, p_to_label text,
 p_total_seats integer, p_price_per_seat numeric,
 p_departure_at timestamptz, p_booking_cutoff_at timestamptz DEFAULT NULL,
 p_from_lat double precision DEFAULT NULL, p_from_lng double precision DEFAULT NULL,
 p_to_lat double precision DEFAULT NULL, p_to_lng double precision DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare v_id uuid;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='driver' and p.driver_approval_status='approved') then raise exception 'Approved driver login required'; end if;
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
$function$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_book_seats(
 p_ride_id uuid, p_seats integer, p_pickup_label text, p_drop_label text
) RETURNS TABLE(booking_id uuid,amount numeric,seats_remaining integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '' AS $function$
declare v_ride public.fr_shared_rides%rowtype; v_booking uuid; v_amount numeric;
begin
 if auth.uid() is null then raise exception 'Login required'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='customer') then raise exception 'Customer account required'; end if;
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
 values(p_ride_id,auth.uid(),p_seats,p_pickup_label,p_drop_label,v_ride.price_per_seat,v_amount,'booking_pending') returning id into v_booking;
 update public.fr_shared_rides set booked_seats=booked_seats+p_seats,status=case when booked_seats+p_seats>=total_seats then 'full' else 'live' end,updated_at=now() where id=p_ride_id;
 insert into public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details)
 values(p_ride_id,v_booking,auth.uid(),'seat_booking_created',jsonb_build_object('seats',p_seats,'amount',v_amount,'pickup',p_pickup_label,'drop',p_drop_label));
 return query select v_booking,v_amount,v_ride.total_seats-v_ride.booked_seats-p_seats;
end;
$function$;

-- Pre-apply gate: review complete SQL diff, exact function grants, rollback backup,
-- cancellation/rebooking status semantics, and QA regression plan. Do not execute yet.
