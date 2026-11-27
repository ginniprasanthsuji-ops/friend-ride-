# Project X2 — Food / Shop Backend Contract

Branch: `yt-test-1-to-15` only. Main/production must remain untouched.

## Audit result (2026-11-27)
- UI source contains calls for catalogue save/list, customer catalogue, market-order create/list, partner quote, customer accept/counter, payment confirmation, and customer payment details.
- QA Supabase query found no functions for these RPC names.
- No verified authoritative catalogue/market-order schema was present in the QA database audit. Therefore this contract is documentation only; no SQL has been applied.

## Catalogue RPC contract
### `fr_partner_save_catalogue_item`
Arguments: `p_master_sku, p_item_name, p_category, p_unit, p_description, p_price_paise, p_offer_price_paise, p_image_url, p_available, p_prescription_required`.
Partner must be authenticated and authorized/approved; writes only own store catalogue. Validate non-empty item/category, price >= 0, offer price <= base price, SKU/category/unit limits, and prescription flag. Catalogue price fields are integer paise. Images must use a controlled storage path, not arbitrary untrusted URL; if existing UI uses public URL, migration must validate or normalize it before storing.

### `fr_partner_list_catalogue`
Authenticated partner-scoped list; must return fields: `id, master_sku, item_name, category, unit, description, price_paise, offer_price_paise, image_url, available, prescription_required`.

### `fr_customer_list_partner_catalogue(p_store_id)`
Only approved/active store; returns same catalogue fields, filters unavailable items, and must not expose partner-private fields.

## Order RPC contract
### `fr_customer_place_market_order(p_store_id, p_delivery_address, p_items)`
Create a customer-owned order. Revalidate store eligibility and catalogue item IDs, prices, availability, and prescription rules on server. Do not trust client-sent item names, prices, offer prices, or totals. Item JSON currently carries `name, quantity, prescription_required, catalogue_item_id, image_url, unit_price_paise`; server should use catalogue ID to derive canonical values and reject mismatches. Return `order_id, order_number`.

### `fr_customer_list_market_orders`
Customer-owned orders only. Include item JSON and current quote/order/payment status; no partner phone/private payment data until the order is eligible for payment handoff.

### `fr_partner_list_market_orders(p_status)`
Approved partner sees only orders for their store. Filter optional status. Include items and quantities; do not leak other stores' orders or customer private fields beyond fulfilment need.

## Quote workflow
- `fr_partner_quote_market_order(p_order_id, p_quotes)`: partner ownership, status transition, quote list must cover valid item IDs; integer paise and positive values.
- `fr_customer_accept_market_quote(p_order_id)`: customer ownership; accept only latest quote and transition guarded.
- `fr_customer_counter_market_order(p_order_id, p_offers)`: customer ownership; valid items/positive integer paise, guarded transition.
- Every state change is transactional and records history; reject stale/invalid transitions.

## Payment workflow (no false-positive paid state)
- `fr_customer_market_payment_details(p_order_id)`: customer-owned, eligible order only; reveal payment QR/UPI details only after accepted quote/approved payment stage; signed/private QR paths preferred.
- `fr_customer_tick_market_payment`: customer payment claim is not verification.
- `fr_partner_confirm_market_payment(p_order_id,p_payment_reference)`: partner confirmation is manual confirmation, not independent bank verification. Store actor, timestamp, reference, and a distinct manual-confirmation status. Never call it verified/settled unless authoritative evidence exists. Prevent duplicate confirms and ensure order progression follows explicit guarded state.
- UI must avoid saying “Payment verified” where only partner manual confirmation occurred.

## Security / data model requirements
- Tables for stores/catalogue, orders, order items, quote revisions, and status/audit history.
- RLS on all user-facing tables; security-definer RPCs with fixed search_path and explicit auth/role/store ownership checks.
- No public anonymous order read/write.
- Idempotency or duplicate protection for order creation; transactionally snapshot catalogue item and price at order time.
- Use integer paise throughout; no floating point in database.
- Status allow-list and transition guards.
- Migration should reconcile existing store/profile schema and indexes before applying.
- Add SQL and browser regression tests: partner save → customer catalogue → cart/order → partner quote → customer accept/counter → payment claim/manual confirmation → tracking. Validate cross-store/customer/partner access denied.

## Next implementation step
Inspect actual `profiles`/store ownership and current UI status transitions, then draft the migration with exact existing column/role conventions. Do not apply migration to QA until reviewed against schema.