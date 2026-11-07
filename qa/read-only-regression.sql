-- FRIEND RIDE YF Test 1–15: READ-ONLY production schema regression checks.
-- Safe to run in Supabase SQL Editor. No INSERT/UPDATE/DELETE/DDL is performed.

with expected_tables(table_name) as (
  values
    ('profiles'),('rides'),('driver_locations'),('ride_offers'),
    ('fr_market_orders'),('fr_market_order_items'),('fr_partner_catalogue_items'),
    ('fr_parcel_orders'),('fr_service_requests'),('fr_service_providers'),
    ('fr_push_subscriptions'),('fr_ride_notifications'),('fr_ride_tracking')
),
table_checks as (
  select
    'TABLE ' || e.table_name as check_name,
    case when c.oid is null then 'FAIL'
         when c.relrowsecurity then 'PASS'
         else 'FAIL' end as status,
    case when c.oid is null then 'Table missing'
         when c.relrowsecurity then 'Table exists; RLS enabled'
         else 'Table exists but RLS is disabled' end as details
  from expected_tables e
  left join pg_class c on c.relname=e.table_name
  left join pg_namespace n on n.oid=c.relnamespace and n.nspname='public'
  where c.oid is null or n.oid is not null
),
expected_functions(function_name) as (
  values
    ('fr_customer_list_approved_stores'),
    ('fr_customer_list_partner_catalogue'),
    ('fr_customer_place_multi_market_order'),
    ('fr_customer_create_parcel_request'),
    ('fr_driver_accept_parcel'),
    ('fr_driver_verify_parcel_delivery_otp'),
    ('fr_customer_create_service_request'),
    ('fr_admin_assign_service_provider'),
    ('fr_service_provider_update_request'),
    ('fr_customer_list_approved_service_providers'),
    ('fr_get_push_runtime_config'),
    ('fr_push_notification_webhook')
),
function_checks as (
  select
    'FUNCTION ' || e.function_name as check_name,
    case when p.oid is null then 'FAIL' else 'PASS' end as status,
    case when p.oid is null then 'Function missing from public schema'
         else 'Function exists; execution/auth not invoked by this read-only audit' end as details
  from expected_functions e
  left join pg_proc p on p.proname=e.function_name
  left join pg_namespace n on n.oid=p.pronamespace and n.nspname='public'
  where p.oid is null or n.oid is not null
),
medical_test as (
  select
    'Medical test partner cleanup' as check_name,
    case when count(*)=0 then 'PASS' else 'REVIEW' end as status,
    count(*)::text || ' matching test profile(s) remain' as details
  from public.profiles
  where lower(coalesce(business_name,''))='medi medical store'
)
, expected_private_buckets(bucket_id) as (
  values ('driver-kyc-documents'),('driver-profile-photos'),('partner-profile-photos')
), bucket_checks as (
  select 'PRIVATE STORAGE '||e.bucket_id as check_name,
    case when b.id is null then 'FAIL' when b.public=false then 'PASS' else 'FAIL' end as status,
    case when b.id is null then 'Bucket missing' when b.public=false then 'Private bucket exists' else 'Bucket is public; KYC data exposure risk' end as details
  from expected_private_buckets e left join storage.buckets b on b.id=e.bucket_id
), expected_policies(policyname) as (
  values ('Drivers upload own KYC documents'),('Drivers read own KYC documents'),
    ('Drivers upload own profile photo'),('Admins read driver profile photos'),
    ('Partner upload own profile photo'),('Partner read own profile photo')
), policy_checks as (
  select 'STORAGE POLICY '||e.policyname as check_name,
    case when p.policyname is null then 'FAIL' else 'PASS' end as status,
    case when p.policyname is null then 'Required storage policy missing' else 'Policy exists; runtime auth not exercised' end as details
  from expected_policies e left join pg_policies p
    on p.schemaname='storage' and p.tablename='objects' and p.policyname=e.policyname
)

select * from table_checks
union all select * from function_checks
union all select * from medical_test
union all select * from bucket_checks
union all select * from policy_checks
order by check_name;
