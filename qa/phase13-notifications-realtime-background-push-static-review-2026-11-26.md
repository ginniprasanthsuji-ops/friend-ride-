# FRIEND RIDE Phase 13 — Notifications, Realtime & Background Push Static Review (2026-11-26)

## Scope
Static inspection of QA branch `index.html`, blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`. No notification/push subscription was created and no device test was performed.

## Source-confirmed
- Notification feed reads recent rows from `fr_ride_notifications` and `fr_app_notifications`, filtered by current user's ID and limited to 50 each.
- Realtime subscribes to INSERT/UPDATE events for both notification tables, filtered by `user_id=eq.<current user>`; reconnect/error status is surfaced in UI.
- Notification rendering tracks unread count and offers Mark as Read. Read updates include a user_id filter.
- Notification arrival triggers in-app toast, vibration (when supported), optional speech/audio; browser notification is attempted only when permission is granted and page is hidden.
- Notification event types refresh partner/customer market-order feeds for selected notification titles/types.
- Device-alert setup requests browser Notification permission, registers `service-worker.js`, awaits service worker readiness/update, obtains PushManager subscription, checks existing endpoint/key and active DB record, unsubscribes if mismatch, subscribes with a configured public VAPID key, then upserts endpoint/key data into `fr_push_subscriptions`.
- Source comment says VAPID private key must remain in Supabase Edge Function secrets.

## Gaps / risks
1. Static source does not prove Realtime publication, database RLS, table existence, or notification data isolation.
2. Push sender Edge Function, private VAPID secret, deployment/config, and delivery responses were not inspected/verified in this continuation.
3. Push subscription table RLS/endpoint uniqueness/ownership policies and inactive-subscription cleanup are unverified.
4. Service-worker registration and browser permission behavior not tested on devices.
5. Browser notification, background push, lock-screen delivery, vibration, audio, speech, logout cleanup and realtime reconnect were not runtime-tested.
6. Push subscription data includes endpoint, key material, user agent; server-side ownership/privacy protections need verification.

## Test status
- Static source review: completed.
- Live Realtime test: not executed.
- Push permission/subscription: not executed.
- Background/locked-device delivery: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Release posture
Notification/realtime/push source wiring is present, but secure DB policies, deployed sender, and real device delivery remain unverified. Release remains blocked.
