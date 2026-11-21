# FRIEND RIDE Release Blocker Tracker

**Branch:** `qa/navigation-isolation-fix-2026-11-21`  
**Current QA commit at tracker creation:** `88b6489f295511dc32ad70f488b06c12aa8017f1`  
**Release status:** BLOCKED — Main is unchanged; no live deployment or release approval.

This tracker separates source/UI evidence from backend execution and real-device evidence. A visible form, table, RPC name, or browser mock does not count as a completed backend workflow.

## 1. Food Delivery backend — BLOCKED
- [ ] Restaurant listing is backed by approved restaurants.
- [ ] Menu items load from database with availability/price.
- [ ] Customer cart, address, order submission persist to DB.
- [ ] Restaurant can accept/reject and update order state.
- [ ] Delivery partner assignment and status tracking work.
- [ ] Payment, cancellation/refund states are verified.
- [ ] RLS/ownership tests: customer, restaurant, delivery partner, admin.
- [ ] End-to-end staging order with evidence.

## 2. Goods Delivery database integration — BLOCKED
- [ ] Generic goods request form writes to a dedicated DB record/RPC (not only a validation message).
- [ ] Customer can see own request and tracking ID after reload.
- [ ] Admin can triage/assign.
- [ ] Driver assignment is authorized and driver sees only assigned deliveries.
- [ ] Delivery OTP: correct, incorrect, expired, resend cooldown and attempt-limit tests.
- [ ] Completed delivery status, timestamp and payment/collection state persist.
- [ ] RLS ownership/role regression.

## 3. Home Services & Technician registration — BLOCKED
- [ ] Provider/technician application creates DB row.
- [ ] Service categories map to actual service slugs; remove unsupported umbrella mapping or translate it explicitly.
- [ ] Profile photo and required documents upload to private storage.
- [ ] Application status: submitted → admin review → approved/rejected.
- [ ] Admin review UI and private-document preview work.
- [ ] Only approved providers can be listed/assigned; online/availability checks enforced.
- [ ] Provider job state changes are restricted to assigned provider.
- [ ] Real staging registration/review/assignment/completion flow.

## 4. Notifications scheduling & targeting — BLOCKED / NOT VERIFIED
- [ ] Marketing notifications: campaign draft/schedule, role/interest segmentation, frequency caps, consent/preferences, unsubscribe, delivery/failed status.
- [ ] Student homework reminders: assignment due-date scheduler, pre-due and due-time reminder policy, cancel/skip when completed, teacher assignment/update notification, student/parent recipient mapping.
- [ ] Separate notification categories and preference toggles (transactional, marketing, learning/homework); marketing opt-out must not suppress essential homework reminders.
- [ ] Server-side schedule queue with idempotency keys; browser timers are not sufficient.
- [ ] Server-side scheduler/cron (not browser-only timer) configured and active.
- [ ] User activity segments and role targeting implemented and tested.
- [ ] Frequency cap: maximum 4 promotional notifications/day, with spacing of roughly 6–8 hours where applicable.
- [ ] Quiet hours 22:00–08:00 respected.
- [ ] Ride/Food/Store/Service relevance targeting verified.
- [ ] Hourly reminder requirement clarified as separate operational reminder vs promotional cap.
- [ ] Push token lifecycle, retries, unsubscribe/preferences and duplicate prevention.
- [ ] Closed-app/background delivery tested on real Android device(s).

## 5. Full regression rerun — PENDING
- [ ] Latest QA commit browser CI passes.
- [ ] Role routing/navigation regression.
- [ ] OTP/auth/session tests.
- [ ] Ride booking, driver acceptance, start/completion, tracking and SOS.
- [ ] Partner/store/catalogue/cart/multi-store checkout.
- [ ] Food, goods/parcel, TASKO/Laundry and Home Services flows.
- [ ] Complaint/feedback and admin review.
- [ ] Storage/privacy/RLS/authorization checks.
- [ ] Cashfree/payment flows and webhook idempotency.
- [ ] Read-only SQL regression report reviewed; no destructive test on production.

