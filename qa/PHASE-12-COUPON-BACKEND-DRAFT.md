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

## QA environment schema check (read-only, 2026-11-25)
- QA project public schema currently contains 21 base tables (not the 71 tables described in the 2026-11-09 release-gate inventory for the main project).
- The QA table list was inspected; no coupon-specific tables are present.
- Existing notification infrastructure in QA includes `fr_app_notifications`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`, and `fr_push_subscriptions`. Coupon purchase/redemption notices should reuse these existing systems after reviewing their RPC/policy behavior.
- This environment/schema mismatch is a release/implementation blocker: verify project refs, migration history, and QA schema before any SQL migration. Do not copy main-project assumptions into QA.

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
