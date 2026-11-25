# FRIEND RIDE Phase 13 — QA continuation evidence (2026-11-26)

## Frozen handover
- Planning/Checklist: **88%** (unchanged)
- Overall Audit estimate: **12%** (unchanged)
- Progress graph: **frozen**
- Production/Main: **untouched**

## Access confirmed
- GitHub QA branch `arjuna-x/phase-13-feature-audit`: source fetch/edit access available.
- Dedicated Supabase QA project `pqsangtvietawkfgpgfu` (`FRIEND RIDE QA`): `ACTIVE_HEALTHY`.
- Local checkout and Playwright package are not present in the execution container.
- No dedicated QA web-app URL was supplied/discovered. The existing Playwright config previously defaulted to the public GitHub Pages URL, so running it would have risked hitting production.

## QA-only changes made
1. `playwright.config.cjs` now requires `FRIEND_RIDE_BASE_URL`; it refuses the known production hosts (`friendride.in`, `www.friendride.in`, and `*.github.io`) and requires HTTPS except localhost. This prevents the default test command from silently targeting the production deployment.
2. `qa/dark-gold-route-regression.spec.js` subscription test now checks anonymous, customer, partner, and admin are denied; driver is allowed; ₹299/month is visible; Razorpay URL is exact; and link has `target=_blank` plus `rel=noopener`.

Commits:
- Config fail-closed QA target: `8719753fb74f7b2f2b06e83d6c31ee78e18e5c2`
- Expanded role regression: `da1b0dee0ead98e15ce75507963aaa38ababca45`

## Executed read-only QA SQL findings
- Public tables: **39**; RLS enabled: **39/39**; FORCE RLS: **0**.
- SECURITY DEFINER functions missing fixed `search_path`: **0**.
- `admin_users`: **0 rows**, so authenticated Admin runtime testing is blocked.
- Admin driver/partner review guard static checks: **2**.
- Registration RPC auth/role guard: **present**.
- Profile privileged-field guard trigger: **1**.
- Shared Ride: create approved-driver guard **missing**; booking customer-role guard **missing**; direct-write policies **4**; client write/delete/truncate privilege entries **28**.
- Public client TRUNCATE grants: **54** across the audited public schema.

## Module inventory (QA DB ↔ source)
- Core Ride payment/QR: **6 expected RPCs missing** (`get_ride_payment_details_v1`, `fr_get_ride_payment_state`, `fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`). Payment verification is not available to runtime-test.
- Catalogue/Cart/Order: **11 expected RPCs missing**; required market-order/catalogue backend is not present in this QA database.
- Home Services: service foundations exist; Tasko payment submit/admin verification **2 RPCs missing**.
- Referral: **7 referral RPCs present**; order-linked eligibility cannot be end-to-end verified because market-order backend is missing.
- Flash Sale: **2 RPC foundations present**; source checkout/discount linkage not runtime-verified.
- ERS/RRS: **8 road-ride RPCs present**; source/UI integration not runtime-verified.

## Tests actually executed
- `node --check` on updated Playwright config: **syntax check passed**.
- Config fail-closed guard isolated with mocked Playwright import: **6 assertions executed**, confirming missing env fails, production hosts fail, insecure remote HTTP fails, HTTPS QA and localhost are accepted.
- `node --check` on the updated subscription regression snippet: **syntax check passed**.
- Read-only Supabase SQL inventory executed (catalog/profile/function/policy/privilege checks).

## Not executed / blocked
- Full Playwright suite: **not executed** (no local `@playwright/test` dependency and no dedicated QA app URL; config now intentionally fails closed).
- CI/workflow runs and commit statuses: **none returned** for inspected QA commits.
- Admin runtime tests: blocked by empty `admin_users`.
- Payment/QR, catalogue/orders, home services, referrals, Flash Sale, ERS/RRS end-to-end tests: not executed.
- No SQL migration or write operation applied to QA or production.

**Release: BLOCKED.** Only QA branch artifacts were changed. Frozen progress values remain unchanged.