## 6. Android real-device tests — NOT TESTED
- [ ] Install test build on physical Android device.
- [ ] OTP received and login/session/logout verified.
- [ ] Location permission, GPS movement and live tracking verified with two devices.
- [ ] Foreground/background/closed-app notifications and quiet hours tested.
- [ ] Camera/photo/document upload, QR and OTP delivery flow tested.
- [ ] Network interruption/reconnect and app restart tested.
- [ ] Payment flow tested with approved sandbox/live-safe test.
- [ ] Battery/background behavior and Android permissions reviewed.
- Evidence must identify device, Android version, build SHA and test result.

## 7. Final release approval — NOT APPROVED
Approval only after all blockers are closed, full regression passes, physical-device evidence is attached, security/privacy checks are reviewed, signed AAB is validated, Play Console policy/store assets/data-safety/account-deletion checks are complete, and a release approver records sign-off.

## Current evidence
- Browser CI run #228: SUCCESS at commit `88b6489f295511dc32ad70f488b06c12aa8017f1`.
- This CI result is browser automation only. It does **not** certify live backend workflows, Android real-device behavior, production push/payment delivery, or release readiness.


## 8. Notification source audit — QA branch (2026-11-21)
- [x] Confirmed the frontend has a Web Push subscription flow using `fr_push_subscriptions` and a public VAPID key; private key must stay in server secrets.
- [x] Confirmed service worker handles push display and notification click navigation.
- [x] Confirmed realtime notification feed reads `fr_ride_notifications` and `fr_app_notifications`.
- [ ] Found two `frEnableDeviceAlerts()` definitions in `index.html`; the later VAPID-backed definition overrides the earlier legacy permission-only function. Remove legacy duplicate after regression-safe review.
- [ ] Repository tree has no `supabase/functions` Edge Function directory; no sender/scheduler implementation is present in this QA branch tree. Server-side campaign and homework reminder delivery therefore remains unimplemented/unverified.
- [ ] `fr_push_subscriptions` upsert and policy/schema compatibility not verified against the FRIEND RIDE Supabase project.
- [ ] Background push sender, retry/expiry, campaign queue, homework schedule queue, delivery receipts, unsubscribe/preferences, quiet hours and duplicate suppression remain blockers.
- [ ] Do not claim push delivery success: physical Android device and closed-app tests are still required.


## 9. Notification schema groundwork — QA only (2026-11-21)
- [x] Added migration draft `supabase/migrations/20261121100000_notification_scheduler_foundation.sql`: preference categories, admin campaigns, homework reminders, server-owned idempotent queue, RLS scaffolding.
- [ ] Migration NOT applied to any Supabase project; review schema compatibility before applying.
- [ ] Edge Function sender/scheduler, cron, delivery retries/receipts, consent enforcement, frequency/quiet-hour policy enforcement and device testing still NOT implemented.
- [ ] Parent/student recipient mapping must be validated with the education account data model; migration currently supports optional parent user ID but does not prove relationship authorization.
- [x] Browser Regression CI run #239 succeeded at commit `4b4234b384a1643517d342f79113a476604b23af` (JS validation, npm install, Chromium setup, static app server, and browser regression all passed). This is browser-only evidence, not backend/device/release certification.

- [x] Read-only QA Supabase schema audit: QA project uses `admin_users(user_id)`, not `profiles(role)`; homework source table `fr_learn_homework` exists with teacher/student IDs, date, checklist, and completion/approval fields.
- [x] Notification migration admin RLS checks updated to QA project's `admin_users` membership (QA branch commit only).
- [ ] Migration still not applied; verify SQL in isolated QA DB before applying. Homework reminder integration with existing homework rows remains pending.


