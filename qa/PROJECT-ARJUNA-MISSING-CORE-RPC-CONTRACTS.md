# Project Arjuna — Missing Core RPC Contract Review

**Audited source:** `index.html` at `d74ae880c59531d0ed0515a40fda01bab03af8c6`  
**Scope:** Static call-contract extraction for the 20 non-payment frontend RPCs absent from the QA catalog. No schema or runtime writes.

## 1) Marketplace / catalogue / store-order group
### Partner order lifecycle
- `fr_partner_list_market_orders(p_status)`: returns partner-visible orders, including item list and quote-related fields.
- `fr_partner_update_market_order(p_order_id, p_status)`: updates partner order state.
- `fr_partner_quote_market_order(p_order_id, p_quotes)`: quote payload array `{item_id, price_paise}`.
### Store / catalogue
- `fr_partner_save_location(p_latitude, p_longitude)`: store GPS; frontend expects response `{ok:true}`.
- `fr_partner_save_catalogue_item(p_master_sku, p_item_name, p_category, p_unit, p_description, p_price_paise, p_offer_price_paise, p_image_url, p_available, p_prescription_required)`.
- `fr_partner_list_catalogue()`: catalogue rows keyed by master SKU with price/offer/availability/image fields.
- `fr_customer_list_partner_catalogue(p_store_id)`: approved store catalogue for customer.
- `fr_customer_place_market_order(p_store_id, p_delivery_address, p_items)`: item payload includes `name, quantity, prescription_required, catalogue_item_id, image_url, unit_price_paise`; frontend expects order ID/number.
- `fr_customer_list_market_orders()`: customer order history and quote/item fields.
- `fr_customer_accept_market_quote(p_order_id)`.
- `fr_customer_counter_market_order(p_order_id, p_offers)`: offer array `{item_id, price_paise}`.
- `fr_partner_list_catalogue()`, `fr_partner_list_market_orders(p_status)` are partner authenticated workflows.
### Platform details
- `fr_get_platform_business_details()`: reads platform toll-free/GSTIN details.
- `fr_admin_save_platform_business_details(p_toll_free_number, p_gstin)`: admin-only save.

## 2) Parcel delivery group
- `fr_customer_create_parcel_request(p_sender_name, p_sender_phone, p_pickup_address, p_receiver_name, p_receiver_phone, p_delivery_address, p_description, p_weight_kg)`: frontend expects `parcel_id` and `tracking_id`.
- `fr_customer_list_parcel_requests()`: customer-owned parcel list.
- `fr_driver_list_parcel_requests()`: driver-visible request list; frontend searches by tracking ID.
- `fr_driver_accept_parcel(p_parcel_id)`: frontend expects boolean success and request status `requested` before accept.
- `fr_customer_get_parcel_delivery_otp(p_parcel_id)`: customer expects a 6-digit OTP; frontend says 10-minute expiry.
- `fr_driver_verify_parcel_delivery_otp(p_parcel_id, p_otp)`: driver delivery completion; frontend expects boolean success and rejects after expiry/attempt limit.

## 3) Multi-store checkout
- `fr_customer_place_multi_market_order(p_delivery_address, p_stores)`: stores payload `[{store_id, items:[{name, quantity, prescription_required, catalogue_item_id, image_url}]}]`.
- Frontend expects `{ok:true, order_count, orders:[{order_number,...}]}` and order_count equal to number of store groups.

## Security / design requirements before implementation
1. All order/parcel mutations must derive customer/partner/driver identity from authenticated JWT, not trust client-supplied owner IDs.
2. Partner list/update/quote must enforce store ownership and approved-partner status in SQL.
3. Driver parcel listing/acceptance must enforce approved driver eligibility, request availability, and atomic acceptance (prevent double-accept race).
4. Customer OTP must be stored/validated securely (hash or equivalent), expire, limit attempts, and be scoped to customer-owned parcel; driver verification only for assigned driver.
5. Catalogue/store public reads must only expose approved stores and available items; private fields must never leak.
6. Price/offer validation must use paise integers, positive values, bounds, and authoritative server calculations. Client-supplied price fields are untrusted.
7. Multi-store checkout must be atomic or use a carefully defined transaction boundary; one store failure must not create an inconsistent partial checkout.
8. Order state transitions must be allowlisted and server-enforced; no arbitrary status updates.
9. Required schema, indexes, constraints, RLS policies, grants, and RPC tests must be reviewed together. Do not add placeholder RPCs.

## Recommended implementation sequence
A. Review existing marketplace/parcel migration history and baseline schema for reusable tables/contracts.  
B. QA-only schema parity proposal: stores, catalogue, orders, order items, quotes/counters, parcel requests, OTP/attempts, status history.  
C. Design migrations and RPCs together, then test grants/RLS and authenticated role boundaries.  
D. Playwright: customer order, partner quote, customer accept/counter, parcel customer-create, driver accept, OTP-delivery; negative tests for wrong roles, ownership, double-accept, expired OTP, attempt lock.  
E. Re-run Quality Gate, Regression, Workflow Regression, TASKO/Laundry Regression; only then update progress estimate.

**Safety:** No production schema changes, no live deployment, no merge. Payment-provider integration remains deferred.
