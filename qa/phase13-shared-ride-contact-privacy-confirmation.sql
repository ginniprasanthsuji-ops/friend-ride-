-- QA-only Shared Ride hardening. Production/Main untouched.
-- Safe listing columns, RPC-only booking writes, driver confirmation, and participant contacts.
CREATE OR REPLACE FUNCTION public.fr_shared_ride_is_passenger(p_ride_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=''
AS $$
 SELECT EXISTS(SELECT 1 FROM public.fr_shared_ride_bookings b WHERE b.ride_id=p_ride_id AND b.passenger_id=auth.uid() AND b.status IN ('booking_pending','confirmed','boarding','in_progress','completed','disputed'))
$$;
REVOKE ALL ON FUNCTION public.fr_shared_ride_is_passenger(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_is_passenger(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_is_driver(p_ride_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=''
AS $$
 SELECT EXISTS(SELECT 1 FROM public.fr_shared_rides r WHERE r.id=p_ride_id AND r.driver_id=auth.uid())
$$;
REVOKE ALL ON FUNCTION public.fr_shared_ride_is_driver(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_is_driver(uuid) TO authenticated;

DROP POLICY IF EXISTS fr_shared_rides_driver_insert ON public.fr_shared_rides;
DROP POLICY IF EXISTS fr_shared_rides_driver_update ON public.fr_shared_rides;
DROP POLICY IF EXISTS fr_shared_rides_read_live_or_participant ON public.fr_shared_rides;
CREATE POLICY fr_shared_rides_read_live_or_participant ON public.fr_shared_rides
FOR SELECT TO authenticated
USING(status IN ('live','full') OR public.fr_shared_ride_is_driver(id) OR public.fr_shared_ride_is_passenger(id));

DROP POLICY IF EXISTS fr_shared_bookings_participant_read ON public.fr_shared_ride_bookings;
CREATE POLICY fr_shared_bookings_participant_read ON public.fr_shared_ride_bookings
FOR SELECT TO authenticated
USING(passenger_id=(SELECT auth.uid()) OR public.fr_shared_ride_is_driver(ride_id));
DROP POLICY IF EXISTS fr_shared_bookings_participant_update ON public.fr_shared_ride_bookings;
DROP POLICY IF EXISTS fr_shared_bookings_passenger_insert ON public.fr_shared_ride_bookings;

DROP POLICY IF EXISTS fr_shared_events_participant_read ON public.fr_shared_ride_events;
CREATE POLICY fr_shared_events_participant_read ON public.fr_shared_ride_events
FOR SELECT TO authenticated
USING(public.fr_shared_ride_is_driver(ride_id) OR public.fr_shared_ride_is_passenger(ride_id));

DROP POLICY IF EXISTS fr_shared_payments_booking_participant_read ON public.fr_shared_ride_payments;
CREATE POLICY fr_shared_payments_booking_participant_read ON public.fr_shared_ride_payments
FOR SELECT TO authenticated
USING(EXISTS(SELECT 1 FROM public.fr_shared_ride_bookings b WHERE b.id=fr_shared_ride_payments.booking_id AND (b.passenger_id=auth.uid() OR public.fr_shared_ride_is_driver(b.ride_id))));

REVOKE SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.fr_shared_rides FROM PUBLIC,anon,authenticated;
GRANT SELECT(id,vehicle_type,from_label,to_label,total_seats,booked_seats,price_per_seat,departure_at,booking_cutoff_at,status,created_at,updated_at) ON public.fr_shared_rides TO authenticated;
DROP VIEW IF EXISTS public.fr_shared_rides_public;
CREATE VIEW public.fr_shared_rides_public WITH (security_invoker=true)
AS SELECT id,vehicle_type,from_label,to_label,total_seats,booked_seats,price_per_seat,departure_at,booking_cutoff_at,status,created_at,updated_at
FROM public.fr_shared_rides WHERE status IN ('live','full');
GRANT SELECT ON public.fr_shared_rides_public TO authenticated;

REVOKE ALL ON public.fr_shared_ride_bookings FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.fr_shared_ride_bookings TO authenticated;
REVOKE ALL ON public.fr_shared_ride_events FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.fr_shared_ride_events TO authenticated;
REVOKE ALL ON public.fr_shared_ride_payments FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.fr_shared_ride_payments TO authenticated;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_create(
 p_vehicle_type text,p_from_label text,p_to_label text,p_total_seats integer,p_price_per_seat numeric,
 p_departure_at timestamptz,p_booking_cutoff_at timestamptz DEFAULT NULL,
 p_from_lat double precision DEFAULT NULL,p_from_lng double precision DEFAULT NULL,
 p_to_lat double precision DEFAULT NULL,p_to_lng double precision DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_id uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='driver' AND p.driver_approval_status='approved') THEN RAISE EXCEPTION 'Approved driver account required';END IF;
 IF p_vehicle_type NOT IN ('auto','car') THEN RAISE EXCEPTION 'Vehicle type must be auto or car';END IF;
 IF p_total_seats<1 OR p_total_seats>12 THEN RAISE EXCEPTION 'Invalid passenger seat capacity';END IF;
 IF p_price_per_seat<0 THEN RAISE EXCEPTION 'Fare cannot be negative';END IF;
 IF p_departure_at<=now() THEN RAISE EXCEPTION 'Departure must be in the future';END IF;
 IF p_booking_cutoff_at IS NOT NULL AND (p_booking_cutoff_at<=now() OR p_booking_cutoff_at>=p_departure_at) THEN RAISE EXCEPTION 'Invalid booking cutoff';END IF;
 INSERT INTO public.fr_shared_rides(driver_id,vehicle_type,from_label,to_label,total_seats,price_per_seat,departure_at,booking_cutoff_at,from_lat,from_lng,to_lat,to_lng)
 VALUES(auth.uid(),p_vehicle_type,p_from_label,p_to_label,p_total_seats,p_price_per_seat,p_departure_at,p_booking_cutoff_at,p_from_lat,p_from_lng,p_to_lat,p_to_lng)
 RETURNING id INTO v_id;
 INSERT INTO public.fr_shared_ride_events(ride_id,actor_id,event_type,details)
 VALUES(v_id,auth.uid(),'ride_created',jsonb_build_object('vehicle_type',p_vehicle_type,'from',p_from_label,'to',p_to_label,'seats',p_total_seats,'price_per_seat',p_price_per_seat,'departure_at',p_departure_at));
 RETURN v_id;
END;$$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_book_seats(p_ride_id uuid,p_seats integer,p_pickup_label text,p_drop_label text)
RETURNS TABLE(booking_id uuid,amount numeric,seats_remaining integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_ride public.fr_shared_rides%rowtype;v_booking uuid;v_amount numeric;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='customer') THEN RAISE EXCEPTION 'Customer account required';END IF;
 IF p_seats<1 OR p_seats>12 THEN RAISE EXCEPTION 'Invalid seat count';END IF;
 SELECT * INTO v_ride FROM public.fr_shared_rides WHERE id=p_ride_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Ride not found';END IF;
 IF v_ride.driver_id=auth.uid() THEN RAISE EXCEPTION 'Driver cannot book own ride';END IF;
 IF v_ride.status NOT IN ('live','full') THEN RAISE EXCEPTION 'Ride is not open for booking';END IF;
 IF v_ride.departure_at<=now() THEN RAISE EXCEPTION 'Ride departure has passed';END IF;
 IF v_ride.booking_cutoff_at IS NOT NULL AND now()>=v_ride.booking_cutoff_at THEN RAISE EXCEPTION 'Booking cutoff has passed';END IF;
 IF v_ride.total_seats-v_ride.booked_seats<p_seats THEN RAISE EXCEPTION 'Not enough seats available';END IF;
 IF EXISTS(SELECT 1 FROM public.fr_shared_ride_bookings b WHERE b.ride_id=p_ride_id AND b.passenger_id=auth.uid() AND b.status NOT IN ('cancelled','refunded')) THEN RAISE EXCEPTION 'Passenger already has an active booking on this ride';END IF;
 v_amount:=v_ride.price_per_seat*p_seats;
 INSERT INTO public.fr_shared_ride_bookings(ride_id,passenger_id,seats_booked,pickup_label,drop_label,fare_per_seat_snapshot,total_fare,status)
 VALUES(p_ride_id,auth.uid(),p_seats,p_pickup_label,p_drop_label,v_ride.price_per_seat,v_amount,'booking_pending') RETURNING id INTO v_booking;
 UPDATE public.fr_shared_rides SET booked_seats=booked_seats+p_seats,status=case when booked_seats+p_seats>=total_seats then 'full' else 'live' end,updated_at=now() WHERE id=p_ride_id;
 INSERT INTO public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details) VALUES(p_ride_id,v_booking,auth.uid(),'seat_booking_created',jsonb_build_object('seats',p_seats,'amount',v_amount,'pickup',p_pickup_label,'drop',p_drop_label));
 RETURN QUERY SELECT v_booking,v_amount,v_ride.total_seats-v_ride.booked_seats-p_seats;
END;$$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_confirm_booking(p_booking_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_booking public.fr_shared_ride_bookings%rowtype;v_ride_status text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required';END IF;
 SELECT * INTO v_booking FROM public.fr_shared_ride_bookings WHERE id=p_booking_id FOR UPDATE;
 IF NOT FOUND OR v_booking.status<>'booking_pending' THEN RAISE EXCEPTION 'Pending booking unavailable';END IF;
 SELECT r.status INTO v_ride_status FROM public.fr_shared_rides r WHERE r.id=v_booking.ride_id AND r.driver_id=auth.uid() FOR UPDATE;
 IF NOT FOUND OR v_ride_status NOT IN ('live','full') THEN RAISE EXCEPTION 'Only ride owner can confirm this booking';END IF;
 UPDATE public.fr_shared_ride_bookings SET status='confirmed',updated_at=now() WHERE id=p_booking_id AND status='booking_pending';
 INSERT INTO public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details) VALUES(v_booking.ride_id,p_booking_id,auth.uid(),'driver_booking_confirmed',jsonb_build_object('booking_status','confirmed'));
 RETURN true;
END;$$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_cancel_booking(p_booking_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_booking public.fr_shared_ride_bookings%rowtype;v_ride public.fr_shared_rides%rowtype;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required';END IF;
 SELECT * INTO v_booking FROM public.fr_shared_ride_bookings WHERE id=p_booking_id FOR UPDATE;
 IF NOT FOUND OR v_booking.passenger_id<>auth.uid() THEN RAISE EXCEPTION 'Booking not found or not yours';END IF;
 IF v_booking.status NOT IN ('booking_pending','confirmed') THEN RAISE EXCEPTION 'Booking cannot be cancelled in this state';END IF;
 SELECT * INTO v_ride FROM public.fr_shared_rides WHERE id=v_booking.ride_id FOR UPDATE;
 IF v_ride.status NOT IN ('live','full') OR v_ride.departure_at<=now() THEN RAISE EXCEPTION 'Cancellation window closed';END IF;
 UPDATE public.fr_shared_ride_bookings SET status='cancelled',updated_at=now() WHERE id=p_booking_id;
 UPDATE public.fr_shared_rides SET booked_seats=greatest(booked_seats-v_booking.seats_booked,0),status='live',updated_at=now() WHERE id=v_booking.ride_id;
 INSERT INTO public.fr_shared_ride_events(ride_id,booking_id,actor_id,event_type,details) VALUES(v_booking.ride_id,p_booking_id,auth.uid(),'passenger_booking_cancelled',jsonb_build_object('seats_released',v_booking.seats_booked));
 RETURN true;
END;$$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_get_participant_contact(p_booking_id uuid)
RETURNS TABLE(contact_role text,contact_name text,contact_phone text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_uid uuid:=auth.uid();v_booking public.fr_shared_ride_bookings%rowtype;v_driver_id uuid;
BEGIN
 IF v_uid IS NULL THEN RAISE EXCEPTION 'Login required';END IF;
 SELECT * INTO v_booking FROM public.fr_shared_ride_bookings WHERE id=p_booking_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found';END IF;
 IF v_booking.status NOT IN ('confirmed','boarding','in_progress','completed','disputed') THEN RAISE EXCEPTION 'Contact details are available only after confirmation';END IF;
 SELECT r.driver_id INTO v_driver_id FROM public.fr_shared_rides r WHERE r.id=v_booking.ride_id;
 IF v_booking.passenger_id=v_uid THEN
  RETURN QUERY SELECT 'driver'::text,p.full_name,coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')) FROM public.profiles p WHERE p.id=v_driver_id AND p.role='driver';
  RETURN;
 END IF;
 IF v_driver_id=v_uid THEN
  RETURN QUERY SELECT 'customer'::text,p.full_name,coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')) FROM public.profiles p WHERE p.id=v_booking.passenger_id AND p.role='customer';
  RETURN;
 END IF;
 RAISE EXCEPTION 'Contact details are available only to this booking participants';
END;$$;

REVOKE ALL ON FUNCTION public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_create(text,text,text,integer,numeric,timestamptz,timestamptz,double precision,double precision,double precision,double precision) TO authenticated;
REVOKE ALL ON FUNCTION public.fr_shared_ride_book_seats(uuid,integer,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_book_seats(uuid,integer,text,text) TO authenticated;
REVOKE ALL ON FUNCTION public.fr_shared_ride_confirm_booking(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_confirm_booking(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.fr_shared_ride_cancel_booking(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_cancel_booking(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.fr_shared_ride_get_participant_contact(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_get_participant_contact(uuid) TO authenticated;
