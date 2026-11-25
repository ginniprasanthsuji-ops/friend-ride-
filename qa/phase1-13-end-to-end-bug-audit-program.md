# FRIEND RIDE — Phase 1–13 End-to-End Bug Audit & Fix Program

Branch: `arjuna-x/phase-13-feature-audit`
Scope: QA branch and QA Supabase only. Main/production must remain untouched.
Goal: reduce defects across Phases 1–13 and prove fixes with reproducible test evidence. "Bug-free" is not an absolute guarantee; release readiness requires all blocking tests to pass and no known P0/P1 defects.

## Rules
- Audit existing code and backend before changing it; preserve existing features.
- Fix only in QA branch/QA project. No production deploy or production SQL.
- No Python or new paid/external services. Use existing SQL/GitHub/Firebase/Supabase.
- Every defect gets ID, severity, repro, expected/actual, fix commit, regression test, evidence.
- Never mark PASS without executed test evidence.
- Do not use fake data as live; test fixtures must be clearly labelled.
- User approval required before any live deployment.

## Phase sweep (1–13)
For each phase, map implemented screens, JS functions, tables/RPCs, RLS, triggers, storage, and workflows; identify tests and regressions.

- Phase 1 — App shell, navigation, responsive layout, loading/error states, accessibility basics, links.
- Phase 2 — Role selection/authentication, session persistence, logout, role isolation, deep links.
- Phase 3 — Customer registration/profile, validation, photo handling, profile update/delete/consent.
- Phase 4 — Driver registration, approval, identity/vehicle fields, availability, location, driver dashboard.
- Phase 5 — Partner/shop registration, admin approval, catalogue, stock, images, partner dashboard.
- Phase 6 — Customer ride booking, driver offers/acceptance, fare negotiation, ride lifecycle, cancellation.
- Phase 7 — Shopping/food/parcel orders, cart, stock, checkout, payment state, delivery handoff, QR/OTP.
- Phase 8 — Home services/technician/provider registration, approval, service request and assignment.
- Phase 9 — Tracking, notifications, SOS/emergency contacts, safety and privacy.
- Phase 10 — Admin dashboard, approvals, user management, CRM, reports, role permissions.
- Phase 11 — Rewards/referrals/offers/subscription rules, ledger integrity, idempotency, abuse protection.
- Phase 12 — Cross-feature integrations, backend consistency, performance, storage retention/privacy, regression.
- Phase 13 — Referral ledger/flash sale, ERS/RRS combined station, QA/release gates, browser/device evidence.

## Mandatory cross-phase test gates
1. Role routing: Customer/Driver/Partner/Admin always open correct dashboard; unauthorized page/action blocked; back/refresh does not cross roles.
2. Registration: field requirements match role; validation; approval status; duplicate prevention; profile photos stored private and shown only to authorized users.
3. Ride: request → eligible driver → accept → pickup → ongoing → complete/cancel; no double assignment; status transitions validated server-side.
4. Shop/order: partner catalogue save → customer view → cart → order; price/stock revalidated server-side; no stale stock oversell; order state and payment state consistent.
5. Parcel/QR/OTP: secure OTP generation/expiry/attempt limit; QR shown only at correct lifecycle step; payment confirmation truthfully tied to backend.
6. Home service: request → eligible approved provider → assignment → completion/cancellation; role isolation.
7. Notifications: no secret/PII leakage; correct recipient; simulated browser tests distinguished from real FCM/device verification.
8. Tracking: authorized access only; location freshness; stop tracking on lifecycle/consent conditions; physical-device tests separately recorded.
9. SOS: emergency action and contact verification, permissions, failure fallback; do not claim tested from UI only.
10. Admin: least privilege; approve/reject/audit; no customer/driver/partner impersonation or unrestricted writes.
11. SQL/RLS: direct table access tests for anon/authenticated/admin; RPC auth and role checks; transaction/idempotency; grants; data leakage.
12. Storage: privacy, upload size/type, retention/deletion; profile image policy; avoid storing unnecessary gallery images or duplicates.
13. Mobile/responsive: Android small/large, browser, keyboard, touch, network loss, loading/error/retry, offline/slow connection.
14. Security: secrets scan, XSS/injection, unsafe HTML, open redirects, exposed API keys, sensitive logs.
15. Regression: each fix adds or updates test; rerun relevant suite and broad smoke suite.

## Known high-priority defect candidates (must reproduce)
- Role buttons may route Driver/Partner/Admin into Customer Dashboard.
- OTP delivery/API issue.
- Registration form field mismatch (customer vs driver/partner).
- Ride completion QR not appearing.
- RRS passenger SELECT policy likely incorrect correlation (`b.ride_id=b.id`); candidate fix not applied.
- ERS channel and payment metadata/dedicated listing/atomic selection not fully integrated.
- Combined ERS/RRS station prototype currently isolated; real adapters not wired.
- Referral UI integration and reward eligibility/ledger QA pending.
- Flash sale integration and checkout verification pending.
- GitHub Actions QA evidence and real device tests not yet complete.

## Defect priority
- P0: data breach, unauthorized role/admin, money/ledger corruption, safety critical, production outage.
- P1: core workflow blocked, booking/payment integrity, registration/approval failure, incorrect ride/order lifecycle.
- P2: major feature broken or repeated UX issue with workaround.
- P3: minor UI/content defect.

## Execution order
1. Inventory current repository and phase artifacts; map feature → code → DB/RPC/RLS → tests.
2. Run static checks, existing test suite, secret scan and browser smoke tests.
3. Reproduce and fix P0/P1 first: role routing, authorization, registration, ride/order integrity, OTP/QR.
4. Audit/fix SQL/RLS/storage/permissions with QA-only test identities and rollback scripts.
5. Regression test cross-feature workflows and mobile layout.
6. Phase 13 integration and gates.
7. Evidence-based release readiness report; production deployment remains separate and requires explicit user approval.

## Current checkpoint
- Start status: program initiated; phase-wide execution tests not yet run in this document.
- Overall audit percentage is not yet calculated. Phase 13 prior planning estimate was 75%; that estimate is not the 1–13 audit completion.
- First work item: repository inventory and baseline test results, followed by Phase 1–3 mapping.
