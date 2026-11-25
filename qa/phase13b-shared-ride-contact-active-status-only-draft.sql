-- Phase 13B: Shared Ride contact privacy correction draft
-- QA-only SQL draft. NOT applied. Main/Production untouched.
-- Contact disclosure only for confirmed/boarding/in_progress booking states.
-- Passenger sees assigned driver; assigned driver sees this booking's passenger.
-- No direct table contact-field access is granted by this draft.

CREATE OR REPLACE FUNCTION public.fr_shared_ride_get_participant_contact(p_booking_id uuid)
RETURNS TABLE(contact_role text, contact_name text, contact_phone text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_booking public.fr_shared_ride_bookings%rowtype;
  v_driver_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Login required'; END IF;

  SELECT * INTO v_booking
  FROM public.fr_shared_ride_bookings b
  WHERE b.id = p_booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;

  IF v_booking.status NOT IN ('confirmed','boarding','in_progress') THEN
    RAISE EXCEPTION 'Contact details are available only during an active confirmed booking';
  END IF;

  SELECT r.driver_id INTO v_driver_id
  FROM public.fr_shared_rides r
  WHERE r.id = v_booking.ride_id;
  IF v_driver_id IS NULL THEN RAISE EXCEPTION 'Ride not found'; END IF;

  -- Passenger: disclose only the assigned, approved driver profile.
  IF v_booking.passenger_id = v_uid THEN
    RETURN QUERY
    SELECT 'driver'::text, p.full_name,
      coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))
    FROM public.profiles p
    WHERE p.id = v_driver_id
      AND p.role = 'driver'
      AND p.driver_approval_status = 'approved'
      AND coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')) IS NOT NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'Assigned approved driver contact unavailable'; END IF;
    RETURN;
  END IF;

  -- Driver: disclose only the customer belonging to this booking.
  IF v_driver_id = v_uid THEN
    RETURN QUERY
    SELECT 'customer'::text, p.full_name,
      coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),''))
    FROM public.profiles p
    WHERE p.id = v_booking.passenger_id
      AND p.role = 'customer'
      AND coalesce(nullif(trim(p.whatsapp_phone),''),nullif(trim(p.phone),'')) IS NOT NULL;
    IF NOT FOUND THEN RAISE EXCEPTION 'Booking passenger contact unavailable'; END IF;
    RETURN;
  END IF;

  RAISE EXCEPTION 'Contact details are available only to this booking participants';
END;
$$;


REVOKE ALL ON FUNCTION public.fr_shared_ride_get_participant_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_get_participant_contact(uuid) TO authenticated;

-- Review and validate before application:
-- 1. Verify approved-driver field semantics and the exact active booking statuses.
-- 2. Ensure contact fields are not exposed through public/shared ride listing views or table SELECT.
-- 3. Negative authorization tests: anon, unrelated passenger, wrong driver, pending, cancelled,
--    refund_pending, refunded, completed, no_show, disputed.
-- 4. Positive tests: booking passenger and assigned driver only, confirmed/boarding/in_progress.
-- 5. Test missing/blank phone handling; no phone value should be logged in test output.
-- 6. Inspect grants and rollback before applying to disposable QA.
