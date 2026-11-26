# FRIEND RIDE Phase 13C — continuation QA evidence (2026-11-26)

## Frozen handover
- Planning / Checklist: **88%** (unchanged)
- Overall Audit estimate: **12%** (unchanged)
- Progress graph: **frozen**
- Production/Main: **untouched**
- SQL migrations applied in this run: **0**

## Access verified
- GitHub QA branch: `arjuna-x/phase-13-feature-audit`
- Supabase QA project `pqsangtvietawkfgpgfu`: ACTIVE_HEALTHY
- Production project separately identified; no production calls or writes made.

## Substantive QA-branch changes
1. Fixed malformed duplicate `async async function` declarations in the Partner review and Driver review handlers in `index.html`. Exact one-occurrence replacements only.
2. Added `npm run test:unit` to the QA branch regression workflow after npm install.
3. Added `qa/phase13c-source-to-qa-module-inventory.sql`, a read-only source-to-QA RPC inventory covering security/Admin and all ordered Phase 13 modules.
4. Added `tests/phase13c-source-to-qa-module-inventory.test.cjs` for static read-only and coverage assertions.
5. Repaired two existing static-test defects found by executing the newly enabled Node test suite: payment/QR test file syntax duplication and ERS/RRS contact-limit assertion mismatch.

## Live read-only QA SQL findings
- Public tables: 39; RLS enabled: 39/39; FORCE RLS: 0.
- Policies: 77; client-write policies: 40 (policy count is not a bypass result; each policy still requires predicate review).
- Client TRUNCATE/MAINTAIN grants: 0.
- SECURITY DEFINER functions missing fixed search_path: 0.
- `admin_users`: 0 rows.
- Admin RPCs: 6 SECURITY DEFINER, anonymous execute 0, authenticated execute 6, missing admin-guard pattern 0.
- `admin_users` policy: authenticated self-select only.
- Runtime Admin testing is blocked because QA has no admin account.

## Source-to-QA backend inventory (actual SQL executed)
| Module | Required RPCs | Present | Missing |
|---|---:|---:|---:|
| Core Ride | 10 | 10 | 0 |
| Payment / QR | 11 | 0 | 11 |
| Catalogue / Cart / Order | 11 | 0 | 11 |
| Home Services | 7 | 5 | 2 |
| Referral | 7 | 4 | 3 |
| Flash Sale | 3 | 2 | 1 |
| ERS / RRS | 7 | 6 | 1 |

Missing endpoints confirmed by the executed inventory:
- Payment/QR: `fr_customer_create_ride_payment`, `fr_customer_market_payment_details`, `fr_customer_store_payment_options`, `fr_customer_submit_ride_transaction`, `fr_customer_tick_market_payment`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`, `fr_get_ride_payment_state`, `fr_partner_confirm_market_payment`, `fr_partner_save_payment_details`, `get_ride_payment_details_v1`.
- Catalogue/order: all 11 source-referenced catalogue and order RPCs absent.
- Home Services: `fr_tasko_admin_verify_payment`, `fr_tasko_submit_payment`.
- Referral: `fr_customer_special_day_set`, `fr_direct_store_coupon_review`, `fr_direct_store_coupon_submit`.
- Flash Sale: `fr_flash_sale_attach_order`.
- ERS/RRS: `fr_shared_ride_confirm_booking`.

## Role/security findings reverified
- `fr_road_ride_create`: driver approval/role guard not detected.
- `fr_road_ride_book`: customer-role guard not detected.
- `fr_shared_ride_create`: approved-driver guard not detected.
- `fr_shared_ride_book_seats`: customer-role guard not detected; seat-capacity and row-lock patterns present.
- `fr_shared_ride_confirm_booking`: RPC missing.
- Inspected app source has no direct `fr_road_ride_*` RPC calls; ERS/RRS frontend integration remains unverified/absent in inspected files.

## Tests and CI evidence
- Read-only module inventory SQL: **executed successfully** against QA.
- In-memory static checks for the inventory artifact: **6/6 passed**.
- Latest GitHub Actions run `45739482289` on commit `ddf32069f618f959a6a58276b75841547392ebd3`:
  - Inline JS/version integration check: **passed**.
  - `npm install`: **passed**.
  - `npm run test:unit`: **passed** (runner step success; exact test count not independently captured in this report).
  - Playwright browser installation: **passed**.
  - Local static server: **passed**.
  - Browser regression suite: **in progress at evidence capture**; no PASS claimed.
- Earlier CI attempts failed at inline syntax due duplicate async declarations and at unit tests due the two test defects listed above. Those were corrected on the QA branch; latest run's inline and unit steps passed.

## Artifacts
- `qa/phase13c-source-to-qa-module-inventory.sql`
- `tests/phase13c-source-to-qa-module-inventory.test.cjs`
- `tests/phase13-core-ride-payment-qr-draft-static.test.cjs` (repaired)
- `tests/phase13c-ers-rrs-focused-readonly-audit.test.cjs` (repaired)
- `index.html` (two syntax corrections only)
- `.github/workflows/friend-ride-regression.yml` (Node unit step added)

## Release status
**BLOCKED.** Backend gaps, role-guard gaps, no QA admin account, and browser regression completion remain pending. No SQL migration applied. Production/Main untouched. Frozen estimates and graph unchanged.
