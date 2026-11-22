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


## Continued QA session — 2026-11-22
- Confirmed latest CI runs on progress commit `d74ae88`: FRIEND RIDE workflow regression, TASKO/Laundry regression, FRIEND RIDE Quality Gate, and FRIEND RIDE Regression all **PASS**.
- Added `qa/PROJECT-ARJUNA-MISSING-CORE-RPC-CONTRACTS.md` with exact frontend call contracts and security/acceptance requirements for the 20 missing non-payment core RPCs.
- Latest new documentation commit `430fa87` triggers its own CI; verify those runs before claiming latest HEAD green.
- Progress remains **80%** pending implementation/testing of missing core RPC/schema gaps and real-device release gates.


## Continued QA session — 2026-11-22 (schema design checkpoint)
- Verified commit `3685359a`: FRIEND RIDE Regression, FRIEND RIDE Quality Gate (both runs), Workflow Regression, and TASKO/Laundry Regression all **PASS**.
- Added `qa/PROJECT-ARJUNA-MARKET-PARCEL-SCHEMA-DESIGN.md`: proposed normalized marketplace/parcel tables, RLS role matrix, transaction boundaries, security constraints, and acceptance test matrix. **Design only; not applied.**
- Added `tests/project-arjuna-market-parcel-schema-design.test.cjs` to guard required safety/design coverage; latest commit `55ce79bf`.
- CI for newer commits `b934154c` and `55ce79bf` is running/queued; results not yet verified.
- Progress stays **80%**. No production SQL, no live deploy, no main merge.


## Continued Project Arjuna QA — latest verified CI and QA advisor snapshot (2026-11-22)
- Latest checked commit `6731241b351480f19a1a58246e5cf63ed744b464`: FRIEND RIDE Quality Gate, FRIEND RIDE Regression, workflow regression, and TASKO/Laundry integration regression all **PASS**.
- Quality Gate: typecheck, core typecheck, runtime build, 24 Node unit tests (0 failures), 5 Vitest core tests, and browser E2E **53/53 passed**.
- Cab-location E2E passed: autocomplete address/coordinates, stale-coordinate clearing after edit, GPS reverse-geocode pickup, map-pin drop, handler/map availability, ride payload, and fallback when map unavailable.
- Read-only Supabase QA advisor snapshot (project `pqsangtvietawkfgpgfu`, no writes): advisor flags 1 anon-executable SECURITY DEFINER RPC (`fr_public_homepage_feedback`) and 25 authenticated-executable SECURITY DEFINER RPCs. This is a review queue, not automatically a vulnerability; role/ownership checks must be verified for each. Do not change public feedback permissions without deciding whether anonymous feedback is intended.
- Performance advisor reports unindexed foreign keys, RLS auth-function per-row evaluation warnings, 12 unused-index notices, and 5 multiple-permissive-policy warnings. Unused-index notices are not removal recommendations without workload evidence.
- Marketplace/parcel remains blocked: QA catalog inventory does not contain its tables or the 20 non-payment RPC contracts. Design documents and test guard exist, but no marketplace/parcel schema or functions were applied.
- Latest overall CI remains green; real-phone OTP, multi-device ride, live/background push, live payment (deferred), food backend flow, KYC storage/runtime, Android signed build/store tests, and production security review are not verified.
- **Release readiness remains NOT READY.** Main untouched; no merge/deploy. This session made read-only QA catalog/advisor checks only and no database writes.


## Continued Project Arjuna — latest verified CI and blocker alternatives (2026-11-22)
- Latest branch commit at check: `01f209140a34a0387f43611de334755d4f350842`.
- All five latest workflow runs checked and completed **PASS**: two Quality Gate runs (typecheck/unit + browser E2E), FRIEND RIDE Regression, TASKO/Laundry integration regression, and workflow source regression.
- PR #37 remains open and unmerged. No deployment performed.
- Regression/automated-QA work is estimated at **85%** (provisional); overall release readiness remains **NOT READY** and is lower because missing backend contracts and real-device/integration gates remain. Percentages are progress estimates, not release certification.
- To avoid blocking on missing providers/backend integrations, QA plan includes these fallback paths (must be implemented/tested before claiming usable): pickup/drop autocomplete or GPS failure -> manual address entry plus map-pin selection; maps unavailable -> address text and coordinate validation, never fabricated coordinates; push unavailable -> in-app notification center plus SMS/email fallback where configured; OTP delivery failure -> resend with cooldown and support escalation, never OTP bypass; marketplace backend unavailable -> transparent manual partner quote/request flow (no fake order confirmation); parcel backend unavailable -> support-assisted request and clearly labeled manual tracking; payment integration deferred -> cash/UPI-on-delivery or manual payment status only where business rules allow, no fake paid state; food backend unavailable -> service-request/manual partner workflow only if existing contract supports it, otherwise display unavailable and do not create a false order.
- Alternative paths are fallback design decisions, not yet claimed as implemented. Each requires role/ownership validation, clear user messaging, and regression tests.
- Next priority: review and implement missing non-payment marketplace/parcel backend contracts in QA only after schema/RLS/atomicity design review; meanwhile continue static/runtime audits and tests. No production SQL, no merge, no live deployment.


## Continued Project Arjuna QA — Security boundary review (2026-11-22)
- Latest checked branch commit `d42b19047da1a82b2116e751b434e05fbd6d8533`: FRIEND RIDE workflow regression, TASKO/Laundry regression, FRIEND RIDE Regression, and both Quality Gate runs all **PASS**.
- Static review of QA private workflow migration `202611220005_arjuna_qa_private_workflows.sql` identified follow-up validation items: SOS latitude/longitude range constraints are not present at table level; KYC document owner/admin update boundary requires authenticated runtime tests to prove drivers cannot change review status; push-subscription ownership and SOS read access require cross-user tests.
- Food-order read-policy migration statically links delivery assignment by `d.order_id = fr_food_orders.id`, restricts to customer, restaurant owner, assigned delivery partner, or admin, and drops direct client insert policy. Runtime cross-role tests remain required.
- No production SQL, merge, or live deployment. No UI theme rollout was reintroduced.
- Progress estimate remains **80% overall / 85% automated QA** (provisional; no increase based on these audits alone). **NOT RELEASE READY** until backend contracts and physical-device/integration release gates are completed.


## Continued Project Arjuna — SOS coordinate hardening (2026-11-22)
- CI on commit `bdddec1e5127ac60d517394d4e1feee55df75940` verified: FRIEND RIDE workflow regression, TASKO/Laundry regression, FRIEND RIDE Regression, and both Quality Gate runs all **PASS**.
- Added QA-only migration `202611220006_arjuna_qa_sos_coordinate_constraints.sql` with database checks for latitude [-90,90], longitude [-180,180], and all-or-none coordinate pair. This migration is committed to QA branch only and **not applied to any database**.
- Added static regression test `project-arjuna-sos-coordinate-constraints.test.cjs` to verify the migration guardrails.
- New commits: migration `5ff7e56d` and test `e8c2c112`; verify CI for the latest commit before marking the new test green.
- No merge, deployment, production DB change, or Dark+Gold UI work.
