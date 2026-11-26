# Phase 13C — Payment, Earnings & Refund Authorization Review

Date: 2026-11-26
Environment: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Read-only catalog/function-body review. No RPC execution, data reads, writes, grants, or policy changes.

## Ride payment session access

Table `fr_ride_payment_sessions`:
- Authenticated direct SELECT grant only; no direct anon DML grant observed.
- RLS SELECT policy limits records to matching customer_id OR driver_id.
- Service role has full table privileges.
- Session contains QR storage path, amount, transaction reference, state and timing. Participant-only read boundary is important; cross-user runtime tests remain pending.

## Ride-payment RPCs reviewed

- `fr_customer_create_ride_payment(p_ride_id)`: authenticated customer ownership check; requires ride completed and assigned driver; validates positive fare; QR configured; session lifecycle/expiry checks and 15-minute pending session.
- `fr_customer_submit_ride_transaction(p_ride_id,p_transaction_id)`: customer session ownership check, active pending/expiry check, transaction reference required and max 40 chars; advances to awaiting driver confirmation.
- `fr_driver_confirm_ride_payment(p_ride_id)`: driver ownership check and awaiting-confirmation state; marks success.
- `fr_get_ride_payment_state(p_ride_id)`: authentication and participant check (customer or assigned driver); reads state and expires stale pending sessions.

Catalog/function-body review only. Not executed with auth identities.

## Earnings ledger access

Table `fr_earnings_ledger`:
- Authenticated direct SELECT grant; RLS owner or admin read policy.
- Service role full privileges.
- `fr_get_my_earnings_balance()` filters ledger owner to `auth.uid()`.
- `fr_admin_post_earnings_ledger` requires admin, validates role/type/source/status and positive amount, prevents direct confirmed entries except admin_adjustment, and uses idempotency key.
- `fr_admin_confirm_pending_earning` requires admin, finds pending credit and inserts confirmed credit + pending-clear debit with idempotency keys.

Reviewed definitions; no runtime execution. Ledger correctness, concurrency, owner isolation and idempotency collision behavior require test identities.

## Refund RPCs reviewed

- `fr_admin_ride_refund_queue`: authenticated admin guard; limit clamped to 1–250.
- `fr_admin_ride_refund_mark_paid`: authenticated admin guard, requires nonblank refund reference, locks request row, restricts eligible statuses, then marks refunded.

Refund request creation RPC was not found in this function-name search; frontend/RPC mapping needs a separate inventory pass. Refund marking is an admin-entered confirmation and does not itself verify bank transfer/payment provider settlement.

## Priority runtime test matrix

1. Customer A cannot read Customer B payment session.
2. Customer cannot read unrelated driver's session.
3. Driver A cannot confirm Driver B's payment.
4. Non-customer cannot create payment for another customer's ride.
5. Non-participant cannot call payment-state RPC for ride.
6. Owner cannot read another owner ledger balance; admin can review under intended policy.
7. Non-admin denied ledger posting and pending earning confirmation.
8. Refund queue/mark-paid denied to non-admin.
9. Duplicate transaction/payment attempts, session expiry, and concurrent confirmations preserve state/idempotency.

## Status
Catalog/body checkpoint completed. Runtime tests blocked by zero QA auth users/profile/document records. No production changes. Phase 13C remains open pending runtime tests, privacy review and risk disposition.
