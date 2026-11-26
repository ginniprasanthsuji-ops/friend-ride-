-- Read-only post-deployment check for the QA notification claim migration.
select
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='fr_notification_events' and column_name='claim_token') as claim_token_column,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='fr_notification_events' and column_name='claimed_at') as claimed_at_column,
  exists(select 1 from pg_constraint where conrelid='public.fr_notification_events'::regclass and conname='fr_notification_events_status_check' and pg_get_constraintdef(oid) ilike '%processing%') as processing_status_allowed,
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='fr_notification_claim_batch' and has_function_privilege('service_role',p.oid,'EXECUTE')) as service_role_can_claim,
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='fr_notification_claim_batch' and has_function_privilege('anon',p.oid,'EXECUTE')) as anon_can_claim,
  exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='fr_notification_claim_batch' and has_function_privilege('authenticated',p.oid,'EXECUTE')) as authenticated_can_claim;
