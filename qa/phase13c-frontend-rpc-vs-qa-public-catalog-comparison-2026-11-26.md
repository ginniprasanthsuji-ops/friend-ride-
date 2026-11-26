# Phase 13C QA — Frontend RPC Reference vs QA Public Function Catalog (2026-11-26)

## Scope
Read-only comparison of frontend RPC call names extracted from QA branch `index.html` against public function-name catalog in QA Supabase project `pqsangtvietawkfgpgfu`. No database or application changes. Production/Main untouched.

## Counts
- Unique frontend RPC references extracted: 58
- Public SQL functions in QA catalog: 53
- Frontend RPC references absent from QA catalog: 33
- Catalog functions not referenced in frontend extraction: 29

## Frontend references missing from QA catalog
`fr_partner_save_payment_details`, `fr_partner_list_market_orders`, `fr_partner_update_market_order`, `fr_get_platform_business_details`, `fr_admin_save_platform_business_details`, `fr_partner_save_location`, `fr_customer_store_payment_options`, `fr_customer_place_market_order`, `get_ride_payment_details_v1`, `fr_get_ride_payment_state`, `fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_driver_confirm_ride_payment`, `fr_driver_save_payment_qr`, `fr_partner_save_catalogue_item`, `fr_partner_list_catalogue`, `fr_customer_list_partner_catalogue`, `fr_partner_quote_market_order`, `fr_customer_list_market_orders`, `fr_customer_accept_market_quote`, `fr_customer_counter_market_order`, `fr_tasko_submit_payment`, `fr_tasko_admin_verify_payment`, `fr_customer_create_parcel_request`, `fr_driver_list_parcel_requests`, `fr_driver_accept_parcel`, `fr_driver_confirm_parcel_payment`, `fr_customer_list_parcel_requests`, `fr_customer_get_parcel_delivery_otp`, `fr_driver_verify_parcel_delivery_otp`, `fr_customer_place_multi_market_order`, `fr_partner_confirm_market_payment`, `fr_customer_market_payment_details`, `fr_customer_tick_market_payment`.

## Catalog-only names (not found in frontend RPC extraction)
`fr_admin_assign_service_provider`, `fr_admin_confirm_pending_earning`, `fr_admin_post_earnings_ledger`, `fr_admin_verify_and_reward_referral`, `fr_create_notification_preferences_for_new_user`, `fr_customer_referral_admin_review`, `fr_customer_referral_get_or_create_code`, `fr_customer_referral_reward_credit`, `fr_earnings_ledger_immutable`, `fr_get_my_earnings_balance`, `fr_notification_claim_batch`, `fr_referral_apply_code`, `fr_referral_create_my_code`, `fr_road_ride_book`, `fr_road_ride_confirm_booking`, `fr_road_ride_create`, `fr_road_ride_get_participant_contact`, `fr_road_ride_is_driver`, `fr_road_ride_is_passenger`, `fr_road_ride_save_driver_profile`, `fr_road_ride_save_guest_driver_profile`, `fr_service_provider_update_request`, `fr_shared_ride_book_seats`, `fr_shared_ride_create`, `fr_shared_ride_is_passenger`, `fr_store_flash_sale_cancel_reservation`, `fr_store_flash_sale_reserve`, `is_friend_ride_admin`, `qa_guard_profile_privileged_fields`.

## Interpretation / limitation
This is a name-level catalog comparison, not proof each RPC call is reached at runtime or each missing reference fails in production. Some names may be legacy, branch-specific, schema mismatch, or exposed through a different schema; verify exact schema, grants, and runtime call paths before any repair. The QA catalog and frontend branch currently show a substantial integration mismatch. No migration or deployment recommended from this audit alone.

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.