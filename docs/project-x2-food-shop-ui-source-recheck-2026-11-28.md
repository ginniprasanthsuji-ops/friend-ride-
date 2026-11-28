# Project X2 Food/Shop UI source recheck — 2026-11-28

Branch: `yt-test-1-to-15` only. Read-only source recheck; no Supabase changes.

## Corrections to earlier compatibility audit
Current `index.html` source now confirms:
- Checkout calls `fr_customer_place_market_order_v2` and sends `p_request_key`.
- Checkout stores a local request key/signature and reuses it for identical retry signatures; it removes the key only after success.
- Checkout currently rejects carts with more than one store (`ids.length!==1`); multi-store UI/RPC is not integrated.
- Customer order status label map includes `customer_quote_accepted` (“Quotation accepted — payment pending”).
- Partner payment confirmation UI calls `fr_partner_confirm_market_payment` with `p_order_id` and `p_payment_reference:null`. Draft 014 is the compatibility wrapper; draft remains unapplied.
- Payment confirmation is not trusted payment verification; no trusted provider evidence exists. Keep fulfillment blocked until the business/backend verification design is approved.

## Current readiness
- Single-store checkout source-level contract: improved / integrated with draft v2 request-key RPC.
- Multi-store checkout: blocked, UI rejects multi-store cart; draft 015 not integrated.
- Catalogue mapping: must verify each cart line has approved catalogue IDs before DB apply.
- Payment verification: blocked; manual partner confirmation must not be treated as verified.
- Order/status mapping: quote-accepted display mapping is present.
- Supabase migrations: draft only, not applied.
- Runtime authenticated checkout and retry tests: pending.
- QA project target and endpoint identity must be confirmed before applying any migration.

## Added regression coverage
Static regression now checks v2 RPC request-key usage, key reuse/clear behavior, explicit single-store guard, quote-accepted status label, and current payment-confirm RPC argument compatibility. CI is pending for the new commits.
