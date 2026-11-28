# Project X2 Food/Shop Backend Audit — QA Only

Date: 2026-11-27
Branch: `yt-test-1-to-15`
Supabase QA project: `pqsangtvietawkfgpgfu`

## Verified database findings

### Existing partner profile source
The `public.profiles` table includes `id`, `role`, `partner_approval_status`, `business_name`, `partner_category`, `upi_id`, `phonepe_number`, `partner_qr_path`, `business_latitude`, `business_longitude`, and `partner_profile_photo_path`. This is the existing user/partner identity source. Food/Shop stores should be tied to the authenticated approved partner profile, not a parallel partner registration table.

### Market/catalogue RPC gap
Read-only RPC inventory found none of these app-called functions in the QA database:
- `fr_partner_save_catalogue_item`
- `fr_partner_list_catalogue`
- `fr_customer_list_partner_catalogue`
- `fr_customer_place_market_order_v2`
- `fr_customer_list_market_orders`
- `fr_partner_list_market_orders`
- `fr_partner_quote_market_order`
- `fr_customer_accept_market_quote`
- `fr_customer_counter_market_order`
- `fr_customer_market_payment_details`
- `fr_customer_tick_market_payment`
- `fr_partner_confirm_market_payment`
- `fr_customer_store_payment_options`
- `fr_partner_update_market_order`

The UI source calls these RPCs, so the backend gap blocks the Food/Shop catalogue and ordering workflow. The app contract is documented separately in `docs/project-x2-food-shop-backend-contract.md`.

### Parcel
QA database contains `fr_parcel_requests` with request/tracking/customer/sender/receiver/address/description/weight/status and timestamps. Verified RPCs:
- `fr_customer_create_parcel_request(p_sender_name text, p_sender_phone text, p_pickup_address text, p_receiver_name text, p_receiver_phone text, p_delivery_address text, p_description text, p_weight_kg numeric)`
- `fr_customer_list_parcel_requests()`
- `fr_customer_cancel_parcel_request(p_parcel_id uuid)`

This confirms request persistence schema/RPC presence only. Driver assignment, event/status updates, tracking screen, and full customer-to-driver E2E remain unverified.

## Implementation guardrails
- QA branch and QA Supabase only; do not touch Main/production.
- Partner/store ownership must derive from authenticated user/profile and approval state; never accept arbitrary owner IDs from the client.
- Catalogue and order pricing/stock must be server-authoritative; use integer paise.
- Order/quote/accept/counter/payment state transitions must be transactional and validated.
- Payment confirmation must not be represented as independently verified unless trusted proof is integrated.
- RLS and function permissions must be designed and tested before migration apply.
- No migration has been applied as part of this audit.

## Next work
1. Design store/catalogue/order tables linked to `profiles.id` and partner approval.
2. Implement the exact RPC contract from the UI plus secure ownership, pricing, stock, idempotency, and state validation.
3. Create a versioned SQL migration in QA repository branch.
4. Review security/RLS and test SQL function contracts before applying to QA Supabase.
5. Run E2E Food/Shop tests and Parcel tracking regression.


## Project X2 continuation — Food/Shop UI compatibility recheck (2026-11-28)

Read-only branch-source review confirmed the following blockers remain and are **not runtime-tested**:

- Checkout calls the legacy single-store RPC `fr_customer_place_market_order`; no UI request key/idempotency v2 integration was found in this review.
- Current UI rejects multi-store cart checkout (single store ID validation); multi-store transactional checkout is not implemented.
- UI partner payment-confirmation call passes `p_order_id` and `p_payment_reference:null`; draft 013 has a one-argument RPC, while draft 014 supplies a two-argument compatibility wrapper. Draft 014 is not applied/verified in the QA database.
- UI payment flow uses status labels/actions that do not fully match draft backend statuses. In particular, manual partner confirmation is not trusted payment verification and must not unlock fulfillment as if payment were verified.
- Existing UI does not wire the customer payment-claim/reference RPC described in draft 013 in the audited path.

### Safe completion criteria
1. Confirm migration dependency order and function signatures against the actual QA database without applying migrations.
2. Resolve RPC/UI status and payment-claim compatibility, and add regression tests.
3. Implement multi-store checkout or clearly prevent/label it as unsupported.
4. Integrate idempotency request keys into checkout retries.
5. Keep fulfillment locked until an explicitly trusted payment-verification policy exists; manual partner confirmation is only a claim/confirmation.
6. Execute CI/static tests and authorized QA database checks, then perform app E2E only at the final-test stage.

No migration was applied, no live order/payment was created, and Main/production were not touched.
