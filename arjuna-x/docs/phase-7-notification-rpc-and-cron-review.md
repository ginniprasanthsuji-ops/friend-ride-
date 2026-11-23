# Phase 7 — Notification RPC, RLS & Cron Review

## Function privileges
- `fr_notification_claim_batch`: EXECUTE is service_role only; anon/authenticated denied. SECURITY DEFINER, empty search_path; claim token required; limit clamped 1–50; queue/expired-processing rows selected with `FOR UPDATE SKIP LOCKED`; updates processing status, claim token/time, clears error. Good isolation for queue worker. Confirm edge worker handles claim token and stale claim/retry semantics.
- `fr_create_notification_preferences_for_new_user`: EXECUTE service_role only; trigger SECURITY DEFINER inserts default preferences for new user with conflict-safe behavior. Trigger source uses `search_path=public`; schema qualification used.
- `fr_public_homepage_feedback`: anon/authenticated/service_role execute; returns only feedback marked kind feedback, homepage visible, published; max 20 rows; name capped at 80. Public content exposure is intentional only if consent and moderation are enforced.

## Notification table policies (catalog)
- `fr_notification_events`: authenticated SELECT own user_id only.
- `fr_notification_preferences`: authenticated ALL, own user_id in USING and WITH CHECK.
- `fr_notification_tokens`: authenticated ALL, own user_id in USING and WITH CHECK.
- `fr_push_subscriptions`: authenticated ALL, own user_id in USING and WITH CHECK.
- `fr_ride_notifications`: authenticated SELECT and UPDATE own user_id; UPDATE policy own-row only. Verify column-level UPDATE grants prevent editing sensitive notification content/status fields; broad table UPDATE grants remain a separate concern.

## Cron review
- Active job `fr-hourly-notification-enqueue`, schedule `0 * * * *` (hourly at minute 0).
- Job inserts idempotent hourly event keys, only users with hourly_enabled=true; respects quiet-hours logic; `ON CONFLICT(event_key) DO NOTHING` prevents duplicate events.
- Quiet-hours computation uses UTC clock against stored time values. Confirm intended user timezone convention; if preferences are local time, this is a potential timezone mismatch.
- Queue job only enqueues; push delivery end-to-end remains unverified.

## Runtime test matrix
- anon cannot claim notification queue or create preferences via direct RPC.
- authenticated cannot claim queue; own event read allowed, other-user event denied.
- preferences/device tokens/push subscription CRUD own UID only; cross-user denied.
- notification UPDATE limited to permitted columns; cross-user denied.
- claim batching clamp, concurrency SKIP LOCKED, stale processing reclaim, idempotent cron, quiet-hours boundary/overnight and timezone behavior.
- public feedback anonymous access only to explicitly published/homepage-consented entries.

Static catalog/source review only; no notification mutation, RPC invocation, SQL migration, or production changes.