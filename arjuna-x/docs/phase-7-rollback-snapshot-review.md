# Phase 7 — Rollback snapshot review

Date: 2026-11-23. Target QA project only.

## Read-only snapshot verified
Policies on `fr_ride_sos`:
- `qa_sos_admin_read`: SELECT authenticated, admin_users membership predicate.
- `qa_sos_insert_own`: INSERT authenticated, sender_id = auth.uid().
- `qa_sos_read_own`: SELECT authenticated, sender_id = auth.uid().

Policies on `ride_live_locations`:
- `qa_live_locations_insert_participants`: INSERT authenticated; user_id = auth.uid() and ride participant.
- `qa_live_locations_read_participants`: SELECT authenticated; ride participant.
- `qa_live_locations_update_participants`: UPDATE authenticated; USING checks own user_id + ride participant, WITH CHECK only user_id = auth.uid().

## ACL snapshot
Authenticated has DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE on both tables. These broad grants remain a separate Phase 7 grant-hardening issue; RLS does not row-filter TRUNCATE. No grant changes performed.

## Rollback package
- `004_sos_live_location_rollback_proposal.sql` documents restoring the prior two policy definitions.
- It is deliberately commented/non-executable as supplied.
- Rollback must re-query exact policies before execution to avoid overwriting intervening changes.
- ACL rollback is not included because no ACL changes were applied.

## Status
Read-only queries only. No policies, grants, schema, rows, or storage changed. QA branch only; no main merge or deployment.
