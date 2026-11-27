# Project X2 Quote and Counter Offer RPC Draft Review

Migration draft: `supabase/migrations/202611270008_project_x2_food_shop_quote_counter_rpcs_draft.sql`

Draft RPCs:
- `fr_partner_quote_market_order`: partner ownership lock/check; validates quote array, requires per-item positive price and updates partner quote snapshots/order total.
- `fr_customer_accept_market_quote`: customer ownership check and accepts only a quoted order.
- `fr_customer_counter_market_order`: customer ownership check, validates per-item positive counter prices, reopens negotiation.

Important review findings (must fix before apply):
1. Quote/counter array matching currently uses per-item lookup but does not robustly reject duplicate item IDs (count check can be fooled by duplicates). Add distinct-ID and exact set checks.
2. Counter-offer flow stores customer counter values in `partner_quote_paise`; schema needs a separate `customer_counter_paise` column and quote-round tracking/history for negotiation.
3. Quote totals currently omit any delivery-fee calculation policy; fee must be determined server-side.
4. Accepting quote sets status `accepted`, but UI/status semantics must distinguish customer quote acceptance from partner acceptance and avoid ambiguous transitions.
5. Partner quote function permits quote on `accepted` and `quoted`; state/round rules need tightening.
6. No payment verification or quote expiry yet.

No database apply; no runtime test; review draft only.