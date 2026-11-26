-- Phase 13C: source-to-QA module inventory and security role audit.
-- READ ONLY: catalog/table counts and privilege inspection only. Do not apply as a migration.
with requested(module,rpc_name) as (
 values
 ('core_ride','accept_counter_offer'),('core_ride','accept_ride'),('core_ride','counter_offer_ride'),('core_ride','decline_counter_offer'),('core_ride','get_driver_requests'),('core_ride','fr_customer_list_nearby_drivers'),('core_ride','fr_driver_start_ride'),('core_ride','fr_driver_complete_ride'),('core_ride','get_ride_customer_details_v2'),('core_ride','get_ride_driver_details'),
 ('payment_qr','fr_customer_create_ride_payment'),('payment_qr','fr_customer_submit_ride_transaction'),('payment_qr','fr_driver_confirm_ride_payment'),('payment_qr','fr_driver_save_payment_qr'),('payment_qr','fr_get_ride_payment_state'),('payment_qr','get_ride_payment_details_v1'),('payment_qr','fr_customer_store_payment_options'),('payment_qr','fr_customer_market_payment_details'),('payment_qr','fr_customer_tick_market_payment'),('payment_qr','fr_partner_save_payment_details'),('payment_qr','fr_partner_confirm_market_payment'),
 ('catalog_order','fr_customer_list_partner_catalogue'),('catalog_order','fr_partner_list_catalogue'),('catalog_order','fr_partner_save_catalogue_item'),('catalog_order','fr_customer_list_market_orders'),('catalog_order','fr_partner_list_market_orders'),('catalog_order','fr_partner_quote_market_order'),('catalog_order','fr_customer_counter_market_order'),('catalog_order','fr_customer_place_market_order'),('catalog_order','fr_customer_place_multi_market_order'),('catalog_order','fr_customer_accept_market_quote'),('catalog_order','fr_partner_update_market_order'),
 ('home_services','fr_customer_create_service_request'),('home_services','fr_customer_list_approved_service_providers'),('home_services','fr_service_provider_update_request'),('home_services','fr_tasko_submit_payment'),('home_services','fr_tasko_admin_verify_payment'),('home_services','fr_tasko_provider_transition'),('home_services','fr_laundry_provider_transition'),
 ('referral','fr_customer_referral_bind_code'),('referral','fr_customer_referral_get_or_create_code'),('referral','fr_customer_referral_admin_review'),('referral','fr_customer_referral_reward_credit'),('referral','fr_customer_special_day_set'),('referral','fr_direct_store_coupon_submit'),('referral','fr_direct_store_coupon_review'),
 ('flash_sale','fr_store_flash_sale_reserve'),('flash_sale','fr_store_flash_sale_cancel_reservation'),('flash_sale','fr_flash_sale_attach_order'),
 ('ers_rrs','fr_road_ride_create'),('ers_rrs','fr_road_ride_book'),('ers_rrs','fr_road_ride_confirm_booking'),('ers_rrs','fr_road_ride_get_participant_contact'),('ers_rrs','fr_shared_ride_create'),('ers_rrs','fr_shared_ride_book_seats'),('ers_rrs','fr_shared_ride_confirm_booking')
),
actual as (
 select p.proname,p.oid,pg_get_functiondef(p.oid) as def,p.prosecdef,p.proconfig
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public'
),
module_summary as (
 select r.module,count(*) expected,count(a.oid) present,
 count(*)-count(a.oid) missing,
 coalesce(string_agg(r.rpc_name,', ' order by r.rpc_name) filter(where a.oid is null),'') missing_names
 from requested r left join actual a on a.proname=r.rpc_name
 group by r.module
),
security_summary as (
 select
 (select count(*) from pg_tables where schemaname='public') public_tables,
 (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity) rls_enabled,
 (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relforcerowsecurity) force_rls,
 (select count(*) from pg_policies where schemaname='public') policies,
 (select count(*) from pg_policies where schemaname='public' and cmd in ('INSERT','UPDATE','DELETE','ALL') and roles::text[] && array['anon','authenticated','public']::text[]) client_write_policies,
 (select count(*) from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') and privilege_type in ('TRUNCATE','MAINTAIN')) client_truncate_maintain,
 (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef and (p.proconfig is null or not exists(select 1 from unnest(p.proconfig) c where c like 'search_path=%'))) definer_missing_search_path
),
admin_summary as (
 select
 (select count(*) from public.admin_users) admin_rows,
 count(*) admin_functions,
 count(*) filter(where has_function_privilege('anon',p.oid,'EXECUTE')) anon_execute,
 count(*) filter(where has_function_privilege('authenticated',p.oid,'EXECUTE')) authenticated_execute,
 count(*) filter(where pg_get_functiondef(p.oid) not ilike '%admin_users%' or (pg_get_functiondef(p.oid) not ilike '%Admin access required%' and pg_get_functiondef(p.oid) not ilike '%Admin authorization required%' and pg_get_functiondef(p.oid) not ilike '%v_admin%')) missing_guard_pattern
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'fr_admin_%'
)
select 'module_rpc_inventory' as audit_item,
 jsonb_object_agg(module,jsonb_build_object('expected',expected,'present',present,'missing',missing,'missing_names',missing_names))::text as result
from module_summary
union all
select 'security_rls',jsonb_build_object('public_tables',public_tables,'rls_enabled',rls_enabled,'force_rls',force_rls,'policies',policies,'client_write_policies',client_write_policies,'client_truncate_maintain',client_truncate_maintain,'definer_missing_search_path',definer_missing_search_path)::text from security_summary
union all
select 'admin_roles',jsonb_build_object('admin_rows',admin_rows,'admin_functions',admin_functions,'anon_execute',anon_execute,'authenticated_execute',authenticated_execute,'missing_guard_pattern',missing_guard_pattern)::text from admin_summary
union all
select 'admin_users_policy',coalesce(string_agg(policyname||'|roles='||roles::text||'|cmd='||cmd||'|using='||coalesce(qual,'')||'|check='||coalesce(with_check,''),E'\n'),'none') from pg_policies where schemaname='public' and tablename='admin_users';
