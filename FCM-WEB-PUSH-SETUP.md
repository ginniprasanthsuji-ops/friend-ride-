# FRIEND RIDE FCM Web Push Integration — QA Status

## Current source audit (2026-11-23)

- The site opt-in handler `frEnableDeviceAlerts()` currently registers a browser Web Push subscription through `PushManager.subscribe()` and upserts it into `fr_push_subscriptions`.
- The active QA dispatcher `fr-notification-dispatch` (version 7, `verify_jwt=false`) is guarded by the `FR_NOTIFICATION_DISPATCH_SECRET` header and sends Firebase Cloud Messaging (FCM) deliveries from `fr_notification_tokens`; it does not consume `fr_push_subscriptions`.
- The active QA token registration function `fr-notification-register-token` (version 5, JWT required) accepts `token` + `platform` (`web` is allowed), resolves the caller with `auth.getUser()`, and upserts into `fr_notification_tokens`.
- The site opt-in function does not currently call `fr-notification-register-token` or Firebase Messaging `getToken()`. Therefore this web opt-in and the FCM dispatcher are not wired together. Background notification delivery from this path is **not verified**.
- The repository includes both `service-worker.js` (Web Push event handler) and `firebase-messaging-sw.js` (Firebase Messaging background handler). They are separate delivery paths and require a deliberate integration decision.
- Read-only QA DB count check on 2026-11-23: `fr_notification_events=0`, `fr_notification_tokens=0`, `fr_push_subscriptions=0`. No device or delivery data exists in QA to prove delivery.

## Firebase public web configuration

The Firebase web app's public configuration is present in the Firebase Messaging service worker. Public web config values are not service-account credentials. Do not put service-account private keys, FCM private key material, dispatcher secrets, or Supabase service-role keys in browser files or documentation.

## Required integration and release tests

1. Confirm the intended web push architecture and VAPID public key with the Firebase project owner.
2. On a QA-only change, initialize Firebase Messaging in the page using the existing public app config; register the root `firebase-messaging-sw.js`; obtain an FCM token using the approved Firebase VAPID key.
3. Call `fr-notification-register-token` with the authenticated session and `{ token, platform: "web" }`; confirm the function binds token ownership to the session user.
4. Preserve or deliberately retire the legacy `fr_push_subscriptions` opt-in path only after an approved migration and regression plan. Do not leave two buttons claiming successful background delivery when only one path is consumed.
5. Validate permission denied, unsupported browsers, token refresh, logout/account-switch ownership, invalid/unregistered token cleanup, foreground and background delivery, notification click navigation, and Android physical device/PWA installation.
6. Verify the QA dispatcher secret and FCM service-account secret configuration by an authorized owner-side presence check; never read or log secret values.
7. Test the event producer, dispatcher queue claim/deduplication, category preferences, quiet hours, retry behavior and concurrent delivery.

## Release status

**BLOCKED / NOT ACCEPTED.** Source integration mismatch and zero QA token/event/subscription rows are confirmed. No production changes or deployments were made. Device tests, owner-side credential verification, event producer integration, and safe queue concurrency remain open.
