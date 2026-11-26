-- Project Arjuna QA schema-parity inventory (READ ONLY).
-- Run against QA Supabase only. No DDL/DML is performed.
with required_tables(table_name) as (
  values
    ('admin_users'),('driver_locations'),('fr_app_notifications'),('fr_bank_enquiries'),
    ('fr_driver_documents'),('fr_emergency_contacts'),('fr_push_subscriptions'),
    ('fr_ride_notifications'),('fr_ride_sos'),('fr_service_bookings'),
    ('fr_service_provider_applications'),('fr_support_feedback'),('profiles'),
    ('ride_live_locations'),('rides')
),
present_tables as (
  select table_name from information_schema.tables
  where table_schema='public' and table_type='BASE TABLE'
),
required_functions(function_name) as (
  values
    ('accept_counter_offer'),('accept_ride'),('admin_list_driver_applications'),
    ('admin_list_driver_documents'),('admin_review_driver'),('admin_review_driver_document'),
    ('counter_offer_ride'),('decline_counter_offer'),('fr_admin_list_partner_applications'),
    ('fr_admin_review_partner'),('fr_admin_save_platform_business_details'),
    ('fr_customer_accept_market_quote'),('fr_customer_counter_market_order'),
    ('fr_customer_create_parcel_request'),('fr_customer_create_ride_payment'),
    ('fr_customer_create_service_request'),('fr_customer_get_parcel_delivery_otp'),
    ('fr_customer_list_approved_service_providers'),('fr_customer_list_approved_stores_geo'),
    ('fr_customer_list_market_orders'),('fr_customer_list_nearby_drivers'),
    ('fr_customer_list_parcel_requests'),('fr_customer_list_partner_catalogue'),
    ('fr_customer_market_payment_details'),('fr_customer_place_market_order'),
    ('fr_customer_place_multi_market_order'),('fr_customer_store_payment_options'),
    ('fr_customer_submit_ride_transaction'),('fr_customer_tick_market_payment'),
    ('fr_driver_accept_parcel'),('fr_driver_complete_ride'),('fr_driver_confirm_parcel_payment'),
    ('fr_driver_confirm_ride_payment'),('fr_driver_list_parcel_requests'),
    ('fr_driver_save_payment_qr'),('fr_driver_start_ride'),('fr_driver_verify_parcel_delivery_otp'),
    ('fr_laundry_provider_transition'),('fr_partner_confirm_market_payment'),
    ('fr_partner_list_catalogue'),('fr_partner_list_market_orders'),
    ('fr_partner_quote_market_order'),('fr_partner_save_catalogue_item'),
    ('fr_partner_save_location'),('fr_partner_save_payment_details'),
    ('fr_partner_update_market_order'),('fr_public_homepage_feedback'),
    ('fr_register_driver_partner'),('fr_tasko_admin_verify_payment'),
    ('fr_tasko_provider_transition'),('fr_tasko_submit_payment'),
    ('get_driver_requests'),('get_ride_customer_details_v2'),('get_ride_driver_details'),
    ('get_ride_payment_details_v1'),('fr_get_platform_business_details'),
    ('fr_get_ride_payment_state')
)
select 'missing_required_tables' as section,
       json_agg(r.table_name order by r.table_name) as items
from required_tables r left join present_tables p using(table_name)
where p.table_name is null
union all
select 'present_required_tables',
       json_agg(r.table_name order by r.table_name)
from required_tables r join present_tables p using(table_name)
union all
select 'missing_required_functions',
       json_agg(r.function_name order by r.function_name)
from required_functions r left join information_schema.routines f
  on f.routine_schema='public' and f.routine_name=r.function_name
where f.routine_name is null
union all
select 'present_public_functions',
       json_agg(routine_name order by routine_name)
from information_schema.routines
where routine_schema='public' and routine_type='FUNCTION';
