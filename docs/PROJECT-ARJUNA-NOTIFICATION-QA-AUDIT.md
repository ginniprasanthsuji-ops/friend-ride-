# Project Arjuna — Notification QA Audit (2026-11-22)

## Scope
Audit existing FRIEND RIDE web push, foreground notification, service-worker, and fallback notification paths before implementing Telugu voice, marketing, and Vidya Setu homework notifications. Preserve backend/schema/auth/payment behavior.

## Existing files inspected on `friendride-ui-navy-orange-live-preview`
- `FCM-WEB-PUSH-SETUP.md`
- `fcm-web-push.js`
- `firebase-messaging-sw.js`
- `fr-notification-fallback.js`
- `service-worker.js`
- `package.json`
- `playwright.config.cjs`
- `qa/friend-ride.spec.cjs`

## Findings
1. FCM setup doc still describes the Firebase service-worker config as placeholder/incomplete, while the inspected workers currently contain Firebase web configuration. Reconcile docs with deployed configuration, without exposing private credentials.
2. `fcm-web-push.js` registers `./service-worker.js` and passes that registration to FCM `getToken`. `service-worker.js` includes Firebase Messaging SDK and background handling. Confirm scope and existing registrations on real browser/PWA devices before modifying.
3. `firebase-messaging-sw.js` is a second Firebase worker with similar background handling. Potential duplicate worker/config path exists; audit registration references and browser registration state to prevent duplicate notifications.
4. `fr-notification-fallback.js` uses Supabase Realtime plus a 60-second polling fallback for `fr_notification_events`; it renders in-app cards and browser notifications when permission is granted. Deduplication is an in-memory Set only, so app restart/reload behavior needs testing.
5. `service-worker.js` has role-aware Telugu text, vibration patterns and `requireInteraction` for driver/partner cases. It is not evidence of Telugu spoken voice; no verified native/background speech path has been established.
6. Current Playwright config targets GitHub Pages production URL by default. QA must use the preview/staging URL explicitly when testing unmerged branch code. Do not use live production writes.
7. Existing tests include source-marker checks and simulations. Real device push, voice, OTP, GPS, and payments remain live-device/staging-only gates.

## Locked notification requirements
- Transactional/service notifications remain separate from marketing notifications.
- Telugu-first text and voice, with user controls: voice on/off, important-only voice, sound on/off, quiet hours.
- Marketing offers: opt-in, opt-out, campaign schedule, frequency cap, dedupe, clear validity/terms.
- Vidya Setu: homework created, due-date reminders, deadline reminders, submission confirmation, teacher feedback, class-material notifications.
- Notification Center categories: Service, Marketing, Education, Security.
- Do not modify Supabase schema/RLS/Edge Functions, Auth, OTP, payments or existing business logic without explicit approval.

## Next QA sequence
1. Identify all notification script injection and worker registration callsites in the SPA and check whether duplicate workers/notifications are possible.
2. Build a test matrix for foreground, background, closed-app, permission denied, token refresh, logout/login, duplicate events, quiet hours and voice availability.
3. Validate selected UI preview branch through browser/mobile QA, using non-production accounts and no production writes.
4. Implement notification enhancements incrementally only after the audit; first reuse existing event infrastructure.
5. Voice/background support must be feature-detected and tested on actual Android devices; web speech APIs are foreground-only/variable support and cannot be promised as reliable closed-app voice.

## Release safety
PR #38 remains draft and unmerged. Main and production deployment stay untouched until regression is green and release approval is explicit.
