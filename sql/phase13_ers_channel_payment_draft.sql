-- Phase 13 ERS migration DRAFT — NOT APPLIED
-- QA branch only. Review with existing ride UI/API before execution.
-- Separates ERS from ordinary rides and stores customer payment choice.
-- Existing rows remain 'standard'; no production data changes.

BEGIN;

ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS service_channel text NOT NULL DEFAULT 'standard';

ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS payment_method text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.rides'::regclass
      AND conname='rides_service_channel_allowed'
  ) THEN
    ALTER TABLE public.rides
      ADD CONSTRAINT rides_service_channel_allowed
      CHECK (service_channel IN ('standard','ers'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.rides'::regclass
      AND conname='rides_payment_method_allowed'
  ) THEN
    ALTER TABLE public.rides
      ADD CONSTRAINT rides_payment_method_allowed
      CHECK (payment_method IS NULL OR payment_method IN ('cash','upi'));
  END IF;
END $$;

COMMIT;

-- Important: This draft alone does not create ERS listings or bookings.
-- Dedicated authenticated RPCs, RLS review, atomic availability reservation,
-- and UI integration are still required. Do not apply until reviewed.
