# Phase 7 — Notification Queue, Token and Dispatch Security Review

Date: 2026-11-23. Read-only QA review.

## Cron enqueue
- QA cron.job has active job `fr-hourly-notification-enqueue`, schedule `0 * * * *` (hourly UTC).
- Job inserts hourly events for users with hourly_enabled=true, respecting quiet hours, and uses ON CONFLICT(event_key) DO NOTHING.
- It only enqueues; does not send push messages directly.

## Trigger inventory
- Read-only information_schema.triggers query for public notification event/preferences/token tables returned no triggers. Notification enqueue and token updates are not trigger-driven in current catalog evidence.

## Token registration function
- `fr-notification-register-token` active version 5; verify_jwt=true.
- Requires Bearer auth and verifies user with auth.getUser.
- Token input nonempty, <=4096 chars; platform allowlist android/ios/web.
- Upserts `fr_notification_tokens` on conflict token with user_id, active=true and last_seen_at.
- Review point: conflict-on-token may transfer an existing token row to another authenticated user if a token is submitted by a different user. Token ownership semantics need test/decision; no change made.

## Dispatch function
- `fr-notification-dispatch` active version 8; verify_jwt=false.
- POST-only; requires `x-dispatch-secret` exactly matching secret environment variable before proceeding.
- Uses service-role Supabase client and Google OAuth service account credentials to call FCM; secret values not read.
- Claims up to 50 events through `fr_notification_claim_batch`, then applies category preferences and sends to active tokens.
- Marks events sent/skipped/failed and clears claim fields. It reports finalizationErrors.
- External FCM delivery is restricted by user preference. This is active code, not executed or deactivated.
- Review points: dispatch secret rotation/rate limiting/monitoring; delivery failures and token deactivation; ownership behavior; batch claim/retry/lease-expiry semantics; verify claim RPC and cron scheduling before any provider de-scope.

## User restriction alignment
- The hourly queue/in-app event foundation can be retained as a local/in-app notification workflow.
- FCM external delivery should be disabled/de-scoped only with an approved QA change and regression coverage.
- No SMS OTP function is present in current QA Edge Function inventory, although frontend calls `Sms-otp`; auth is a blocker until reconciled.

## Safety
No secret values inspected; no functions modified, disabled, or deployed; no SQL writes; QA only; production untouched.
