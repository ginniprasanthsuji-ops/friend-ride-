# Phase 7 — Client Notification Fallback & PWA Review

Date: 2026-11-23. QA branch source-only.

## Frontend notification integration
- Main `index.html` has a device-alert permission flow: requests Notification permission and registers `service-worker.js`.
- Static source scan found no direct frontend call to `fr-notification-register-token`, no references to `fr_notification_events` or `fr_notification_preferences` in the main HTML, and no frontend hourly preference setting found in this file.
- Therefore current client-side permission UX does not establish FCM token registration or user notification preference management in the primary HTML. It only grants browser permission/registers SW.
- Service worker imports Firebase Messaging compat scripts from Google CDN, initializes Firebase client configuration, handles FCM background messages and generic push events with Telugu ride/order/delivery/payment text, notification click navigation.
- The service worker uses external Firebase script imports; this is an external runtime dependency.
- A public Firebase client config/API key in frontend/SW is not a server secret, but Firebase project security/config restrictions must be reviewed. No key/secret values reproduced in this document.

## Risk and fallback
- Background notification UX depends on service-worker + external Firebase messaging runtime for FCM message handling.
- If FCM is de-scoped, permission UI should not imply push is enabled. Preserve in-app notifications and explicit polling/refresh where implemented, but verify each notification-producing workflow.
- Current source does not demonstrate a client notification preference screen or token-registration call in the main HTML; check dynamic modules/repository-wide files before conclusion.
- No runtime/browser tests run.

## Safety
No source edits, service-worker change, Edge Function change, database writes, secrets, deployment, merge, or production changes.
