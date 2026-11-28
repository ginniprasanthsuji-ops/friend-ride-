# Project X2 source re-check — corrected findings (2026-11-28)

Branch: `yt-test-1-to-15`
Source inspected: `index.html` at branch commit `c39258ef2a81a2c21f4a13adf5bfb624cd2c0c18`.

## Confirmed in current UI
- Checkout uses `fr_customer_place_market_order_v2` with `p_request_key`.
- A request key is persisted in localStorage against a checkout signature and reused for retry; it is cleared after successful order creation.
- Customer status labels include `customer_quote_accepted` and `payment_pending`.
- Customer and partner order-list RPC calls are present.

## Still unresolved / verified risks
- Partner confirmation UI sends `p_payment_reference:null` to `fr_partner_confirm_market_payment`; draft RPC signature was previously found to be one argument, so contract mismatch remains unresolved.
- Partner confirmation success alert says payment is confirmed and order is confirmed; this wording could imply stronger verification than the manual action proves. UI confirmation prompt asks partner to check bank/UPI first, but backend state contract must be verified.
- Customer payment claim handler was not found under the expected `frCustomerClaimMarketPayment` name.
- Food/Shop backend authenticated end-to-end workflow remains unverified.
- Telugu visible strings in inspected source include mojibake; systematic UTF-8 integrity validation and correction remains needed.

## Corrected checkpoint
The previous readiness checkpoint listed idempotency integration and quote-accepted label as unfinished. This re-check confirms both are already present in the UI source. They are removed from the blocker list. No code or database changes were made during this source re-check.
