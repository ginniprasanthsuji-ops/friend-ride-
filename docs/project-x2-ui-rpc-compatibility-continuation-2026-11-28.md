# Project X2 UI/RPC compatibility continuation — 2026-11-28

Target: yt-test-1-to-15 only.

## Findings from current index.html
- Customer quote acceptance calls `fr_customer_accept_market_quote` with `p_order_id`.
- Counter offers call `fr_customer_counter_market_order` with `p_order_id` and `p_offers`, and UI rejects empty offer arrays.
- Partner payment confirmation calls `fr_partner_confirm_market_payment` with `p_order_id` and `p_payment_reference:null`; UI confirmation warns partner to independently verify UPI/bank receipt.
- Customer payment-claim handler is not present under the expected name in the current index. Do not assume customer payment claim exists or mark this workflow complete.
- Several visible Telugu strings in the reviewed snippets are mojibake (garbled encoding) in the fetched HTML text. This is a UI text integrity regression risk and needs targeted encoding/phone screenshot verification; the latest static CI passes do not prove Telugu rendering correctness.
- No live QA order/payment was performed in this audit.

## Next actions
1. Locate the actual customer payment reference/claim UI and its RPC contract.
2. Compare backend draft RPC signatures against the frontend payloads before applying any migration.
3. Add a static regression test for Telugu text encoding/UTF-8 mojibake detection, scoped to user-visible text and with safe exclusions for intentional legacy content.
4. Verify the order state machine and partner confirmation cannot falsely represent payment as externally verified.
5. Run authenticated QA E2E and real mobile screenshot checks after any code changes.

No SQL migration applied; no live data changed.