## 10. Learn & Teach backend mapping audit — QA (2026-11-21)
- [x] Inspected `learn-teach.js`: frontend currently queries `learn_teach_accounts`, `learn_teach_courses`, `learn_teach_requests`, `learn_teach_notification_settings`, and `learn_teach_notifications`; it contains no homework UI/source query.
- [x] Read-only QA Supabase table inventory: current QA database contains only `fr_learn_*` education tables plus `admin_users`; the frontend's `learn_teach_*` tables are absent from the current QA project inventory.
- [ ] Critical backend/frontend schema mismatch: Learn & Teach frontend is not aligned with current QA database. Do not apply notification or homework migration or claim those features are live until correct project/schema is reconciled.
- [ ] The Learn & Teach migration draft also references `profiles` for admin helper, while current QA project uses `admin_users`; migration compatibility review required.
- [ ] Student homework reminder UI, source mapping, recipient consent, and secure server-side scheduler remain not implemented/verified.


## 11. Backend project reconciliation — read-only (2026-11-21)
- [x] QA Supabase project `pqsangtvietawkfgpgfu` is Learn-Teach education schema with `fr_learn_*` tables; it does not contain frontend `learn_teach_*` tables.
- [x] Production Supabase project `fglyplxcczdjtfwobtzh` does contain the five frontend tables `learn_teach_accounts`, `learn_teach_courses`, `learn_teach_requests`, `learn_teach_notification_settings`, `learn_teach_notifications` (read-only inventory only).
- [ ] Production is not modified. QA project/schema reconciliation remains a blocker: establish a separate QA backend matching production Learn & Teach schema or update frontend/migrations to use QA `fr_learn_*` schema after explicit architecture review.
- [ ] Notification foundation migration's admin membership check currently targets QA `admin_users`; production schema/policies must be separately verified before use.
- [x] Browser regression CI run #241 succeeded at SHA `efec33f69a214b59f9eac7967ab929edc056b06`; this verifies frontend browser suite only.


## 12. Production Learn & Teach policy audit — read-only (2026-11-21)
- [x] Read-only production RLS policy inventory for the five `learn_teach_*` tables reviewed. Student self-read, provider request access, course publication restrictions, own notification settings, notification admin insert and user read/update policies are present in the current policy inventory.
- [x] Read-only function definition confirms production `fr_learn_teach_is_admin()` checks `public.profiles(id,role='admin')`; do not reuse the QA `admin_users` policy expression for production without adaptation.
- [ ] Policies are not runtime authorization tests; test with student, approved provider, pending provider, and admin accounts in isolated QA before release.
- [ ] Notification foundation migration is not applied to production or QA.


## 13. Homework reminder source contract (read-only QA schema inspection)
- [x] Exact QA homework columns confirmed: `id`, `session_id`, `teacher_id`, `student_id`, `homework_date`, `checklist` JSONB, student confirmation, teacher approval, feedback, timestamps.
- [x] Reconciliation plan added at `qa/LEARN-TEACH-QA-BACKEND-RECONCILIATION.md`.
- [ ] Homework due-time contract is unresolved: current table only has date field. Do not send timed reminders until a due time/default is product-approved.
- [ ] QA backend project alignment and test accounts required before implementation/testing.


## 14. Notification/UI regression guard additions
- [x] Added QA checks that notification page/feed/status and device-alert/live-ride notification code remain present.
- [x] Added explicit audit assertion that homework scheduler is still not present (release gap remains visible).
- [x] Added regression guard for requested floating-help UI removal.
- [x] Browser Regression CI run #247 succeeded for commit `824460103042017fc85bad26485dd168489330a9`; JS validation, npm install, Chromium setup and browser tests passed (browser-only).
- [ ] These are source/UI checks only; no push delivery, closed-app notification, homework schedule, marketing targeting, or hourly cadence verified.


## 15. Run #247 verified
- [x] Run #247 completed successfully; all workflow steps passed, including inline JavaScript/version validation and Playwright browser regression.
- [ ] Run #248 (tracker-only commit) is in progress as of this check.
- [ ] CI success does not certify backend integrations, live push, Android device behavior, or production readiness.


