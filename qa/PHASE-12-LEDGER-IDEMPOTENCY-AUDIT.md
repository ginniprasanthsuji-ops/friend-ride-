# Phase 12 — Payment Ledger & Idempotency Audit

Read-only audit performed against the FRIEND RIDE main Supabase project. No data or schema modified.

## Observed index/constraint protection
- `fr_ride_payments`: unique `ride_id` ensures one payment record per ride.
- `fr_ride_payments`: unique case-insensitive transaction ID index when transaction ID is present.
- `shop_payments`: unique `order_id` ensures one shop payment row per order.
- `fr_market_orders`: unique order number; indexes customer/partner history, payment expiry, checkout group.
- `fr_v8_order_ledger`: indexes checkout, order, seller histories, but inspected index inventory shows only primary key and non-unique history indexes; no observed ledger idempotency unique index.

## Ledger structure inspected
`fr_v8_order_ledger` contains:
- checkout_id, order_id
- seller_user_id, driver_user_id
- entry_type, amount_paise, currency_code
- payment_mode, reference_id, status, metadata
- created_at, created_by

## Risk / follow-up
1. Ledger duplicate prevention is not evidenced by a unique idempotency key in the inspected schema. Before adding platform-fee or settlement entries, design an additive unique key or equivalent atomic dedupe strategy based on event/entry type and payment/order identity. Confirm legitimate multi-entry cases before choosing uniqueness.
2. Do not retroactively write ledger entries from UI-only payment states.
3. Confirm amount sign convention and currency units (paise) for every ledger entry type.
4. Audit ledger insert/update permissions, RLS, and trigger/RPC paths before implementation.
5. Existing ride/shop payment uniqueness is useful, but does not itself prove ledger writes are idempotent.

## Platform fee examples supplied by product owner
- ₹100 transaction -> ₹2.50
- ₹500 -> ₹11.50
- ₹1,000 -> ₹25
- Above ₹1,000 -> capped at ₹25

These examples do not uniquely define a continuous formula or slab rule. Do not derive a formula from them or deploy calculation logic without the exact rule and rounding policy approved.