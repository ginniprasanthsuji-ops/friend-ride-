-- Phase 13 RRS cash-only payment draft — QA branch; NOT APPLIED
-- Requires reviewed existing RRS booking schema. No production changes.
BEGIN;
ALTER TABLE public.fr_road_ride_bookings
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'cash';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.fr_road_ride_bookings'::regclass
      AND conname='fr_road_ride_bookings_cash_only'
  ) THEN
    ALTER TABLE public.fr_road_ride_bookings
      ADD CONSTRAINT fr_road_ride_bookings_cash_only
      CHECK (payment_method = 'cash');
  END IF;
END $$;
COMMIT;
-- This schema draft blocks non-cash payment_method values for RRS bookings.
-- Booking RPC/UI integration and driver cash-received confirmation remain pending.
-- Review existing RPCs and RLS before applying in QA.