## 16. CI verification and Food RLS review safety note (2026-11-21)
- [x] Run #247 succeeded: floating-help removal guard and notification gap audit tests passed.
- [x] Run #248 succeeded at SHA `117f800206b975ff60225a95864e5666a933217d`.
- [x] Run #249 succeeded at SHA `1622c95060867cb50314c80f654f7830ac591d56`; browser regression job and all steps passed.
- [x] Food RLS review SQL comment corrected: row policies do not limit updated columns. Restaurant-owner UPDATE requires column-level grants, constrained RPC, or trigger validation before safe application.
- [ ] Food RLS correction remains review-only and is not applied. Backend integration, auth-role testing, payments, delivery partner status RPC and device tests remain blockers.
- [ ] New commit CI pending.


## 17. Run #250 verified and GST/payment-gateway deferral (2026-11-21)
- [x] Run #250 succeeded: browser-regression job completed; inline JavaScript/version validation, npm install, Chromium setup, Playwright browser regression, and report upload all passed.
- [x] Payment Gateway live integration is explicitly deferred until the user's GST registration is received; no merchant KYC, live credentials, webhook/settlement verification, or live payment transactions are claimed complete.
- [ ] Until GST is received, keep payment gateway live integration as a release blocker, while continuing non-payment QA and payment-flow UI/mock checks where feasible.
- [ ] After GST: merchant onboarding/KYC, gateway configuration, webhook verification, test transactions, refunds/settlement checks, and payment-related regression.
- [ ] Run #250 CI is browser/source verification only; no production deployment, merge, backend/device certification, or release approval occurred.


## 18. QA continuation — stale status correction and next non-payment verification queue (2026-11-21)
- [x] Corrected status by later evidence: Run #248 is complete/successful (see section 16); section 15's historical “in progress” note is stale and must not be used as current status.
- [ ] Auth/RLS isolated QA: customer, driver, partner, admin, and unauthenticated sessions; verify role routing and access denial on sensitive pages, records, and private KYC media.
- [ ] Driver/customer two-device staging ride: OTP, GPS, online/offline, accept/reject/counter-offer, start/complete, participant-only details, and QR behavior. Live-device evidence still required.
- [ ] Notifications: test in-app feed and source wiring now; actual push delivery in foreground/background/closed-app, targeting, hourly cadence, consent, quiet hours, retry/idempotency require backend/device verification.
- [ ] Food delivery: backend ordering/payment is not certified; demo UI/source tests are not evidence of production order writes. Validate isolated staging order creation, restaurant owner authorization, driver assignment/status, and participant visibility when staging backend is ready.
- [ ] Goods/parcel/home-services/Tasko/laundry: complete authenticated staging workflows, admin approval, ownership, status transition and private-media checks; payment steps remain deferred where gateway-dependent.
- [ ] Android: signed AAB and install/upgrade/device regression evidence required. Repository/browser CI does not certify Play Store package.
- [ ] No production deployment, main merge, database migration, or live payment configuration was performed during this continuation.


## 19. QA continuation — evidence limits after tracker updates (2026-11-21)
- [x] Repository QA source and tracker reviewed; package scripts confirm Playwright, unit, core, typecheck, and runtime-build commands exist.
- [ ] CI was not verified as triggered for tracker-only commits in this continuation: the GitHub connector returned no workflow runs for those commit SHAs. Do not report new CI pass from these documentation commits.
- [ ] Next actionable code/test phase requires a locally or CI-executed test run against the QA branch; browser CI can be triggered only through available repository workflow mechanisms, not from this connector.
- [ ] Review security role flows and test design before modifying application authorization. Real account/RLS/private-media tests require isolated QA credentials and backend setup.
- [ ] No production deployment, main merge, migration, merchant setup, or live-payment integration occurred.
