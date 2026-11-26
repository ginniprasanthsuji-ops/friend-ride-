# Phase 13C QA — RPC Mismatch Workflow Classification (2026-11-26)

Read-only review of QA public tables, columns, and frontend RPC references. No writes, migrations, or Production/Main access.

## Classification of name-level mismatches

### A. Strong backend-schema absence indicators
QA public table catalog contains no market-order/cart/catalogue tables, and no parcel-request tables:
- Market/partner catalogue + order RPC references: `fr_partner_save_catalogue_item`, `fr_partner_list_catalogue`, `fr_customer_list_partner_catalogue`, `fr_partner_quote_market_order`, `fr_customer_list_market_orders`, `fr_customer_accept_market_quote`, `fr_customer_counter_market_order`, `fr_partner_list_market_orders`, `fr_partner_update_market_order`, `fr_customer_place_market_order`, `fr_customer_place_multi_market_order`, `fr_partner_confirm_market_payment`, `fr_customer_market_payment_details`, `fr_customer_tick_market_payment`, `fr_customer_store_payment_options`, `fr_partner_save_payment_details`, `fr_partner_save_location`, `fr_get_platform_business_details`, `fr_admin_save_platform_business_details`.
- Parcel request workflow RPC references: `fr_customer_create_parcel_request`, `fr_driver_list_parcel_requests`, `fr_driver_accept_parcel`, `fr_driver_confirm_parcel_payment`, `fr_customer_list_parcel_requests`, `fr_customer_get_parcel_delivery_otp`, `fr_driver_verify_parcel_delivery_otp`.
Catalog evidence supports missing backend table families in this QA project, but does not prove production status.

### B. Payment / QR RPC mismatch; supporting payment-related tables exist
Frontend calls `get_ride_payment_details_v1`, `fr_get_ride_payment_state`, `fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`; none appear in QA public function catalog.
However `fr_shared_ride_payments` exists with booking, amount, currency, provider, transaction ID, status, paid/released/refunded timestamps. This is a schema-level payment metadata table, not evidence the missing frontend RPCs are implemented or executable.

### C. Home-service payment RPC gap; related columns/tables present
`fr_tasko_submit_payment` and `fr_tasko_admin_verify_payment` absent from function catalog. QA `fr_service_bookings` contains payment_status, payment_reference, payment_submitted_at, payment_verified_at, payment_verified_by, final_amount, quoted_amount. Existing payment fields suggest incomplete RPC/API wiring rather than absent booking table. Runtime/authorization verification remains outstanding.

### D. Existing-name references
The 25 other frontend references in the previous comparison are present in the QA function catalog. This is only name presence—not signature/grant/behavior/runtime validation.

## Recommended next QA sequence (read-only)
1. Signature + grants comparison for the 25 present frontend RPCs.
2. Inspect definitions of service-payment transition RPCs and RLS on `fr_service_bookings`.
3. Verify frontend RPC call payload names/parameter shapes against function signatures for present functions.
4. Keep missing market/parcel and ride-payment RPC groups as blocked integration gaps pending approved design; do not create SQL drafts or apply changes without explicit authorization.

## Frozen estimates
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.
