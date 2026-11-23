# Phase 7 — Test Coverage Gap Audit & Test-to-Feature Matrix

**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Scope:** Read-only source inventory; no CI dispatched, no live-provider calls, no database writes, no deployment.  
**Evidence limitation:** Tests listed here are inspected from source. They have NOT been executed in this audit.

## Coverage observations

The inspected `qa/friend-ride.spec.cjs` contains 40+ Playwright test cases. Coverage is strongest in UI wiring, role routing, element visibility, handler presence, source-marker checks, and deterministic/mock QA-page checks. Other files include `tests/learn-teach-marketplace.spec.js`, `tests/ride-contact.test.cjs`, and `tests/tasko-laundry-main-regression.spec.js`, plus QA Tasko/Laundry and route-regression specs.

## Test-to-feature matrix

| Feature area | Source-level/UI coverage seen | Missing proof / next test |
|---|---|---|
| App boot & role launcher | Page boot, four role entry cards, role routing | Fresh browser/mobile smoke; real role accounts |
| Auth/OTP & session | Role selection and cooldown/source checks | Real SMS receive/verify, expired/replayed OTP, rate limits, session restore/logout, cross-role denial |
| Registration & avatars | Role-specific fields and avatar controls | Real profile creation, role-change edge cases, duplicate account and persistence |
| Driver KYC | Upload handler and admin review UI/RPC wiring | Private bucket access tests, authenticated upload, MIME/size rejection, cross-user denial, Admin review lifecycle |
| Ride booking | Ride/contact UI and assigned driver/customer details wiring | Real ride state transitions, concurrency, fare/route persistence, accept/reject/counter, start/complete, duplicate actions |
| GPS/live tracking | Location handlers, nearby-driver RPC/map wiring | Two-device movement, permissions denied, offline stop, stale location, unauthorized ride/location access |
| SOS | Source/policy audit only | Participant-only insertion, nonparticipant rejection, alert delivery, rate limiting, lifecycle rules |
| Partner/store | Catalogue editing, GPS, store map, QR wiring | Partner approval, SKU uniqueness, stock/price persistence, customer visibility, order/quote workflow, cross-role denial |
| Shop QR payment | UI wiring/source assertions | No real settlement proof; approved controlled test only if payment provider allowed |
| TASKO/GIGGER | Booking form, price rules, KYC, admin assignment wiring | Booking persistence, assignment/approval boundaries, pricing edge cases, provider/customer/admin workflow |
| Laundry | Service options, partner registration and admin controls | Booking persistence, price calculations, pickup lifecycle, partner approval, cross-role authorization |
| Bank enquiry | Customer submission/admin review wiring | Real staging write/read, admin-only review, unauthorized rejection |
| Complaints/feedback | Form, admin panel, publish UI | Persistence, moderation authorization, published content validation, abuse/rate limit |
| Notifications | Handlers/UI and service-worker source coverage | Token registration ownership, dispatch-secret behavior, provider restricted; in-app fallback, delivery, retry/duplicate/quiet hours |
| Storage/profile photos | Private bucket handler wiring | Bucket/policy drift resolution, cross-user/private access, signed URL expiry and upload limits |
| Friend Mart / marketplace | Map, GPS and catalogue UI wiring | Real cart/order persistence, multi-shop edge cases, stock race and partner order visibility |
| Learn/Teach | Marketplace smoke tests/categories | Student/teacher registration, class/lesson persistence, quiz/AI provider restricted, safe external links and consent |
| Admin permissions | UI and RPC wiring assertions | Real admin/non-admin accounts, direct RPC/table denial, privilege escalation tests |
| PWA/service worker | Static source inspection | Install/update/offline, closed-app push (provider restricted), cache invalidation and stale assets |
| Release | Historical release gate only | Current QA branch CI, complete regression, Android real-device, signed AAB, policy/privacy/data safety/account deletion |

## Priority test additions

### P0 — Security and release blockers
1. Authenticated/non-authenticated, participant/nonparticipant and Admin/non-Admin authorization matrix for sensitive RPCs and writes.
2. SOS ride-participation authorization; live-location update destination-ride authorization.
3. Storage private bucket owner/admin access matrix and missing bucket/policy reconciliation.
4. OTP actual deployment inventory reconciliation, without bypass/fake OTP.
5. Prevent cross-user push token ownership transfer unless explicit verified token-reassignment semantics.
6. Check grants including TRUNCATE; RLS alone is not a protection for TRUNCATE.

### P1 — Functional workflow E2E
1. Customer creates ride → driver accepts → start → complete → both accounts see final state.
2. GPS permission granted/denied and two-device live location; offline stops updates.
3. Partner registration/approval → catalogue item add/edit → customer sees item → order/quote workflow.
4. TASKO booking → admin approval/assignment → status/payment verification state.
5. Laundry booking → provider/admin lifecycle.
6. Bank enquiry and complaint/feedback customer-to-admin lifecycle.
7. Profile/KYC upload validation, private retrieval, Admin review.

### P2 — PWA/release
1. Install, offline, update and cache regression.
2. Real-device accessibility, small-screen, Telugu notifications and permission prompts.
3. Play Store privacy/data-safety/account-deletion, signed AAB, store listing and device matrix.

## Execution status
- Source inspection: **completed for this checkpoint**.
- Test execution: **NOT RUN** in this audit.
- CI workflow runs on QA branch: prior inspection found **0 runs**; no new run initiated.
- Live OTP, payments, GPS, push, KYC: **NOT TESTED**.
- Production/main merge/deployment: **none**.

## Next checkpoint
Prepare the test execution safety checklist and identify which tests are deterministic/local-only versus staging-account/device tests. Then review whether QA workflow triggers can be safely amended; do not dispatch or enable external provider tests without approval.
