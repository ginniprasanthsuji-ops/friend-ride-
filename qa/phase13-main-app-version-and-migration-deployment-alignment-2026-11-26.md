# Phase 13 QA — Main App Feature Surface, Version Markers, and Migration-Deployment Alignment (2026-11-26)

## Scope and safety
- Dedicated branch: `arjuna-x/phase-13-feature-audit`; audited head before this report: `f443023824a662c7eb6d954b30b51d92c0b2fce4`.
- QA Supabase project: `pqsangtvietawkfgpgfu`.
- Static source and read-only catalog/migration-history inspection only.
- No SQL writes, migrations, deployment, Production/Main access, or runtime feature testing.
- Phase 13 frozen progress baseline: 80.5%; remaining 19.5%. No recalculation.

## PASS — Phase 13 module inclusion in the main index
The QA branch `index.html` loads all seven Phase 13 script modules:
- `assets/phase13-flash-sale-checkout.js`
- `assets/phase13-campaigns.js`
- `assets/phase13-customer-referral.js`
- `assets/phase13-referral-admin.js`
- `assets/phase13-special-days.js`
- `assets/phase13-store-reviews.js`
- `assets/phase13-direct-coupons.js`

Static HTML contains the customer referral, special-day consent, store review, direct coupon, campaign admin, and referral admin controls. This proves source inclusion only—not deployment freshness or runtime success.

## GAP — Main app version metadata remains old
The main `index.html` still declares `application-version=11.1-PRO-category-routing-learning-isolation`, title `FRIEND RIDE V11.1 PRO`, and visible title suffix `Version 10.3`. No Phase 13 version marker is present in the audited metadata. These stale markers are evidence the main-app version branding has not been updated in this branch; they do not by themselves prove which code is currently served on a live domain.

## GAP — Customer referral apply/bind UI absent from main app
- Main `assets/phase13-customer-referral.js` calls `fr_customer_referral_get_or_create_code` and displays/share code only.
- Main `index.html` has no `frReferralApplyInput` or apply-code UI; main customer module does not call `fr_customer_referral_bind_code`.
- A separate prototype under `features/phase13/referral-ui.html` and `referral-ui.js` has an apply-code flow, but it is not among the main-index script tags.
- QA catalog confirms the bind RPC exists. Thus the backend bind path is catalog-present, but the primary app does not expose it (static source finding).

## BLOCKED — Flash Sale checkout/order integration
- QA catalog has campaign and redemption tables; RLS is enabled on both. Campaign public read policy is restricted to active, approved campaigns within their time window. Campaign admin ALL policy checks `is_friend_ride_admin()`; redemption read is owner/admin only.
- QA catalog contains `fr_store_flash_sale_reserve` and `fr_store_flash_sale_cancel_reservation`.
- Main campaigns module calls `fr_store_flash_sale_attach_order`, which is absent in QA catalog. Migration source `20261125200800_phase13_flash_sale_order_link_rpc.sql` exists in the branch but is not recorded as applied.
- Main checkout module calls `fr_customer_accept_market_quote`; this function is absent from QA catalog.
- QA catalog has neither `fr_market_orders` nor `fr_market_order_items`. Checkout/discount migration `20261125210000_phase13_flash_sale_checkout_discount.sql` depends on those missing tables, so it cannot be applied safely before the market-order foundation is resolved.
- Result: UI/source exists, reserve/cancel RPCs are catalog-present, but order-link and actual checkout discount are BLOCKED. No runtime pass.

## BLOCKED — Special-day offer data
- Main UI module calls `fr_customer_special_day_set` and reads `fr_customer_special_days`.
- Branch migration sources `20261125200300_phase13_customer_special_days_consent_foundation.sql` and `20261125200400_phase13_special_day_calendar_validation.sql` exist.
- QA catalog lacks the special-days table and setter RPC; these migrations are not in QA migration history.
- UI text says offer targeting is not yet activated. Consent/date persistence cannot be runtime-tested in current QA.

## BLOCKED — Store reviews
- Main UI inserts into `fr_store_reviews` and admin moderation calls `fr_store_review_admin_moderate`.
- Branch migration source `20261125200500_phase13_store_reviews_moderation_foundation.sql` exists.
- QA catalog lacks the table and moderation RPC; migration not recorded as applied.
- Reviews are explicitly unverified purchases in the UI. No moderation runtime test.

## BLOCKED — Direct store coupon recognition
- Main UI submits via `fr_direct_store_coupon_submit` and admin/partner review via `fr_direct_store_coupon_review`, using `fr_direct_store_coupon_claims`.
- Branch migration sources `20261125200600_phase13_direct_store_coupon_claim_foundation.sql` and `20261125200700_phase13_direct_store_coupon_rpc_role_hardening.sql` exist but are not recorded as applied; QA catalog lacks the claim table and RPCs.
- The foundation migration references `public.shop_orders`, which is absent from QA. This is a hard dependency blocker; do not apply coupon migrations until the order schema is resolved.

## GAP — Referral order eligibility automation
- QA catalog contains customer referral code/referral/referral reward ledger tables, RLS enabled, owner/participant/admin policies; code-create, bind, admin-review, and reward-credit RPCs are present.
- Branch migration source `20261125200900_phase13_customer_referral_order_eligibility.sql` defines recalculation and an order-update trigger but is not recorded as applied.
- It references `fr_market_orders`, absent from QA; therefore automatic recalculation from two completed/paid orders cannot be installed in this QA project.
- The customer referral UI currently only generates/shares the code (see previous GAP). No order-eligibility runtime evidence.

## Migration/source reconciliation summary
Source migration files exist in this branch for special-days, store reviews, direct coupons, flash-sale order linking, referral order eligibility, and checkout discount. QA migration history does not show these versions as applied. Existing deployed QA catalog contains the campaign foundation/reserve/cancel and customer-referral foundation/bind/admin-review/eligibility guard/reward-credit objects, but not the newer missing objects listed above. This distinguishes repository-prepared migrations from deployed QA backend state.

## CI
- Latest checked run before this report: Regression run #1270, commit `f443023824a662c7eb6d954b30b51d92c0b2fce4`, conclusion SUCCESS.
- Browser-regression job passed all listed steps: version/inline JS validation, npm install, static/unit tests, Playwright setup, local browser regression, report upload.
- CI is local/static/browser-only; it is not live QA database integration, SMS/push, or real-device testing.

## Disposition
Main app includes Phase 13 module scripts but still has old version metadata and several frontend/backend gaps. Missing QA backend objects are partially covered by source migrations in the branch; their application is blocked by missing market-order/shop-order foundations and is not authorized in this audit. Do not report these features as runtime PASS.

## Next audit task
Read-only source-to-catalog reconciliation for the remaining core commerce/market-order RPC and table prerequisites; verify which migrations exist in repository and whether any QA catalog object is actually deployed. Continue to surface exact missing order foundation dependencies before any proposed QA migration sequence.
