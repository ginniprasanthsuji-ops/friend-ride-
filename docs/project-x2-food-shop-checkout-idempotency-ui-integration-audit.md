# Project X2 Food/Shop Checkout Idempotency Integration Audit

Branch: `yt-test-1-to-15`
Audit date: 2026-11-27

## Current source facts
- Checkout function is `marketCheckout()` in `index.html`.
- It calls legacy RPC `fr_customer_place_market_order` with `p_store_id`, `p_delivery_address`, and `p_items`.
- UI rejects carts containing more than one distinct store ID.
- No idempotency request key is sent by the current checkout call.
- On success, the cart is cleared and the app navigates to Orders.
- No persistent checkout request key was found in the inspected cart implementation.

## Integration blockers
1. Before switching to the v2 idempotent RPC, confirm the exact migration filename, RPC signature, return schema, and deployed QA schema. The draft migration path previously referenced could not be retrieved from the branch in this audit.
2. UI must create one stable request UUID before the first submit and reuse it on retry for the same cart payload. It must not create a new UUID on retry.
3. A key must be scoped to customer + cart/request payload and cleared only after the RPC returns a confirmed order ID. Failed or interrupted requests must retain the key for retry.
4. Multi-store checkout requires an explicit design: either split into separate per-store idempotent requests with independently retained keys, or a transactional multi-order RPC. Do not silently create partial orders.
5. Avoid changing payment state or declaring verification based on manual confirmation.

## Decision
No checkout code was changed in this checkpoint. Integration is deferred until the v2 RPC's exact schema/signature and return contract are verified. No migration was applied and no order was created.

## Next step
Locate the actual idempotency migration on the QA branch, verify its RPC signature and return shape, then implement stable client request-key handling. Keep Main/production untouched.
