# Project X2 Food/Shop Payment Confirmation UI Compatibility Draft

Current source UI calls `fr_partner_confirm_market_payment(p_order_id, p_payment_reference:null)`. Draft 013 defined a one-argument function. Migration 014 draft adds a two-argument wrapper with optional reference, forwarding to the one-argument RPC. This is compatibility only and does not set `verified`.

Remaining integration blockers:
- Customer UI currently presents `accepted` and `payment_pending` statuses, while drafts use `customer_quote_accepted` and payment state flags.
- UI payment RPC paths must be reviewed end-to-end against draft function names and payloads.
- Multi-store checkout is rejected by current UI and has no multi-order RPC.
- Idempotency v2 RPC is not called by UI yet.
- No trusted payment verification mechanism exists. Do not represent partner confirmation as verified payment or unlock fulfillment.

Draft only: migration not applied; no orders/payments or runtime tests performed. Main untouched.
