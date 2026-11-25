# Phase 12 — Coupon Backend Draft (Review Only)

Status: Draft design; NOT deployed or applied to any Supabase project.

## Requirements confirmed in discussion
- Admin and participating stores can create coupons, subject to Admin controls.
- Customers can buy coupons.
- Payment goes directly to the store; Friend Ride should not hold coupon sale proceeds.
- A successful payment should automatically be recognized by the store (payment-confirmed purchase record/notification).
- Coupon redemption must be validated and single-use; prevent duplicate redemption.
- Ride coupons cover Bike, Auto and Car services.
- Store coupons should be redeemable by the issuing store.
- Reporting should support coupon sales and redemption status.

## Environment correction and main backend inspection (read-only, 2026-11-25)
- Separate FRIEND RIDE QA Supabase was intentionally not created per repository QA checklist. The previously inspected `pqsangtvietawkfgpgfu` is a different database, not FRIEND RIDE QA; its table comparison is invalid.
- Main FRIEND RIDE Supabase ref: `fglyplxcczdjtfwobtzh`. Read-only main schema inventory returned 85 public tables.
- Main project has existing order/payment/notification infrastructure; no coupon-specific tables/functions were found in the inspected inventory/function search.
- Existing market order payment flow: customer accepts quote -> `payment_pending` with a 5-minute expiry and `payment_status='pending'`; approved owning store partner calls `fr_partner_confirm_market_payment`, which checks ownership, state, expiry, then marks paid/accepted and sends customer notification.
- Ride payment flow is separate: customer creates QR payment request for completed ride; customer submits transaction ID; assigned approved driver confirms success. This cannot be reused as a store-coupon payment confirmation.
- Existing notification event hooks for order/payment status changes can potentially be reused for coupon notifications after exact trigger and policy review.
- No new SQL migration has been applied. Draft coupon work must remain review-only until an owner-approved deployment/test environment exists.

## Proposed data model (check for existing equivalents before migration)
1. `fr_coupon_campaigns`: issuer type/ID, coupon type (ride/store), service scope, title/description, discount type/value, start/end, limits, status, created-by.
2. `fr_coupon_codes`: campaign, unique code, customer, purchase/payment status, purchased-at, redeemed-at, redeemed-by, redemption reference, expiry, status.
3. `fr_coupon_payments`: coupon/code, store ID, amount/currency, payment confirmation reference, status, paid-at, confirmation source. Store direct-pay proof only; do not represent Friend Ride as receiving funds.
4. `fr_coupon_redemptions`: coupon/code, customer, store or ride reference, service type, redeemed-at, actor, idempotency key; unique constraints to prevent reuse.
5. Notifications should reuse existing app notification infrastructure; avoid introducing another notification service.

## Lifecycle
Draft campaign -> Admin/issuer activation -> customer purchase -> store payment confirmation -> coupon marked paid/active + store notification -> eligible redemption validation -> atomic redemption -> reporting.

## SQL/API safety requirements
- Verify issuer permissions and store ownership.
- Verify customer ownership on purchased coupons.
- Validate campaign active window, limits, coupon status, scope and expiry.
- Use transaction/atomic RPC for redemption; unique constraints and idempotency.
- Do not accept client-submitted payment as trusted without an existing verified payment-confirmation flow. If direct store payment is confirmed manually, record who confirmed and a reference; never fabricate a paid state.
- Use RLS and narrowly scoped RPCs; secure `search_path` for SECURITY DEFINER functions.
- Reuse existing tables/functions where equivalent; do not create duplicate structures.
- Keep migrations additive and QA-project-first. Production remains untouched.

## Test checklist
- Issuer role authorization and store ownership.
- Campaign activation/deactivation, dates and quantity limits.
- Ride service scope: Bike/Auto/Car; wrong service rejected.
- Store coupon: wrong store rejected.
- Purchase unpaid/pending/paid transitions; store recognition only after confirmed payment.
- Customer cannot view or redeem another customer's code.
- Expired, disabled, already-redeemed and invalid code rejected.
- Two concurrent redemption attempts: only one succeeds.
- Retry with same idempotency key does not double redeem.
- Sales/redemption report totals reconcile to records.
- Regression tests for ride, market, food, parcel and home-service workflows.

## Blocking prerequisites
- Inspect QA RPCs, policies and payment confirmation flow before finalizing function/table names.
- Reconcile QA schema (21 tables) against main release-gate inventory (71 tables); verify refs and migrations.
- No coupon SQL has been executed. This file is a design draft only.
