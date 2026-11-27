# Project X2 Food/Shop Multi-Store Checkout — Design Review

Branch: `yt-test-1-to-15`
Status: design-only checkpoint; no DB migration applied and no checkout behavior changed.

## Current verified UI/backend contract
- Checkout groups store IDs and rejects carts unless exactly one store is present.
- Existing legacy RPC: `fr_customer_place_market_order(p_store_id, p_delivery_address, p_items)`.
- Idempotent wrapper draft: `fr_customer_place_market_order_v2(p_store_id, p_delivery_address, p_items, p_request_key)`.
- Draft idempotency key is unique per customer and is associated with one order.
- Order table is partner-scoped (`partner_id`) and order items are attached to one order.

## Options considered
### A. Client creates one order per store (not recommended)
A cart with N stores requires N RPC calls. If calls 1..k succeed and a later call fails, customer sees partial orders. Retry management must preserve a key per store/cart group and expose the partial-success recovery UX. Client-side sequence is not atomic.

### B. One transactional multi-store RPC (recommended)
Create a single RPC accepting the delivery address, all cart lines, and one cart request key. The backend validates every line against approved store ownership and catalogue availability/prices, groups items by store, creates one order per store, and returns all order IDs/numbers. Any validation or creation error rolls back the whole transaction. A unique customer/request-key record must protect the entire multi-order operation, not merely one order.

## Required design safeguards
- One cart-level UUID persisted across retries; do not rotate it after transient failure.
- Server stores request-key record plus response/order IDs, uniquely scoped to customer.
- Validate every item and partner in one transaction; never trust client price or store grouping.
- Ensure duplicate line items are handled consistently.
- No partial multi-store success; transaction rollback on any invalid store/item.
- Orders remain partner-separated; customer tracking lists all child orders.
- Payment claims/partner confirmation must remain separate per order; do not claim payment verified.
- UI shows per-store order number/status after the atomic RPC returns.
- Clear cart and request key only after successful complete RPC response.

## Acceptance test cases (not run)
1. Single-store cart succeeds and returns one order.
2. Two-store cart succeeds and returns two partner-separated orders.
3. Retry with same request UUID returns same order set and creates no duplicates.
4. Invalid/unapproved store causes full transaction rollback.
5. Unavailable item in any store causes full transaction rollback.
6. Network timeout then retry returns prior committed result.
7. Same customer with different request key can create a new order.
8. Different customer cannot reuse/access another customer's idempotency result.
9. Cart remains intact after RPC error; clears only after complete success.
10. Customer tracking displays each store order independently.

## Decision
Keep current single-store UI until the transactional multi-store RPC and migration are reviewed, then integrate client-side. No migration apply, no real orders, and no runtime tests performed.
