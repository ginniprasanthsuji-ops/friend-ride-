-- Phase 13 QA-only RRS contact privacy and booking confirmation hardening.
-- Apply ONLY to the disposable FRIEND RIDE QA Supabase project; production is untouched.
-- Public/participant table SELECT is column-limited. Contact fields are available only
-- through a participant RPC after a booking is confirmed (or is in a later active state).
-- The driver photo bucket remains private and this RPC does not return photo paths.

CREATE OR REPLACE FUNCTION public.fr_road_ride_is_passenger(p_ride_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fr_road_ride_bookings b
    WHERE b.ride_id = p_ride_id
      AND b.passenger_id = auth.uid()
      AND b.status IN ('booking_pending','confirmed','boarding','in_progress','dropped','completed','disputed')
  );
$$;
REVOKE ALL ON FUNCTION public.fr_road_ride_is_passenger(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_road_ride_is_passenger(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.fr_road_ride_is_driver(p_ride_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fr_road_rides r
    WHERE r.id = p_ride_id AND r.driver_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.fr_road_ride_is_driver(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_road_ride_is_driver(uuid) TO authenticated;

DROP POLICY IF EXISTS fr_road_bookings_participant_select ON public.fr_road_ride_bookings;
CREATE POLICY fr_road_bookings_participant_select
ON public.fr_road_ride_bookings
FOR SELECT TO authenticated
USING (passenger_id = (SELECT auth.uid()) OR public.fr_road_ride_is_driver(ride_id));

DROP POLICY IF EXISTS fr_road_events_participant_select ON public.fr_road_ride_events;
CREATE POLICY fr_road_events_participant_select
ON public.fr_road_ride_events
FOR SELECT TO authenticated
USING (public.fr_road_ride_is_driver(ride_id) OR public.fr_road_ride_is_passenger(ride_id));

-- Restrict direct reads to non-sensitive listing columns.
REVOKE SELECT ON public.fr_road_rides FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, from_label, to_label, route_note, pickup_radius_km,
  departure_at, booking_cutoff_at, fare, status,
  created_at, updated_at, driver_display_name, phone_verified
) ON public.fr_road_rides TO authenticated;

DROP VIEW IF EXISTS public.fr_road_rides_public;
CREATE VIEW public.fr_road_rides_public
WITH (security_invoker = true)
AS
SELECT
  id, from_label, to_label, route_note, pickup_radius_km,
  departure_at, booking_cutoff_at, fare, status,
  created_at, updated_at, driver_display_name, phone_verified
FROM public.fr_road_rides
WHERE status = 'live';
GRANT SELECT ON public.fr_road_rides_public TO authenticated;

CREATE OR REPLACE FUNCTION public.fr_road_ride_confirm_booking(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_booking public.fr_road_ride_bookings%rowtype;
  v_ride_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Login required'; END IF;
  SELECT * INTO v_booking
  FROM public.fr_road_ride_bookings
  WHERE id = p_booking_id
  FOR UPDATE;
  IF NOT FOUND OR v_booking.status <> 'booking_pending' THEN
    RAISE EXCEPTION 'Pending booking unavailable';
  END IF;

  SELECT r.status INTO v_ride_status
  FROM public.fr_road_rides r
  WHERE r.id = v_booking.ride_id AND r.driver_id = auth.uid()
  FOR UPDATE;
  IF NOT FOUND OR v_ride_status <> 'booked' THEN
    RAISE EXCEPTION 'Only ride owner can confirm a pending booking';
  END IF;

  UPDATE public.fr_road_ride_bookings
  SET status = 'confirmed', updated_at = now()
  WHERE id = p_booking_id AND status = 'booking_pending';

  INSERT INTO public.fr_road_ride_events(ride_id,booking_id,actor_id,event_type,details)
  VALUES (v_booking.ride_id,p_booking_id,auth.uid(),'driver_booking_confirmed',
          jsonb_build_object('booking_status','confirmed'));
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.fr_road_ride_confirm_booking(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_road_ride_confirm_booking(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.fr_road_ride_get_participant_contact(p_ride_id uuid)
RETURNS TABLE(contact_role text, contact_name text, contact_phone text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Login required'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.fr_road_ride_bookings b
    WHERE b.ride_id=p_ride_id AND b.passenger_id=v_uid
      AND b.status IN ('confirmed','boarding','in_progress','dropped','completed','disputed')
  ) THEN
    RETURN QUERY
    SELECT 'driver'::text,
           coalesce(nullif(r.driver_display_name,''),g.driver_display_name),
           coalesce(nullif(r.driver_phone,''),g.driver_phone)
    FROM public.fr_road_rides r
    LEFT JOIN public.fr_road_ride_guest_profiles g ON g.driver_id=r.driver_id
    WHERE r.id=p_ride_id
    LIMIT 1;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.fr_road_rides r
    JOIN public.fr_road_ride_bookings b ON b.ride_id=r.id
    WHERE r.id=p_ride_id AND r.driver_id=v_uid
      AND b.status IN ('confirmed','boarding','in_progress','dropped','completed','disputed')
  ) THEN
    RETURN QUERY
    SELECT 'customer'::text,p.full_name,
           coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))
    FROM public.fr_road_ride_bookings b
    JOIN public.profiles p ON p.id=b.passenger_id
    WHERE b.ride_id=p_ride_id
      AND b.status IN ('confirmed','boarding','in_progress','dropped','completed','disputed')
      AND p.role='customer'
    ORDER BY b.created_at DESC
    LIMIT 1;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Contact details are available only to confirmed ride participants';
END;
$$;
REVOKE ALL ON FUNCTION public.fr_road_ride_get_participant_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_road_ride_get_participant_contact(uuid) TO authenticated;
