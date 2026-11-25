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
