-- Rollback proposal for 003_sos_and_live_location_policy_hardening_proposal.sql
-- NOT EXECUTED. QA only. Requires explicit approval before execution.
-- This restores the currently catalog-verified policies (snapshot date 2026-11-23).
-- It restores the prior policy logic, not any future policy changes.

-- Restore SOS INSERT policy to prior sender-only predicate:
-- DROP POLICY IF EXISTS qa_sos_insert_own ON public.fr_ride_sos;
-- CREATE POLICY qa_sos_insert_own ON public.fr_ride_sos
--   FOR INSERT TO authenticated
--   WITH CHECK (sender_id = auth.uid());

-- Restore live-location UPDATE policy to prior version:
-- DROP POLICY IF EXISTS qa_live_locations_update_participants
--   ON public.ride_live_locations;
-- CREATE POLICY qa_live_locations_update_participants
--   ON public.ride_live_locations
--   FOR UPDATE TO authenticated
--   USING (
--     user_id = auth.uid()
--     AND EXISTS (
--       SELECT 1 FROM public.rides r
--       WHERE r.id = ride_live_locations.ride_id
--         AND (r.customer_id = auth.uid() OR r.driver_id = auth.uid())
--     )
--   )
--   WITH CHECK (user_id = auth.uid());

-- Catalog snapshot of authenticated table privileges observed:
-- fr_ride_sos: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
-- ride_live_locations: DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE
-- These are broad grants, reviewed separately; rollback does not alter them.
-- If a separate grant-revocation change is ever approved, capture all role/table
-- grantors and grant options first; do not use this file as a generic ACL restore.

-- Before rollback: verify policy names and current definitions again to avoid
-- overwriting legitimate changes made since this snapshot.
