# Phase 13 — Supplemental Source/QA Inventory & Regression Audit (2026-11-26)

**Scope:** Read-only inventory and static source analysis against the dedicated FRIEND RIDE QA Supabase project; QA-branch-only test/artifact updates. No production/main access or changes, no QA SQL migration applied, and no data-changing operation performed.

**Frozen progress:** Planning/Checklist **88%**, Overall Audit estimate **12%**, progress graph unchanged.

## Access verified
- Repository source accessible on `arjuna-x/phase-13-feature-audit`.
- Dedicated Supabase project `FRIEND RIDE QA` (`pqsangtvietawkfgpgfu`) is `ACTIVE_HEALTHY`.
- Public schema: **39 tables, RLS enabled on 39/39**; read-only inventory reports no RLS-disabled public table.
- Applied migration history max: `20261125182631`.
- CI status/workflow runs queried for the previously inspected audit commit returned empty; no CI PASS evidence.

## Security/admin — static evidence
- `fr_register_driver_partner` has auth/session, allowed-role, profile-lock, customer-role-only registration, validation, and pending-approval guards in its current QA function definition.
- `admin_review_driver` and `fr_admin_review_partner`: both definitions require `admin_users` membership and validate decisions (**2/2 static guard checks**).
- Profile privileged-field guard trigger found (**1**).
- QA `admin_users` currently contains **0 rows**; real admin-authenticated runtime tests cannot be executed with a configured QA admin.
- Shared Ride SECURITY DEFINER functions currently lack the approved-driver guard in create and customer-role guard in booking.
- Shared Ride tables currently have **28 client write/DELETE/TRUNCATE privilege entries** across the four tables and **four direct-write RLS policies**. This is a privilege/policy hardening gap; no destructive or write operation was attempted.
- Across the public schema, **54 client TRUNCATE grant entries across 37 tables** were observed. PostgREST/API reachability of TRUNCATE was not tested.

## Correction to the prior audit
The earlier note that the current frontend invokes Shared Ride RPCs was not supported by the current QA-branch source. Static source inspection of `index.html` finds **zero Shared Ride UI/RPC references**. The QA database has Shared Ride backend functions/tables, but the feature is not wired in the inspected frontend branch. This corrected report supersedes that wording.

## Source ↔ QA RPC/table reconciliation
- Current frontend contains **58 distinct RPC references**; **24** exist in QA and **34** are absent.
- Current frontend has **22 `.from()` references**; 7 are Storage bucket names, and all 15 actual public-table references exist in QA.
- Missing RPC groups:
  - Ride payment/QR (**6**): `get_ride_payment_details_v1`, `fr_get_ride_payment_state`, `fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`.
  - Catalogue/market order (**11**): `fr_customer_accept_market_quote`, `fr_customer_counter_market_order`, `fr_customer_list_market_orders`, `fr_customer_list_partner_catalogue`, `fr_customer_place_market_order`, `fr_customer_place_multi_market_order`, `fr_partner_list_catalogue`, `fr_partner_list_market_orders`, `fr_partner_quote_market_order`, `fr_partner_save_catalogue_item`, `fr_partner_update_market_order`.
  - Parcel workflow (**7**): `fr_customer_create_parcel_request`, `fr_customer_get_parcel_delivery_otp`, `fr_customer_list_parcel_requests`, `fr_driver_accept_parcel`, `fr_driver_confirm_parcel_payment`, `fr_driver_list_parcel_requests`, `fr_driver_verify_parcel_delivery_otp`.
  - Home Service payment (**2**): `fr_tasko_submit_payment`, `fr_tasko_admin_verify_payment`.
  - Platform/Partner payment/settings (**8**): `fr_admin_save_platform_business_details`, `fr_customer_market_payment_details`, `fr_customer_store_payment_options`, `fr_customer_tick_market_payment`, `fr_partner_confirm_market_payment`, `fr_partner_save_location`, `fr_partner_save_payment_details`, `fr_get_platform_business_details`.
- Catalogue/order public tables: **none** in QA.
- Home Service tables: 5; provider/service request foundations and transitions exist, but Tasko payment submission/admin verification are absent.
- Referral tables: 5 referral-named tables plus reward ledger; 7 referral RPC foundations exist. Order-based two-paid-completed eligibility cannot be verified without the missing order schema/RPCs.
- Flash Sale: 2 campaign/reservation tables and 2 reserve/cancel RPC foundations exist. Current frontend has no direct Flash Sale RPC calls; checkout/order integration cannot be verified.
- ERS/RRS/road-ride backend: 4 road-ride tables and 8 `fr_road_ride_*` RPC foundations exist in QA. Current frontend branch has no direct road-ride RPC references; a unified station/live integration is not verified.

## Regression source audit
- Existing Playwright spec had **62 page IDs** while the source contained **63 .page elements** (new `frDriverSubscription` route omitted from the test list). This would fail the spec's page-count assertion.
- QA-branch fix: add `frDriverSubscription` to the page ID list and add a Playwright case checking the ₹299 card, subscription page role guard, price, and Razorpay link.
- Static checks run after the edit: **all 63 test page IDs exist**, the spec page count matches 63 source pages, subscription assertions are present, and the Shared Ride source wiring absence is confirmed.
- Playwright/browser/runtime tests were **not executed**; the static check does not substitute for them.

## QA-only artifacts/changes
- `qa/phase13-readonly-security-audit-assertions.sql`: read-only catalog assertion script. Executed against FRIEND RIDE QA; output recorded above. It contains SELECT/catalog queries only.
- `qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql`: revised review draft adds approved-driver/customer role checks, validation, removes direct-write policies, revokes client table writes, and revokes public-schema client TRUNCATE grants. **Not applied**.
- `qa/dark-gold-route-regression.spec.js`: adds subscription route and role/payment-link regression coverage. **Not executed**.

## Test/evidence status
- Executed: read-only QA catalog/source alignment SQL; static JS source assertions on the fetched QA branch.
- Not executed: Playwright, browser runtime, authenticated role/RLS tests, payment settlement/webhooks, OTP/SMS, push, GPS/two-device, catalogue/cart/order, Home Service payment, referral eligibility, Flash Sale checkout, ERS/RRS integrated station.
- No PASS claims for those unexecuted workflows.
- Release remains **BLOCKED**.
- Production/Main untouched. Frozen estimates/graph unchanged.
