# Phase 13D QA — Phase 13 feature UI / QA schema cross-check (2026-11-26)

## Scope
Read-only source inspection of Phase 13 frontend modules and catalog/policy/function inspection on dedicated QA Supabase project `pqsangtvietawkfgpgfu`. No DB writes/migrations, production access, app-source changes, OTP, device, or runtime tests.

## Frontend modules inspected
- `assets/phase13-campaigns.js`: Flash Sale campaign creation and customer/admin loading integration.
- `assets/phase13-customer-referral.js`: customer referral code RPC, ₹50 eligibility text after two completed eligible orders, sharing.
- `assets/phase13-direct-coupons.js`: direct-store coupon claim submission via RPC and partner/admin review UI.
- `assets/phase13-flash-sale-checkout.js`: quote acceptance and optional redemption-ID integration.
- `assets/phase13-referral-admin.js`: referral review and reward-ledger credit UI.
- `assets/phase13-special-days.js`: birthday/special-day date and consent settings; UI explicitly states offer targeting is not yet activated.
- `assets/phase13-store-reviews.js`: customer review submission and admin moderation; submitted reviews are explicitly not purchase-verified.

## QA schema snapshot
Read-only catalog result:
- `fr_store_campaigns`: present, RLS enabled, 2 policies.
- `fr_customer_referrals`: present, RLS enabled, 2 policies.
- `fr_customer_special_days`: not returned in the current QA catalog query.
- `fr_store_reviews`: not returned in the current QA catalog query.
- `fr_direct_store_coupon_claims`: not returned in the current QA catalog query.

Policy definitions observed:
- Campaign admin ALL policy requires `is_friend_ride_admin()`.
- Campaign public SELECT only permits active, approved campaigns within the current start/end window.
- Customer referrals admin ALL policy requires `is_friend_ride_admin()`.
- Referral participant SELECT is limited to referrer, referred customer, or admin.

Function catalog:
- `fr_customer_referral_get_or_create_code` exists; SECURITY DEFINER, fixed empty search_path, checks auth and customer profile role before code retrieval/creation.
- `fr_customer_referral_admin_review` exists; SECURITY DEFINER, fixed empty search_path, admin guard, approve/reject validation, and requires at least 2 eligible orders for approval.
- `fr_customer_special_day_set` and `fr_direct_store_coupon_submit` were not returned in the QA function lookup.

## Assessment
- Static UI paths exist for all listed Phase 13 features, but current QA database snapshot does not expose the special-day, store-review, and direct-coupon tables or the special-day/direct-coupon RPCs queried here. Therefore end-to-end database validation for those modules is **not confirmed** in this QA environment.
- Special-day UI indicates offer targeting is not activated.
- Store-review UI marks submitted reviews as unverified purchases; this is an intentional truthful state in the current UI.
- Flash-sale campaign UI sets approval fields in its client payload, but the QA table's admin-only RLS policy is the database enforcement boundary; no runtime role test was performed.

## Limits and next actions
- Reconcile Phase 13 frontend modules with the deployed QA schema/migrations.
- Review direct-coupon and review moderation function/policy contracts once the relevant QA objects are present.
- Run the feature regression workflow with QA fixture accounts after schema reconciliation.
- No runtime role impersonation or database mutation was performed; production/Main untouched.
