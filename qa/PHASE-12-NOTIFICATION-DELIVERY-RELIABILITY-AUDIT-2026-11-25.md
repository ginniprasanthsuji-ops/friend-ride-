# Phase 12 — Notification Delivery & Reliability Audit (2026-11-25)

QA project inspected read-only: pqsangtvietawkfgpgfu. Production untouched. No SQL changes.

## Database structure found
- fr_app_notifications: user-targeted in-app notification, type/title/body/action URL, related ride/order, dedupe_key, read state.
- fr_notification_events: event key, user, category, payload, status/error, sent_at, claim_token, claimed_at.
- fr_notification_preferences: per-category toggles, promo/hourly flags, quiet-hours settings.
- fr_notification_tokens: user token, platform, active flag, last_seen.
- fr_ride_notifications: ride-linked notification records and read state.

## Static implementation observations
- Repository includes notification fallback (Realtime + polling) for active sessions and browser notification behavior.
- FCM web-push registration code requests permission after user interaction, obtains token, and sends it to a Supabase function endpoint.
- Setup notes call out testing foreground/background delivery, token refresh, permission denial, invalid-token cleanup.
- README documents that background push when browser/app is closed is not fully activated by the frontend alone; trusted backend sender and token storage/configuration are required.
- service-worker handlers for notification click and push are present in searched source.
- Earlier static RPC review identified notification batch-claim behavior using SKIP LOCKED; throughput, stale claims, retries, and duplicate delivery are runtime-unverified.

## Runtime tests pending
1. Foreground realtime notification received.
2. Polling fallback recovers missed realtime event.
3. Background push delivered.
4. App/browser fully closed push delivered.
5. Token registration, refresh, logout, and invalid-token cleanup.
6. Permission denied / unavailable browser.
7. Duplicate event/dedupe key handling.
8. Batch claim concurrency and stale-claim recovery.
9. Retry and error status visibility.
10. Quiet hours/category preference respected.
11. Notification tap opens correct ride/order.
12. Recipient-role isolation and RLS checks.

## Status
Static catalog/source review: checkpoint complete.
Runtime/device delivery: not tested.
SQL changes: 0.
Production: untouched.
