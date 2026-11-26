# Phase 13 Read-only QA Catalog / Source Gap Audit — 2026-11-26

## Scope and safety
- Branch audited: `arjuna-x/phase-13-feature-audit`
- Source head audited: `d662dffcc4686312bdcd8b7bdde97dbaa366d106`
- Supabase project audited: QA only, `pqsangtvietawkfgpgfu` (FRIEND RIDE QA; active healthy; ap-south-1; Postgres 17.12)
- Method: read-only catalog SELECTs, source/migration inspection, CI metadata inspection.
- No Production project access, SQL writes, migration application, Main merge, or deployment performed.

## PASS — verified catalog inventory
- Public tables: 39; all 39 have RLS enabled.
- Public tables with at least one policy: 39/39.
- Policies in public schema: 77.
- QA migration history: 54 records.
- Private Storage bucket: `road-ride-driver-photos`; 3 owner-folder policies (INSERT, SELECT, UPDATE).
- SECURITY DEFINER public functions audited in catalog: the current inventory has empty search_path configured for the inspected functions (no unsafe search_path rows returned by the read-only filter).

## PASS — latest CI evidence on audited source head
- Workflow run #1267: `FRIEND RIDE Regression`, commit `d662dffcc4686312bdcd8b7bdde97dbaa366d106`, completed/success.
- Job `browser-regression`: success.
- Steps passed: inline JS/version integration validation; npm install; Node unit/static regression tests; Playwright Chromium install; local static app server; browser regression tests; report artifact upload.
- This is source/static/local-browser CI, NOT live QA Supabase role/permission or device/SMS/push testing.

## GAP / BLOCKED — Phase 13 migration files not reflected in QA catalog
Compared the branch migration directory (21 SQL files) against the QA migration history (54 recorded migrations) and then checked expected objects with `to_regclass`/`to_regprocedure`. The following Phase 13 migration files are not recorded/applied in QA, and their expected objects were absent at audit time:
1. `20261125200300_phase13_customer_special_days_consent_foundation.sql` — `fr_customer_special_days` table and `fr_customer_special_day_set` RPC absent.
2. `20261125200400_phase13_special_day_calendar_validation.sql` — calendar-date validation revision absent.
3. `20261125200500_phase13_store_reviews_moderation_foundation.sql` — `fr_store_reviews` and `fr_store_review_admin_moderate` absent.
4. `20261125200600_phase13_direct_store_coupon_claim_foundation.sql` — `fr_direct_store_coupon_claims`, submit/review RPCs absent.
5. `20261125200700_phase13_direct_store_coupon_rpc_role_hardening.sql` — hardening migration absent.
6. `20261125200800_phase13_flash_sale_order_link_rpc.sql` — `fr_store_flash_sale_attach_order` absent.
7. `20261125200900_phase13_customer_referral_order_eligibility.sql` — paid/completed-order recalculation RPC and trigger absent.
8. `20261125210000_phase13_flash_sale_checkout_discount.sql` — checkout discount/quote acceptance/payment confirmation integration absent.

## BLOCKED dependency gap
- QA catalog contains neither `fr_market_orders` nor `shop_orders`.
- The checkout-discount source migration references `fr_market_orders`; direct-store coupon source references `shop_orders`.
- Therefore those feature migrations cannot be safely applied as-is to this QA database until their order-table dependencies are resolved/verified. No attempt was made to apply them.

## GAP — least-privilege review
- Anonymous role has INSERT/UPDATE/DELETE grants on 10 public base tables and the `fr_road_rides_public` view (33 DML grant entries total).
- The inspected base tables have RLS enabled and no anonymous DML policies; the view is `security_invoker=true`, so base-table RLS still applies. These grants appear blocked by RLS at present, but are excess privileges and future-policy risk; recommend a dedicated revoke review, not automatic changes.
- The public view `fr_road_rides_public` is security-invoker and its base `fr_road_rides` SELECT policy is authenticated-only. Anonymous live-ride browse may therefore be unavailable; confirm desired public/guest behavior with a role-based runtime test before changing policy.
- Anonymous EXECUTE is granted to `fr_public_homepage_feedback` (SECURITY DEFINER, empty search_path; returns only published homepage feedback fields, limited to 20) and a trigger helper `fr_earnings_ledger_immutable` (not a normal RPC). Homepage function appears intentionally public based on static definition; runtime rate-limit/abuse behavior not tested.
- Storage: only the private road-ride driver photo bucket was found. Policies allow owner-folder INSERT/SELECT/UPDATE; no DELETE or explicit admin-review SELECT policy found. Admin document/photo-review access through Storage is unverified and may be blocked unless a trusted server path is used.

## PENDING runtime verification
- Authenticated customer/driver/partner/admin role matrix for table and RPC policies.
- Anonymous/public live-road ride listing access.
- Admin access to private driver-photo/document storage.
- OTP, push, live location, actual booking/checkout/payment workflows on devices.
- Phase 13 feature integration with the QA order backend.

## Frozen progress
- Phase 13 remains 80.5% (frozen baseline); remaining 19.5%. This audit does not justify recalculation.
- No unrelated progress estimates/graphs modified.
- Phase 14 baseline remains unassigned.
- No Production/Main changes, SQL writes, migrations, or deployment.

## Evidence links
- Audited source head: https://github.com/ginniprasanthsuji-ops/friend-ride-/commit/d662dffcc4686312bdcd8b7bdde97dbaa366d106
- CI run #1267: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45757914326
- Baseline doc (historical): https://github.com/ginniprasanthsuji-ops/friend-ride-/blob/arjuna-x/phase-13-feature-audit/docs/phase-13/phase-13-baseline.md

## Next audit task
Read-only review of the missing order backend dependencies and Phase 13 source-to-UI integration. Preserve all blockers and do not apply SQL until explicit user approval.


## Additional static UI integration cross-check (same audit window)
- Main `index.html` statically includes all seven Phase 13 scripts: flash-sale checkout, campaigns, customer referral, referral admin, special days, store reviews, and direct coupons.
- Expected UI element IDs for campaigns, customer referral, referral admin, special days, store reviews, and direct coupons were present in `index.html`. Static wiring: PASS.
- RPC/source mapping confirms UI expects these absent QA backend objects: `fr_customer_accept_market_quote`, `fr_store_flash_sale_attach_order`, `fr_customer_special_day_set`, `fr_store_review_admin_moderate`, `fr_direct_store_coupon_submit`, `fr_direct_store_coupon_review`. Backend execution: BLOCKED/FAIL for QA catalog presence.
- Campaign reserve/cancel RPCs and customer referral get-code/bind/admin review/reward-credit foundation are present in QA migration history; paid-order eligibility recalculation/trigger is absent. This leaves referral eligibility automation GAP.
- Historical baseline file `docs/phase-13/phase-13-baseline.md` still labels Production Supabase ref `fglyplxcczdjtfwobtzh`. It is a historical baseline, not the target of this audit; QA was the only project queried. Treat the stale project label as a documentation GAP to correct in a later approved doc-only edit.
- Report commit `a7d59841d025af037606a163224be85489bf5c3b` has no CI status records and no newer workflow run visible immediately after commit; its CI is PENDING/NOT YET TRIGGERED. The source head run #1267 remains PASS on `d662dffcc4`.
