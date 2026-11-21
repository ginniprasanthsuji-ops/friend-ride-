# FRIEND RIDE Notifications — Integration 1

## CI status
- Latest integration branch commit: `6601a47` (subscription lifecycle mock chaining fix).
- Scaffold tests: PASS.
- Notification unit, lifecycle, and preservation regression tests: PASS.
- Push sender static/security tests: PASS.
- These are CI/static checks only; no live-device or deployed Edge Function runtime test has been performed.

## Existing application notification behavior audited
The app's existing notification page and alert pipeline are already present and must be preserved:
- Existing tone previews and notification sounds for order, ride, and customer alerts.
- Existing role-based classification, voice/speech, vibration, toast, browser alerts, recent feed/unread state, and Supabase Realtime.
- Existing notification page includes a device-alert enable control and tone-preview controls.
- Existing `frEnableDeviceAlerts()` implementation (the later definition is active) requests permission only on user action, registers `service-worker.js`, reads the public VAPID key, creates/validates the Push subscription, and upserts `fr_push_subscriptions`.
- Public VAPID key is client-side by design; private VAPID key and internal sender secret must remain Supabase Edge Function secrets.
- Earlier duplicate/legacy permission-only function exists in the HTML; active later function provides background push subscription.

## Integration branch additive modules
- `integrations/notifications/notification-provider.js`: opt-in browser notification adapter and push subscribe/unsubscribe.
- `integrations/notifications/notification-events.js`: role/event templates and Telugu event catalog.
- `integrations/notifications/push-subscription-lifecycle.js`: isolated helper with enable/disable lifecycle behavior and tests; not wired into the app because the app already has an existing lifecycle implementation.
- `supabase/functions/fr-push-send/index.ts`: internal-secret protected sender, service-role access, VAPID secrets from environment, user/subscription limits, URL sanitization, delivery result accounting, and deactivation of expired (404/410) subscriptions. Static tests pass; function is not deployed.

## Supabase audit (read-only)
- Production project inspected read-only.
- `fr_push_subscriptions` exists and is RLS protected; existing schema is used by the app.
- `fr_app_notifications` and `fr_ride_notifications` also exist with RLS enabled.
- No production schema, policies, secrets, or Edge Function deployment changes were made.

## Remaining work before production
1. Build trusted server-side event-to-recipient mapping for ride, delivery, order/food/local-market, home-service, Work/Task/Gigger, partner, and admin/complaint events. Never trust client-supplied recipient IDs for privileged events.
2. Reconcile event catalog with actual backend trigger points and existing in-app notification feed so push and inbox behavior are consistent.
3. Test deployed sender against test subscriptions, including invalid/expired endpoint cleanup, retries, recipient authorization, rate limiting, and safe logs.
4. Device/browser tests: foreground, background, app closed, Android wrapper, permission denial, multiple devices, duplicate subscriptions, and notification-click navigation.
5. Full regression of existing notification sounds/tone, voice, vibration, home/work/market alerts, ride/order flows, and all existing UI.
6. Only after explicit approval: provision Edge Function secrets, deploy sender, and perform controlled end-to-end test. Main/live remains untouched until approved.

## Preservation rule
Do not change existing notification tones, alert UI, Home/Work/Market coverage, vibration, voice, realtime feed, or Service Worker click behavior as part of this additive integration.
