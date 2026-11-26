# Phase 13 QA Follow-up — Fresh Catalog, UI Flow & CI Evidence (2026-11-26)

## Safety / scope
- QA branch only: `arjuna-x/phase-13-feature-audit`.
- QA Supabase only: `pqsangtvietawkfgpgfu`.
- Read-only catalog SELECT and source inspection only. No SQL writes, migrations, Production/Main access, or deployment.
- Phase 13 frozen baseline remains 80.5%; remaining 19.5%. No progress recalculation.

## CI update — PASS (audited source)
- Run #1269, workflow `FRIEND RIDE Regression`, commit `ccf7f2738d301032070a863abaf948ac638602a1`: completed SUCCESS on 2026-11-26.
- Job `browser-regression` and all listed steps passed: inline JS/version validation, npm install, Node unit/static tests, Playwright Chromium installation, local static server, browser regression, report artifact upload.
- This is local/static/browser CI only, not live QA Supabase integration or real-device validation.

## Fresh QA catalog — confirmed
- 39 public base tables; latest read-only query shows neither `fr_market_orders` nor `shop_orders`.
- Phase 13 related routines found: customer referral get/create, referral admin review/reward credit, flash-sale reserve/cancel, plus unrelated referral/admin routines.
- Missing routines from Phase 13 UI expected paths: `fr_customer_accept_market_quote`, `fr_store_flash_sale_attach_order`, `fr_customer_special_day_set`, `fr_store_review_admin_moderate`, `fr_direct_store_coupon_submit`, `fr_direct_store_coupon_review`.
- Missing Phase 13 tables: `fr_customer_special_days`, `fr_store_reviews`, `fr_direct_store_coupon_claims`.
- Referral paid/completed-order eligibility recalculation trigger/RPC remains absent.
- QA migration history latest records include Phase 13 referral foundation/review/credit and flash-sale reserve/cancel; the later checkout/attach-order, special-days, review moderation, and direct-coupon objects are not reflected.

## Additional static UI integration gaps discovered
1. **Customer referral bind/apply flow — GAP.** `index.html` and `assets/phase13-customer-referral.js` only expose Get My Referral Code and Share My Referral Invite. The JS calls `fr_customer_referral_get_or_create_code`; no bind/apply-code input or client call to `fr_customer_referral_bind_code` was found in the inspected UI. The backend bind RPC is in QA, but the customer-facing bind workflow appears missing from the current UI.
2. **Flash Sale checkout — BLOCKED / PLACEHOLDER.** UI requires a manually entered estimated subtotal to reserve; then customer manually enters an order UUID to attach a redemption. The UI explicitly states reservation/linking does not apply discount and is not payment confirmation. Checkout script uses a prompt for redemption ID and calls `fr_customer_accept_market_quote`, which is absent in QA catalog. Therefore end-to-end checkout discount/payment is not integrated.
3. **Campaign attach-order — BLOCKED.** `fr_store_flash_sale_attach_order` is called from the UI but absent from QA catalog; order table dependency unresolved.
4. **Customer referral reward — GAP.** UI text says eligibility after 2 completed eligible orders, but QA catalog lacks the paid/completed-order automatic recalculation trigger; counts are not evidenced as automatic.

## Prior unresolved risks still open
- Excess anon INSERT/UPDATE/DELETE grants on 10 tables plus public view (33 DML grants total); current RLS appears to block, but least privilege remains a GAP.
- Anonymous live-road ride listing is not proven; base SELECT policy is authenticated-only.
- Admin access to private driver-photo storage review is unverified; no explicit admin-review SELECT or DELETE policy seen.
- Runtime role matrix, OTP, push, real-device rides/orders/payments, and Phase 13 feature backend integration remain PENDING/BLOCKED.

## Status
- Static source/UI inclusion: PASS (all 7 Phase 13 scripts included in `index.html`).
- QA catalog presence for all Phase 13 integration targets: FAIL/GAP.
- Local/static/browser regression run #1269: PASS.
- Live QA backend runtime: PENDING.
- Phase 13: 80.5% frozen; 19.5% remaining.

## Evidence
- CI run #1269: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45762242165
- Prior detailed catalog audit: https://github.com/ginniprasanthsuji-ops/friend-ride-/blob/arjuna-x/phase-13-feature-audit/qa/phase13-readonly-catalog-and-migration-gap-audit-2026-11-26.md
- Audited branch head at time of follow-up: `ccf7f2738d301032070a863abaf948ac638602a1`

## Next task
Continue read-only source-to-UI and backend dependency audit, focusing on customer referral onboarding/bind path, missing order backend ownership, and catalog-to-migration reconciliation. Do not apply SQL until user explicitly approves.
