# Project Arjuna — Frontend RPC Migration Inventory & QA Snapshot

**Branch:** `project-arjuna/dark-gold-ui-rollout`  
**Static source commit:** `4912a42773ecaf672a57a2b96c32d6fdd430c950`  
**QA Supabase:** FRIEND RIDE QA (`pqsangtvietawkfgpgfu`), read-only catalog inspection performed on 2026-11-22.  
**Scope:** Frontend RPC inventory vs SQL migration definitions and read-only QA database catalog. No production changes.

## Counts
- Frontend unique RPC names: **57**
- Names found in branch migration definitions: **25**
- Names absent from branch migrations: **32**
- QA database functions found for frontend RPC names: **23** (read-only catalog query)
- QA database functions absent for frontend RPC names: **34**
- Payment-specific names absent from QA: **14** (includes 2 Tasko payment RPCs defined in branch migrations but not present in QA catalog)
- Non-payment / core workflow names absent in QA: **20**

## RPCs present in QA database (25)
```
admin_list_driver_documents
admin_review_driver_document
fr_admin_list_partner_applications
fr_admin_review_partner
admin_list_driver_applications
admin_review_driver
fr_customer_list_approved_stores_geo
fr_register_driver_partner
fr_customer_list_nearby_drivers
get_ride_driver_details
get_ride_customer_details_v2
accept_counter_offer
decline_counter_offer
get_driver_requests
fr_driver_start_ride
fr_driver_complete_ride
accept_ride
counter_offer_ride
fr_tasko_provider_transition
fr_tasko_submit_payment
fr_tasko_admin_verify_payment
fr_customer_list_approved_service_providers
fr_customer_create_service_request
fr_public_homepage_feedback
fr_laundry_provider_transition
```

## Payment-specific RPCs absent in QA (14)
These are excluded from the non-payment release scope pending separate payment-provider classification/integration:
```
fr_partner_save_payment_details
fr_customer_store_payment_options
get_ride_payment_details_v1
fr_get_ride_payment_state
fr_customer_create_ride_payment
fr_customer_submit_ride_transaction
fr_driver_confirm_ride_payment
fr_driver_save_payment_qr
fr_driver_confirm_parcel_payment
fr_partner_confirm_market_payment
fr_customer_market_payment_details
fr_customer_tick_market_payment
fr_tasko_submit_payment
fr_tasko_admin_verify_payment
```

## Non-payment / core RPCs absent in QA (20)
These remain implementation/runtime integration gaps for QA:
```
fr_partner_list_market_orders
fr_partner_update_market_order
fr_get_platform_business_details
fr_admin_save_platform_business_details
fr_partner_save_location
fr_customer_place_market_order
fr_partner_save_catalogue_item
fr_partner_list_catalogue
fr_customer_list_partner_catalogue
fr_partner_quote_market_order
fr_customer_list_market_orders
fr_customer_accept_market_quote
fr_customer_counter_market_order
fr_customer_create_parcel_request
fr_driver_list_parcel_requests
fr_driver_accept_parcel
fr_customer_list_parcel_requests
fr_customer_get_parcel_delivery_otp
fr_driver_verify_parcel_delivery_otp
fr_customer_place_multi_market_order
```

## QA schema inventory finding
Read-only public-table inventory shows the QA database currently contains 21 public tables, including rides, profiles, driver locations, service bookings/requests/providers, KYC documents, feedback, notification tables, and SOS. It does **not** currently show the marketplace/catalogue/order/parcel tables required to safely implement and test the 20 missing core RPCs. The frontend also references storage buckets; bucket names are not database tables.

## Important interpretation
- Static branch-migration definitions contain 25 of the 57 frontend RPC names. The QA database catalog currently contains **23/57**, with **34/57 absent** at runtime/catalog level. Two Tasko payment RPCs have migration definitions but are not present in the QA catalog snapshot.
- Missing core RPCs cannot be safely implemented as stubs. Their data tables, constraints, RLS, lifecycle rules, argument contracts, and authorization must be designed/verified first.
- The QA schema is incomplete for marketplace/order/parcel runtime scope; schema parity audit shows 15/15 required base tables present, but 34 required functions absent from the QA catalog. Marketplace/order/parcel tables are not in the current 21-table QA inventory. Next step is a schema parity review of relevant frontend feature contracts and migration sources, then QA-only schema/RPC/test additions. No production schema or data was touched.
- Do not merge to main or deploy. Payment-provider integration remains deferred.
