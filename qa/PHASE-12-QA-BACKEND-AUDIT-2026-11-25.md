# Phase 12 — QA Backend Audit Notes (Read-only, 2026-11-25)

## QA project identity / inventory
- QA Supabase ref: `pqsangtvietawkfgpgfu`.
- Public base-table inventory: 21 tables.
- Migration inventory: 25 recorded migrations, mainly Learn/Teach/Zoom/Homework objects, plus a small FRIEND RIDE notification foundation and QA rides table.
- This QA project does NOT currently match the 71-table FRIEND RIDE main-project inventory documented in the 2026-11-09 release gate. Treat it as a separate/mismatched QA environment until project refs and migration history are reconciled.

## Notification infrastructure confirmed in QA
Tables and inspected columns:
- `fr_app_notifications`: user, type, title/body, action URL, optional order/ride refs, dedupe key, read state and timestamps.
- `fr_notification_events`: event key (unique), user, category, title/body, payload, queued/processing/sent/failed/skipped status, sent timestamp, claim token/time.
- `fr_notification_preferences`: per-user ride/order/payment/account/partner/hourly/promo toggles and quiet-hours.
- `fr_notification_tokens`: user, token, platform, active state and last-seen.
- `fr_push_subscriptions`: endpoint/keys, user, active state, timestamps and last-success.
These are existing infrastructure, but the coupon workflow cannot yet be assumed to integrate with them without validating triggers, RPCs, RLS, and actual client/edge behavior.

## Relevant function inspection
Only two public functions matched the inspected payment/order/coupon/notification search:
- `fr_create_notification_preferences_for_new_user()`: SECURITY DEFINER; `search_path=public`; inserts default preference row on user creation, conflict-safe.
- `fr_notification_claim_batch(p_claim_token uuid, p_limit integer)`: SECURITY DEFINER; empty search_path; claims queued or stale processing events using `FOR UPDATE SKIP LOCKED`; limit is clamped to 1–50; returns claimed event rows.
ACL snapshot showed these functions executable by postgres and service_role only (not anon/authenticated).
No coupon, payment, or order RPCs were found in this QA project under the inspected name filter. This is another indication that the QA database is not a full FRIEND RIDE QA copy.

## Coupon implementation decision
- Do NOT write or apply coupon migrations to this QA project yet.
- First reconcile the correct QA project ref, migration set, and app environment configuration.
- When the correct QA backend is confirmed, inspect existing direct-store payment confirmation, order ledger, RLS policies, store roles/ownership, and notification event path before drafting final SQL.
- No SQL DDL or data modifications were executed in this audit.

## Evidence / next work
Next: reconcile Supabase project identity/config and migration provenance; then audit payment and store recognition RPCs in the correct QA project. Production remains untouched.
