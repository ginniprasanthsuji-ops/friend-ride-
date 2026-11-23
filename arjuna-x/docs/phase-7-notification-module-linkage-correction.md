# Phase 7 — Notification Module Linkage Correction

Date: 2026-11-23. QA source cross-check.

## Correction to prior client audit
An additional file `fcm-web-push.js` exists and contains a complete optional web-push opt-in card:
- user taps enable;
- browser notification permission requested;
- Firebase compat SDK scripts loaded;
- Firebase initialized with public client configuration;
- FCM token generated using VAPID public key;
- authenticated session required;
- token POSTed to `fr-notification-register-token`;
- foreground message handler installed.

However, static scan of QA branch main `index.html` found no reference/load of `fcm-web-push.js`. The notification page in `index.html` has a separate generic `frEnableDeviceAlerts()` handler that requests Notification permission and registers service worker only. It does not show token generation or registration.

Therefore:
- token-registration implementation exists as an isolated module;
- its linkage from the primary index page is not evidenced;
- the separate file may be referenced by another entry/page or deployment configuration not inspected yet;
- actual registration/delivery remains runtime unverified.
This is more precise than saying token-registration code is absent.

## Risks
- User may be shown generic “Enable Notifications” permission without FCM registration.
- The isolated module provides a clearer opt-in/token-registration flow, but requires linkage/entrypoint confirmation.
- Restricted external FCM remains active integration; no code or function changes applied.

## Safety
No source edit, deployment, database write, secret access, test dispatch, or production access.
