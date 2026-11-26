-- Phase 13 QA: read-only security/source-to-QA inventory assertions.
-- Safe to run against FRIEND RIDE QA only. SELECT/catalog queries only; no writes.
with t as (
  select c.oid,c.relname,c.relrowsecurity
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r'
),
f as (
  select p.oid,p.proname,pg_get_functiondef(p.oid) as def,p.prosecdef,p.proconfig
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
),
checks as (
  select 'public_table_count' key, count(*)::text value from t
  union all select 'rls_enabled_count',count(*)::text from t where relrowsecurity
  union all select 'rls_disabled_tables',coalesce(string_agg(relname,', ' order by relname),'none') from t where not relrowsecurity
  union all select 'admin_users_rows',count(*)::text from public.admin_users
  union all select 'profile_privileged_guard_trigger',count(*)::text from pg_trigger g join pg_class c on c.oid=g.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='profiles' and not g.tgisinternal and g.tgname ilike '%privileged%'
  union all select 'admin_review_rpc_guard_count',count(*)::text from f where proname in ('admin_review_driver','fr_admin_review_partner') and def ilike '%admin_users%' and def ilike '%invalid%decision%'
  union all select 'registration_rpc_guard',case when exists(select 1 from f where proname='fr_register_driver_partner' and def ilike '%auth.uid()%') and exists(select 1 from f where proname='fr_register_driver_partner' and def ilike '%role%driver%partner%') then 'present' else 'missing' end
  union all select 'shared_ride_create_approved_driver_guard',case when exists(select 1 from f where proname='fr_shared_ride_create' and def ilike '%driver_approval_status%approved%') then 'present' else 'missing' end
  union all select 'shared_ride_book_customer_guard',case when exists(select 1 from f where proname='fr_shared_ride_book_seats' and def ilike '%role%customer%') then 'present' else 'missing' end
  union all select 'shared_ride_policy_total',count(*)::text from pg_policies where schemaname='public' and tablename in ('fr_shared_ride_bookings','fr_shared_ride_events','fr_shared_ride_payments','fr_shared_rides')
  union all select 'shared_ride_direct_write_policy_count',count(*)::text from pg_policies where schemaname='public' and tablename in ('fr_shared_ride_bookings','fr_shared_ride_events','fr_shared_ride_payments','fr_shared_rides') and cmd in ('INSERT','UPDATE','DELETE')
  union all select 'shared_ride_client_write_privilege_count',count(*)::text from information_schema.table_privileges where table_schema='public' and table_name in ('fr_shared_ride_bookings','fr_shared_ride_events','fr_shared_ride_payments','fr_shared_rides') and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE')
  union all select 'shared_ride_confirm_assigned_driver_guard',case when exists(select 1 from f where proname='fr_shared_ride_confirm_booking' and def ilike '%driver_id%auth.uid%') then 'present' else 'missing' end
  union all select 'shared_ride_contact_participant_guard',case when exists(select 1 from f where proname='fr_shared_ride_get_booking_contacts' and def ilike '%v_uid%v_driver_id%' and def ilike '%v_uid%v_booking.passenger_id%') then 'present' else 'missing' end
  union all select 'shared_ride_confirmation_contact_rpc_missing',coalesce(string_agg(expected.name,', ' order by expected.name),'none') from (values ('fr_shared_ride_confirm_booking'),('fr_shared_ride_get_booking_contacts'),('fr_shared_ride_cancel_booking')) expected(name) left join f on f.proname=expected.name where f.proname is null
  union all select 'security_definer_missing_fixed_search_path',count(*)::text from f where prosecdef and not exists(select 1 from unnest(coalesce(proconfig,array[]::text[])) cfg where cfg like 'search_path=%')
  union all select 'shared_ride_direct_write_policies',coalesce(string_agg(policyname,', ' order by policyname),'none') from pg_policies where schemaname='public' and tablename like 'fr_shared_ride%' and cmd in ('INSERT','UPDATE','DELETE')
  union all select 'shared_ride_client_write_grants',count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name like 'fr_shared_ride%' and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE')
  union all select 'public_client_truncate_grants',count(*)::text from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') and privilege_type='TRUNCATE'
  union all select 'public_client_maintain_grants',count(*)::text from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') and privilege_type='MAINTAIN'
  union all select 'public_client_truncate_maintain_grant_tables',coalesce(string_agg(distinct table_name,', ' order by table_name),'none') from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') and privilege_type in ('TRUNCATE','MAINTAIN')
  union all select 'postgres_default_client_truncate_maintain_grants',count(*)::text from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace cross join lateral aclexplode(d.defaclacl) a join pg_roles r on r.oid=a.grantee where n.nspname='public' and d.defaclobjtype='r' and pg_get_userbyid(d.defaclrole)='postgres' and r.rolname in ('anon','authenticated') and a.privilege_type in ('TRUNCATE','MAINTAIN')
  union all select 'supabase_admin_default_client_truncate_maintain_grants',count(*)::text from pg_default_acl d join pg_namespace n on n.oid=d.defaclnamespace cross join lateral aclexplode(d.defaclacl) a join pg_roles r on r.oid=a.grantee where n.nspname='public' and d.defaclobjtype='r' and pg_get_userbyid(d.defaclrole)='supabase_admin' and r.rolname in ('anon','authenticated') and a.privilege_type in ('TRUNCATE','MAINTAIN')
  union all select 'public_truncate_grant_tables',coalesce(string_agg(distinct table_name,', ' order by table_name),'none') from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') and privilege_type='TRUNCATE'
  union all select 'core_ride_rpc_present',coalesce(string_agg(proname,', ' order by proname),'none') from f where proname in ('accept_ride','counter_offer_ride','accept_counter_offer','decline_counter_offer','get_driver_requests','fr_driver_start_ride','fr_driver_complete_ride')
  union all select 'ride_payment_qr_rpc_missing',coalesce(string_agg(expected.name,', ' order by expected.name),'none') from (values ('get_ride_payment_details_v1'),('fr_get_ride_payment_state'),('fr_customer_create_ride_payment'),('fr_customer_submit_ride_transaction'),('fr_driver_confirm_ride_payment'),('fr_driver_save_payment_qr')) expected(name) left join f on f.proname=expected.name where f.proname is null
  union all select 'catalogue_order_tables',coalesce(string_agg(tablename,', ' order by tablename),'none') from pg_tables where schemaname='public' and (tablename ilike '%market_order%' or tablename ilike '%catalogue%' or tablename ilike '%catalog%' or tablename ilike '%cart%')
  union all select 'catalogue_order_rpc_missing',coalesce(string_agg(expected.name,', ' order by expected.name),'none') from (values ('fr_partner_save_catalogue_item'),('fr_partner_list_catalogue'),('fr_customer_list_partner_catalogue'),('fr_customer_place_market_order'),('fr_customer_place_multi_market_order'),('fr_customer_list_market_orders'),('fr_customer_accept_market_quote'),('fr_customer_counter_market_order'),('fr_partner_list_market_orders'),('fr_partner_quote_market_order'),('fr_partner_update_market_order')) expected(name) left join f on f.proname=expected.name where f.proname is null
  union all select 'home_service_tables',coalesce(string_agg(tablename,', ' order by tablename),'none') from pg_tables where schemaname='public' and tablename ilike '%service%'
  union all select 'tasko_payment_rpc_missing',coalesce(string_agg(expected.name,', ' order by expected.name),'none') from (values ('fr_tasko_submit_payment'),('fr_tasko_admin_verify_payment')) expected(name) left join f on f.proname=expected.name where f.proname is null
  union all select 'referral_tables',coalesce(string_agg(tablename,', ' order by tablename),'none') from pg_tables where schemaname='public' and tablename ilike '%referral%'
  union all select 'referral_rpc_present',coalesce(string_agg(proname,', ' order by proname),'none') from f where proname ilike '%referral%'
  union all select 'flash_sale_tables',coalesce(string_agg(tablename,', ' order by tablename),'none') from pg_tables where schemaname='public' and (tablename ilike '%campaign%' or tablename ilike '%flash%')
  union all select 'flash_sale_rpc_present',coalesce(string_agg(proname,', ' order by proname),'none') from f where proname ilike '%flash_sale%'
  union all select 'ers_rrs_tables',coalesce(string_agg(tablename,', ' order by tablename),'none') from pg_tables where schemaname='public' and tablename ilike '%road_ride%'
  union all select 'ers_rrs_rpc_present',coalesce(string_agg(proname,', ' order by proname),'none') from f where proname ilike '%road_ride%'
  union all select 'ers_rrs_create_role_guard',case when exists(select 1 from f where proname='fr_road_ride_create' and def ilike '%public.profiles%' and def ilike '%driver_approval_status%' and def ilike '%fr_road_ride_guest_profiles%') then 'present' else 'missing' end
  union all select 'ers_rrs_book_customer_guard',case when exists(select 1 from f where proname='fr_road_ride_book' and def ilike '%p.role=''customer''%') then 'present' else 'missing' end
  union all select 'ers_rrs_confirm_eligible_owner_guard',case when exists(select 1 from f where proname='fr_road_ride_confirm_booking' and def ilike '%public.profiles%' and def ilike '%driver_approval_status%' and def ilike '%fr_road_ride_guest_profiles%') then 'present' else 'missing' end
  union all select 'ers_rrs_guest_profile_customer_guard',case when exists(select 1 from f where proname='fr_road_ride_save_guest_driver_profile' and def ilike '%p.role=''customer''%') then 'present' else 'missing' end
  union all select 'ers_rrs_contact_role_and_driver_guard',case when exists(select 1 from f where proname='fr_road_ride_get_participant_contact' and def ilike '%p.role=''customer''%' and def ilike '%driver_approval_status%') then 'present' else 'missing' end
  union all select 'ers_rrs_rebooking_cancelled_refunded_reuse',case when exists(select 1 from f where proname='fr_road_ride_book' and def ilike '%update public.fr_road_ride_bookings%' and def ilike '%booking_pending%') then 'present' else 'missing' end
  union all select 'ers_rrs_direct_write_policy_count',count(*)::text from pg_policies where schemaname='public' and tablename in ('fr_road_rides','fr_road_ride_bookings','fr_road_ride_events','fr_road_ride_guest_profiles') and cmd in ('INSERT','UPDATE','DELETE')
  union all select 'ers_rrs_client_write_privilege_count',count(*)::text from information_schema.role_table_grants where table_schema='public' and table_name in ('fr_road_rides','fr_road_ride_bookings','fr_road_ride_events','fr_road_ride_guest_profiles') and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE')
  union all select 'ers_rrs_ride_passenger_unique_constraint',case when exists(select 1 from pg_constraint where conrelid='public.fr_road_ride_bookings'::regclass and conname='fr_road_ride_bookings_ride_id_passenger_id_key') then 'present' else 'missing' end
  union all select 'max_applied_migration',coalesce(max(version),'none') from supabase_migrations.schema_migrations
)
select key,value from checks order by key;
