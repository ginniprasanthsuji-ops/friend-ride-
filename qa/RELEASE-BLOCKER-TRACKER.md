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
