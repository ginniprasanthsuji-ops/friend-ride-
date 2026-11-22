# Project Arjuna — Frontend RPC Migration Inventory (Static Audit)

**Branch:** `project-arjuna/dark-gold-ui-rollout`  
**Audited commit:** `4912a42773ecaf672a57a2b96c32d6fdd430c950`  
**Scope:** Static comparison of `.rpc(...)` names in `index.html` against function definitions in the 24 SQL migration files present on this branch. This is **not** proof of absence from the base Supabase schema or live database.

## Counts
- Frontend unique RPC names: **57**
- Names found as function definitions in branch migrations: **25**
- Names not found in branch migrations: **32**
- Payment-specific names among migration-missing list: **12**
- Non-payment / core workflow names among migration-missing list: **20**

## RPCs found in branch migrations (25)
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

## Payment-specific names absent from branch migrations (12)
These are excluded from the current non-payment release scope pending separate payment-provider classification/integration:
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
```

## Non-payment / core names absent from branch migrations (20)
These need base-schema/runtime verification and authenticated integration tests; do **not** treat static migration absence as proof they are missing from Supabase:
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

## Important interpretation
- A migration inventory is not a complete database function inventory. Existing functions may be defined in the baseline schema or already deployed.
- The QA snapshot in the prior status report indicated 18 frontend RPCs implemented there. This static branch-migration audit counts 25 names matching migration definitions; runtime/schema introspection is required to reconcile the difference.
- Next action: read-only QA Supabase function catalog audit, then test each core missing-from-migrations RPC with authenticated role/arguments. Do not write to production or merge/deploy.
