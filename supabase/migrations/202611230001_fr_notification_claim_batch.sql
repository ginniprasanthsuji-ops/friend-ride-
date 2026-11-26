-- FRIEND RIDE Phase 2: atomic notification-event claims (QA/work branch only).
-- Additive, retryable claim lease. Do not apply to production without release approval.
ALTER TABLE public.fr_notification_events
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

ALTER TABLE public.fr_notification_events
  DROP CONSTRAINT IF EXISTS fr_notification_events_status_check;

ALTER TABLE public.fr_notification_events
  ADD CONSTRAINT fr_notification_events_status_check
  CHECK (status = ANY (ARRAY['queued'::text, 'processing'::text, 'sent'::text, 'failed'::text, 'skipped'::text]));

CREATE INDEX IF NOT EXISTS fr_notification_events_claim_idx
  ON public.fr_notification_events (status, created_at)
  WHERE status IN ('queued', 'processing');

CREATE OR REPLACE FUNCTION public.fr_notification_claim_batch(
  p_claim_token uuid,
  p_limit integer DEFAULT 50
)
RETURNS SETOF public.fr_notification_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF p_claim_token IS NULL THEN
    RAISE EXCEPTION 'Claim token required';
  END IF;

  RETURN QUERY
  WITH candidates AS (
    SELECT e.id
    FROM public.fr_notification_events e
    WHERE e.status = 'queued'
       OR (e.status = 'processing'
           AND (e.claimed_at IS NULL OR e.claimed_at < now() - interval '10 minutes'))
    ORDER BY e.created_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 50)
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.fr_notification_events e
  SET status = 'processing',
      claim_token = p_claim_token,
      claimed_at = now(),
      error_message = NULL
  FROM candidates c
  WHERE e.id = c.id
  RETURNING e.*;
END;
$function$;

REVOKE ALL ON FUNCTION public.fr_notification_claim_batch(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fr_notification_claim_batch(uuid, integer) TO service_role;
