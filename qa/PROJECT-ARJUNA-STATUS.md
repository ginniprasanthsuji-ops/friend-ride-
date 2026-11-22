# Project Arjuna — QA Status (2026-11-22)

## Scope and safety
- QA branch only; the cancelled Dark+Gold UI override has been removed from `index.html`.
- Payment Provider/Cashfree integration explicitly deferred by user and excluded from release gate.
- Main branch and live deployment remain untouched; PR #37 is not merged.
- Latest verified QA branch head (status-doc commit): `a30d57653d80f6739dfc8901016ac5b91e26a6c9`; engineering fix commit remains `d155d697fcdb68aa0a9a1700e56222548d0f4566`.

## CI evidence (latest engineering commit)
- Status-doc commit `a30d57653d80f6739dfc8901016ac5b91e26a6c9`: Regression run `45019723898`: **PASS** — browser regression and inline JavaScript/Version 10.1 validation.
- Status-doc commit `a30d57653d80f6739dfc8901016ac5b91e26a6c9`: Quality Gate run `45019723887`: **PASS** — browser E2E, typecheck, core typecheck, runtime build, unit tests and core tests.
- Both latest runs are green on `a30d576`; prior engineering runs on `d155d69` remain green.
- FRIEND RIDE Quality Gate run `45019454329`: **PASS** — typecheck/unit and browser E2E.
- FRIEND RIDE Quality Gate run `45019449598`: **PASS** — typecheck/unit and browser E2E.
- FRIEND RIDE Regression run `45019449603`: **PASS** — browser regression.
- FRIEND RIDE workflow regression run `45019454244`: **PASS** — source regression.
- TASKO/Laundry regression run `45019454260`: **PASS** — Playwright regression.
- All five latest runs are green on commit `d155d697fcdb68aa0a9a1700e56222548d0f4566`.

## Implemented QA work
- Pickup/drop autocomplete, selected coordinate validation, GPS/map pin, ride payload and duplicate-submit regression guards.
- Ride booking DB insert policy now validates pickup/drop coordinate ranges, non-empty addresses, positive fare offer, own-customer insert, unassigned/requested state (migration 019).
- Food demo restaurants removed; honest empty-state.
- Removed cancelled Dark+Gold CSS override from `index.html`; no parallel theme rollout.
- Runtime diagnostics allow expected OpenStreetMap tile traffic.
- Registration privacy-policy link, privacy contact correction and manual account-deletion request page.
- QA-only migrations for schema parity: core profiles, driver GPS, ride live tracking, app notifications, SOS, push subscriptions, emergency contacts, driver KYC metadata, bank enquiries, service bookings, service-provider applications, support/feedback.
- QA profile guard blocks non-admin self-promotion of role/approval fields; registration authorization hardening uses a private transaction authorization table rather than a spoofable custom GUC.
- Core ride lifecycle QA RPCs: get driver requests, accept ride, counter-offer, accept/decline counter-offer, nearby drivers, start/complete ride, secure customer/driver detail retrieval.
- Admin driver/partner review QA RPCs: driver application/document listing, driver approval/revocation, KYC document review, partner application listing/review.
- TASKO and Laundry provider transition RPCs (accept/start/complete) added.
- Static regression tests cover schema/RLS, admin authorization, role guards, ride/service transitions, SOS, registration, and insert boundaries.

## QA database snapshot (previous read-only verification after QA-only migrations)
QA Supabase project `pqsangtvietawkfgpgfu`:
- Frontend direct table inventory: **15/15 present**.
- Public QA tables: **18 total; 18/18 RLS enabled**, policy metadata verified.
- Frontend RPC inventory: **57 names**; **18 frontend RPCs** implemented in QA so far; approximately **39 frontend RPCs remain missing** (payment-provider-dependent items excluded only after classification).
- QA public function metadata includes 20 functions (18 frontend RPCs plus notification-preference trigger and profile-security guard).
- All QA SECURITY DEFINER functions checked: anon EXECUTE is false; intended authenticated RPCs have authenticated EXECUTE grants. Trigger/internal functions are not directly executable by anon or authenticated.
- QA migrations only; production schema/data/grants/functions/policies/settings were not changed.
- Authenticated real-user integration and role-boundary tests still need test accounts/device execution; static/mock tests do not prove live auth behavior.

## Production security audit (read-only findings; not remediated live)
- Previously found 23 RLS-enabled tables without policies, 6 SECURITY DEFINER functions executable by anon, 88 SECURITY DEFINER functions executable by authenticated, leaked-password protection disabled, plus performance advisor warnings.
- Several anon-executable SECURITY DEFINER RPCs appear intentionally public (approved-store listings, approved catalogue, published homepage feedback). `fr_get_platform_business_details()` exposes legal name, toll-free, GSTIN and timestamp; confirm intended public fields and least-privilege ACL.
- No production changes made.

## Remaining release gates (payment excluded)
1. Implement/review remaining frontend RPCs and authenticated integration tests; classify payment-specific RPCs outside this gate.
2. Live SMS OTP send/verify on real phones.
3. Two-device ride lifecycle, GPS and background tracking.
4. Live/background push delivery.
5. Food trusted server order flow and approved partner/menu data (payment provider excluded).
6. Private KYC storage buckets/upload and admin/provider approval runtime tests.
7. CRM/user/referral/reward approval workflows.
8. Production SECURITY DEFINER/RLS review and leaked-password protection.
9. Account-deletion operational process and legal/privacy review.
10. Signed Android AAB, Play Console internal testing and store-policy checks.

## Progress
- Prior estimate of **86%** was provisional. A read-only frontend RPC audit uncovered additional core marketplace/order/parcel integration gaps; revised conservative engineering estimate is **80%** (not a mathematically weighted score and not release certification).
- Current read-only QA catalog snapshot: **23/57 frontend RPCs present; 34/57 absent**. Of the absent, **20 are non-payment core RPCs** and **14 are payment-specific** (payment integration remains deferred; includes two Tasko payment RPCs not currently present in the QA catalog).
- QA schema parity audit: **15/15 required base tables present**; QA public schema has 21 tables, but marketplace/catalogue/order/parcel data tables are not currently in the QA inventory. The absent core RPCs cannot safely be stubbed; schema/contracts/RLS must be reviewed first.
- The latest earlier CI on `4912a42` is green; new documentation/audit commits have newer CI runs in progress or queued, so do not claim latest HEAD green until those finish.
- **NOT RELEASE READY.** Main untouched; no live deployment.


## 2026-11-22 RPC catalog audit update
- Static frontend inventory: 57 unique RPC names.
- Branch migrations define 25 matching names.
- QA database catalog read-only check: 23 frontend RPCs present, 34 absent. This differs from the static migration inventory because two Tasko payment RPCs have migration definitions but are not installed in the QA catalog.
- Detailed audit: `qa/PROJECT-ARJUNA-RPC-MIGRATION-AUDIT.md`.
- No production or live Supabase writes performed during this audit.
