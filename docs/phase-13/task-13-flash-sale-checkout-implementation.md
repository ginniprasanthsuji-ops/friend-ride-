# Phase 13 Task 13 — Flash Sale Checkout Discount Implementation

## Implemented
- Added order fields: `flash_sale_redemption_id`, `flash_sale_discount_paise`, `flash_sale_campaign_code` with non-negative discount check.
- Replaced trusted `fr_customer_accept_market_quote` with optional redemption UUID parameter. The old one-argument function was dropped to prevent unsafe/ambiguous overload grants.
- Checkout validates customer-owned active reservation, reservation linked to the exact order, active/approved Flash Sale, campaign/order partner match, active dates, minimum subtotal, and per-user redeemed limit.
- Discount is recalculated using server-stored partner quote item prices and quantities. Percent/fixed amount are capped by campaign max discount and subtotal; free-delivery type is handled server-side if configured. Campaign discount fields are not trusted from browser input.
- Final payable total is stored on order; payment details workflow uses the stored order total.
- Reservation is finalized to redeemed only when Partner payment-confirmation RPC succeeds. If payment confirmation is rejected, transaction rolls back.
- Customer quote-acceptance UI now optionally prompts for a redemption UUID and displays discount/payable result. Blank input preserves normal checkout.
- RPC permissions verified: anon execution denied, authenticated execution granted. Old one-argument acceptance function removed.

## Verification
- Live Supabase migration applied successfully.
- Schema constraint validated.
- RPC permission audit passed (anon=false, authenticated=true) for acceptance and partner payment confirmation.
- GitHub migration SQL committed; UI JS asset and index loader committed.
- Browser/E2E, actual payment and full reservation/checkout workflow have not been tested.

## Commits
- DB migration file: `4f530434`
- Checkout JS: `04a771d5`
- index loader: `6715c640`

## Limitations / next QA
- Customer must have reservation UUID and link reservation to order before quote acceptance; linking is still a manual step in existing UI.
- The customer alert shows discount/payable at quote acceptance; detailed discount line item in payment/order UI remains a polish task.
- Do not claim a live payment was made or Flash Sale redeemed until partner confirms payment in app.
