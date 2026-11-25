-- Phase 13 QA-only correction for participant SELECT recursion and booking correlation.
-- Apply ONLY to the disposable FRIEND RIDE QA Supabase project; production is untouched.
-- The prior SELECT policies compared b.ride_id=b.id (a booking row to its own PK),
-- which failed participant correlation and triggered recursive RLS when policies
-- referenced the parent ride table from the booking table.
--
-- Helpers accept only the ride id and derive the passenger from auth.uid(), so
-- clients cannot probe another user's booking by passing an arbitrary user id.
CREATE OR REPLACE FUNCTION public.fr_road_ride_is_passenger(p_ride_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fr_road_ride_bookings b
    WHERE b.ride_id = p_ride_id
      AND b.passenger_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.fr_shared_ride_is_passenger(p_ride_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fr_shared_ride_bookings b
    WHERE b.ride_id = p_ride_id
      AND b.passenger_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.fr_road_ride_is_passenger(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fr_shared_ride_is_passenger(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fr_road_ride_is_passenger(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fr_shared_ride_is_passenger(uuid) TO authenticated;

DROP POLICY IF EXISTS fr_road_rides_live_or_driver_select ON public.fr_road_rides;
CREATE POLICY fr_road_rides_live_or_driver_select
ON public.fr_road_rides
FOR SELECT
TO authenticated
USING (
  status = 'live'
  OR driver_id = (SELECT auth.uid())
  OR public.fr_road_ride_is_passenger(id)
);

DROP POLICY IF EXISTS fr_shared_rides_read_live_or_participant ON public.fr_shared_rides;
CREATE POLICY fr_shared_rides_read_live_or_participant
ON public.fr_shared_rides
FOR SELECT
TO authenticated
USING (
  status IN ('live', 'full')
  OR driver_id = (SELECT auth.uid())
  OR public.fr_shared_ride_is_passenger(id)
);
