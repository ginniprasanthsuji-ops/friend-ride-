# Phase 12 — Release Gate Follow-up Worklist

Based on the existing Play Store release gate audit (dated 2026-11-09; audited main commit 11269614), release remains BLOCKED. This is a follow-up inventory only; it does not certify current live status.

## Automated evidence previously recorded
- Playwright browser regression: 29/29 PASS (2026-11-09)
- Browser E2E: 29/29 PASS (same dated evidence)
- Unit tests: 5/5 PASS
- Typecheck and configured runtime build: PASS
- Supabase inventory at audit time: 71 public tables, all RLS enabled; 58 migrations; 7 active Edge Functions

These historical checks do not establish current branch or live-device behavior.

## High-priority verification worklist
1. **Authentication:** real OTP delivery, verification, session restore, logout, role separation.
2. **Ride flow:** staging ride write, driver accept/reject, start/complete, duplicate action protection, fare/coordinates.
3. **Tracking/SOS:** two-device GPS movement, permission denial fallback, controlled SOS notification.
4. **Driver onboarding:** real authenticated private-document upload, Admin review/approval and approved-only eligibility.
5. **Partner onboarding/catalogue:** registration and photo, approval, catalogue save/edit/reload, customer visibility, stock/price consistency.
6. **Marketplace orders:** single-store and multi-shop checkout writes, shop-wise order linking, partner order dashboard, delivery status.
7. **Payments/QR:** verified bank/gateway status, replay/expiry protection, idempotency, refund/receipt reconciliation. Never mark success from frontend alone.
8. **Notifications:** in-app history/read state plus push/background delivery on real devices.
9. **Security:** RLS and RPC authorization with role-matrix tests; private file access; no unauthorized cross-account reads/writes.
10. **Android release:** signed AAB, install/update test, Play policy/privacy/data safety/account-deletion/store listing review.

## Evidence rule
For each test, record test date, environment, role/account type (no sensitive identifiers), steps, expected result, actual result, PASS/FAIL/BLOCKED, and screenshot/log/commit evidence. Do not mark PASS from source markers or simulations.

## Immediate next action
Start with staging authentication and role separation, then proceed through customer/driver ride lifecycle. Keep production untouched until QA is evidence-backed.
