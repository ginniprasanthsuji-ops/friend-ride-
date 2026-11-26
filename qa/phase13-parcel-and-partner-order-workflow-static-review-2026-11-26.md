# FRIEND RIDE Phase 13 — Parcel Workflow Frontend Static Review (2026-11-26)

## Scope
QA branch source review only. Inspected `index.html` (blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`), `qa/read-only-regression.sql` (blob `b341a1bf881bb326d08fc6fd4f48005a3663d8c8`), `qa/PLAY-STORE-RELEASE-GATE.md`, and `scripts/check-inline-js.mjs`. No app/database/production changes.

## Source observations
- Customer parcel request calls `fr_customer_create_parcel_request` with sender/receiver names and phones, pickup/delivery addresses, description, and weight.
- Frontend validates addresses/description, phone digit length (minimum 8), and weight greater than 0 and up to 500 kg before RPC.
- Driver parcel list is obtained through `fr_driver_list_parcel_requests`; UI finds matching tracking ID and checks status `requested` before calling `fr_driver_accept_parcel`.
- Driver delivery confirmation checks tracking ID and six-digit OTP in frontend, finds assigned parcel through the list RPC, then calls `fr_driver_verify_parcel_delivery_otp`. Frontend handles a false response as wrong/expired/attempt-limit exceeded.
- Customer service request is wired to `fr_customer_create_service_request`, with address/work/date/time validation and a provider ID optionally sent.
- Partner market-order UI calls `fr_partner_list_market_orders` and updates status through `frPartnerUpdateMarketOrder` (call-site present).
- Targeted search did not locate backend SQL definitions for parcel create/accept/OTP verification or partner market-order listing/status RPCs. This is a repository-source search gap, not proof the deployed database lacks them.

## Risks / verification gaps
1. Client-side parcel status check is a pre-check only; concurrent acceptance safety must be enforced atomically by server RPC. Backend implementation not located, therefore unverified.
2. OTP length/input validation and attempt-limit messaging are client-visible; server-side OTP expiry, hashing/secure storage, attempt throttling, assigned-driver authorization, and delivery-state transition are unverified.
3. Partner order actions/status transitions need server-side role, ownership, and valid-state enforcement; backend definitions not located.
4. The read-only regression SQL inventories selected function names but does not execute parcel/order RPC authorization or state transitions.

## Test status
- Static source review: completed.
- Runtime / database execution: not executed in this continuation.
- Real-device tests: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Decision
No certification change. These parcel and partner order workflows remain source-wired but backend authorization, atomicity, and live execution are not evidenced by this review. Release gate remains blocked pending evidence.
