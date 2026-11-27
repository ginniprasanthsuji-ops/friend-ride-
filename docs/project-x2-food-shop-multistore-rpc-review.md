# Project X2 Multi-Store Transaction RPC Draft Review

Branch: `yt-test-1-to-15`
Draft migration: `202611270015_project_x2_food_shop_multistore_transaction_draft.sql`
Status: review-only. Not applied to Supabase. Checkout UI not yet integrated.

## Draft behavior
- Accepts a single delivery address, item JSON array, and customer request UUID.
- Requires each line to carry `store_id` and `catalogue_item_id`.
- Uses a customer/request-key advisory transaction lock.
- Replays the stored result set for the same customer/request key.
- Groups cart lines by store and calls existing validated single-store RPC once per store.
- Stores all created order IDs/numbers/store IDs in one request record.
- Function transaction provides all-or-nothing behavior if any store RPC fails.

## Review findings / blockers before integration
1. Existing UI cart item mapping must be updated to include `store_id` on every line; current single-store payload omits it.
2. Existing checkout cart can include non-catalogue/master items with no catalogue item ID; these cannot be submitted to this RPC without an approved backend catalogue mapping.
3. The idempotency key record currently stores result only, not a hash of the request payload. Same customer/key reused with a different cart will replay the original result. Consider adding request fingerprint and rejecting mismatched payload.
4. Existing single-order idempotency migration 012 adds `request_key` to `fr_market_orders`; multi-store request idempotency uses a separate request table. Confirm whether migration 012 is needed for the final architecture or can be excluded.
5. Verify schema migration ordering and all function grants/ownership against live QA database before apply.
6. Partner order listing/tracking functions need regression checks to ensure every child order is independently visible to its owning partner and customer.
7. No delivery fee calculation is included; legacy single-store RPC currently creates orders with zero delivery fee.
8. Payment claim/partner-confirmation remains per order and is not payment verification.

## Acceptance checks (not run)
- One-store request returns exactly one order.
- Two-store request returns two orders, one per partner.
- Repeating same customer/request key returns same order set.
- Any invalid/unapproved store or unavailable catalogue item rolls back all child orders and request record.
- Same request key with altered payload must be rejected after fingerprint safeguard is implemented.
- Customer and partner access remains role/ownership-scoped.
- Cart and request key clear only after complete success in UI integration.

## Recommendation
Before UI integration, revise the RPC to store a payload fingerprint and reject key reuse with a changed payload, then validate migration dependencies/order. This draft is a starting point only; no SQL applied and no real orders created.
