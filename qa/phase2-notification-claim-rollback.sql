-- QA-only rollback for 202611230001_fr_notification_claim_batch.sql.
-- Refuses to run while any event is processing; do not run on production.
BEGIN;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.fr_notification_events WHERE status='processing') THEN
    RAISE EXCEPTION 'Rollback refused: notification events are processing; resolve them before rollback.';
  END IF;
END;
$$;
DROP FUNCTION IF EXISTS public.fr_notification_claim_batch(uuid, integer);
DROP INDEX IF EXISTS public.fr_notification_events_claim_idx;
ALTER TABLE public.fr_notification_events
  DROP CONSTRAINT IF EXISTS fr_notification_events_status_check;
ALTER TABLE public.fr_notification_events
  ADD CONSTRAINT fr_notification_events_status_check
  CHECK (status = ANY (ARRAY['queued'::text, 'sent'::text, 'failed'::text, 'skipped'::text]));
ALTER TABLE public.fr_notification_events
  DROP COLUMN IF EXISTS claim_token,
  DROP COLUMN IF EXISTS claimed_at;
COMMIT;
