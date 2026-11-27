# Project X2 Food/Shop UI ↔ RPC Compatibility Audit

Branch: `yt-test-1-to-15`
Audit date: 2026-11-27
Scope: read-only source inspection of `index.html`, QA marker file `test.html`, and drafted migrations 006–013.

## Findings

### 1. Checkout RPC matches legacy draft 007 — PASS (signature only)
UI calls `fr_customer_place_market_order` with `p_store_id`, `p_delivery_address`, `p_items`. Draft 007 declares these same arguments. However, UI does not yet generate/persist a request key or call v2 draft 012, so duplicate-retry protection is not integrated.

### 2. Multi-store checkout — NOT IMPLEMENTED / BLOCKER
The QA marker checks for `fr_customer_place_multi_market_order`, but app source does not contain this RPC. UI checkout currently validates one store ID and calls the single-store RPC. Multi-store cart must either be split into separately idempotent per-store orders or supported by a transactional multi-order RPC before marking multi-store checkout complete.

### 3. Payment confirmation signature mismatch — BLOCKER
Current UI calls `fr_partner_confirm_market_payment` with both `p_order_id` and `p_payment_reference:null`. Draft 013 only defines a one-argument function. PostgreSQL RPC resolution may therefore fail with function-not-found for this current UI call. Draft 013 customer claim RPC is also not wired in the current UI.

### 4. Payment state/fulfillment mismatch — BLOCKER
Current UI message says payment confirmation moves order to confirmed, while draft 013 sets only `partner_confirmed`; draft 011 fulfillment transitions require `payment_status='verified'`. There is no trusted verification path in these drafts. Do not present this as verified payment or allow fulfillment to progress based only on manual confirmation.

### 5. Order status display gaps — REVIEW
Customer order status label map currently includes `quote_requested`, `quoted`, `accepted`, `preparing`, `ready`, `completed`, `rejected`, `cancelled`, but the drafted accepted-quote status `customer_quote_accepted` is not mapped. Add a clear display label and UI action/status behavior when integrating.

## Safe next work
- Correct RPC/UI signatures in a separate draft migration or change UI after review.
- Integrate request key and idempotency v2.
- Decide and implement multi-store checkout.
- Payment confirmation must not claim verified without trusted evidence.
- Perform QA on branch only; no migration apply or real orders.

## Execution status
Source audit only. No Supabase migration applied; no live order, payment, or runtime test performed.
