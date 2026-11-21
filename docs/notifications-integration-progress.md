# FRIEND RIDE Notifications — Integration 1

## Implemented on isolated integration branch
- Browser notification adapter now supports capability/permission checks, explicit user permission request, local notification delivery via registered service worker when available (foreground Notification fallback), and push subscription/unsubscription helpers.
- No permission request occurs during page load.
- Push subscription requires a valid public VAPID key passed by caller. No keys are hard-coded or committed.
- Adapter reports clear unsupported/permission/key errors rather than silently pretending success.
- Notification click behavior remains handled by existing service worker.
- Provider is not wired to app UI or business events yet; existing app behavior remains unchanged.

## Required before production/background push
1. Confirm and provision VAPID public/private keys securely.
2. Add Supabase table for device push subscriptions with user ownership and RLS.
3. Implement trusted Edge Function/server sender using private VAPID key stored as a secret.
4. Map business events (ride request/acceptance/start/complete, delivery/order status, partner/admin updates) to notification templates and recipients.
5. Add opt-in/out UI and subscription lifecycle management.
6. Test foreground, background, closed-app, Android WebView/native wrapper, permission denial, duplicate subscriptions, expiry, and click navigation.
7. Confirm the user-visible notification schedule/events; do not send arbitrary hourly notifications without a clear product requirement and consent.

## Safety
This is an additive adapter on the integration branch. It does not modify main/live, does not automatically prompt for permission, and does not send push messages without a trusted sender.
