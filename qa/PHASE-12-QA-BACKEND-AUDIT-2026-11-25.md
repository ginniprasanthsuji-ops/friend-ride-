# Phase 12 — QA Backend Audit Notes (Read-only, 2026-11-25)

## Correction: QA environment identity
- Main FRIEND RIDE Supabase project: `friend-ride`, ref `fglyplxcczdjtfwobtzh`.
- Repository QA checklist explicitly says a separate Supabase QA database was intentionally NOT created, per owner instruction.
- The project `pqsangtvietawkfgpgfu` that was queried earlier is a separate database with Learn/Teach/Zoom/Homework migrations and is NOT the FRIEND RIDE QA environment. Do not use it for FRIEND RIDE QA or implementation. The prior “21-table QA vs 71-table main” comparison was invalid; correction recorded here.
- Main project currently has 85 public tables (read-only inventory), including the FRIEND RIDE order/payment/notification/service tables and Learn/Teach objects. RLS is reported enabled on each listed table.
- Main project migration history includes FRIEND RIDE payment/order/notification migrations through 2026-11-21.

## Main project payment/order/notification read-only inspection
Functions inspected by name filter include:
- `fr_customer_place_market_order`, `fr_customer_place_multi_market_order`: authenticated customer checks, approved-store checks, order and item rows; multi-store checkout creates separate store orders and app notifications with dedupe key.
- `fr_partner_quote_market_order`: approved partner ownership check, quote validation for every item, subtotal/delivery/total, customer notification.
- `fr_partner_update_market_order`: partner ownership/approval, restricted state transitions, blocks completion unless payment status is paid and confirmation timestamp exists.
- `fr_customer_list_market_orders` and `fr_partner_list_market_orders`: role/ownership filtered order listing.
- Notification event hooks exist for order/payment state changes; the inspected notification trigger inserts deduped queued events for customer/partner/driver recipients. Existing notification foundation and production migration history are present.
- `fr_push_notification_webhook`: webhook trigger uses Vault secret and calls the existing dynamic-responder Edge Function; exceptions warn and return without blocking the triggering row.

This was a limited function-name and definition inspection, not a complete payment, RLS, or security audit. It does not establish coupon functionality.

## Coupon findings
- No coupon-named table or function was seen in the inspected main public inventory/function search.
- Existing order/payment/notification infrastructure may be reusable, but coupon sale is a separate workflow and requires carefully designed payment confirmation, store ownership, and single-use redemption.

## Environment / deployment decision
- There is no separate FRIEND RIDE QA Supabase database documented or verified.
- Do NOT apply new coupon DDL to the active main project in this turn.
- Draft implementation and tests in GitHub only; production changes require explicit owner review and a safe deployment/rollback plan.

## Evidence / next work
Next: inspect the exact payment-confirmation RPCs, relevant table constraints/RLS policies, and ledger behavior in main project read-only; then prepare a migration draft with tests. Production untouched.


## Payment RPC audit — read-only, 2026-11-25
- `fr_customer_accept_market_quote(p_order_id)`: validates customer ownership and quoted state, approved partner UPI, calculates subtotal/delivery/total, sets payment pending and a 5-minute expiry, notifies store.
- `fr_partner_confirm_market_payment(p_order_id,p_payment_reference)`: validates approved partner role, order ownership, payment_pending/pending status and expiry; marks paid/accepted, stores optional reference, and notifies customer. It is a store partner confirmation, not an external gateway webhook.
- `fr_customer_create_ride_payment(p_ride_id)`: customer-owned completed ride; creates/reuses QR payment record with five-minute expiry and assigned driver QR path.
- `fr_driver_confirm_ride_payment(p_ride_id)`: assigned approved driver confirms after customer submits transaction ID; checks completed ride and pending-confirmation state, marks success, and notifies customer.
- These existing payment RPCs are distinct. Coupon direct-to-store payment needs its own trusted confirmation/verification path; do not mark coupon paid from a customer-side button alone.
- Relevant schema columns inspected read-only for market orders, ride payments, shop payments and ledger. No coupon-specific implementation was found in the inspected public inventory/function name search.
- No DDL or data write executed.
