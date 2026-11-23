-- FRIEND RIDE ARJUNA X Phase 2 security audit (READ ONLY).
-- Run against QA first; production use is catalog-only and must not modify data.
-- No DDL, DML, secret, or user-row data is returned.

-- 1) Public table RLS coverage. No-policy tables are deny-by-default to client roles.
select
  count(*) as public_table_count,
  count(*) filter (where c.relrowsecurity) as rls_enabled_count,
  count(*) filter (where not c.relrowsecurity) as rls_disabled_count,
  count(*) filter (where c.relrowsecurity and not exists (
    select 1 from pg_policies p
    where p.schemaname=n.nspname and p.tablename=c.relname
  )) as rls_enabled_no_policy_count
from pg_class c
join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r';

-- 2) SECURITY DEFINER functions and simple source markers for manual triage.
-- Marker checks are NOT authorization proof. Review the function bodies and test
-- behavior as anon/customer/driver/partner/non-admin/admin before accepting.
select
  p.proname,
  pg_get_function_arguments(p.oid) as arguments,
  coalesce(array_to_string(p.proconfig, ', '), '(unset)') as function_settings,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
  pg_get_functiondef(p.oid) ilike '%auth.uid()%' as mentions_auth_uid,
  pg_get_functiondef(p.oid) ilike '%admin_users%' as mentions_admin_guard_table,
  exists(select 1 from pg_trigger t where t.tgfoid=p.oid and not t.tgisinternal) as is_trigger_function
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.prokind='f' and p.prosecdef
order by p.proname;

-- 3) Functions executable by anon: inspect the output columns and function body
-- for accidental PII or writes. Expected public read-only functions must be
-- owner-confirmed, not automatically accepted by this audit.
select
  p.proname,
  pg_get_function_arguments(p.oid) as arguments,
  coalesce(array_to_string(p.proconfig, ', '), '(unset)') as function_settings,
  pg_get_functiondef(p.oid) ilike '%auth.uid()%' as mentions_auth_uid,
  pg_get_functiondef(p.oid) ilike '%insert %' or
  pg_get_functiondef(p.oid) ilike '%update %' or
  pg_get_functiondef(p.oid) ilike '%delete %' as contains_write_marker
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.prosecdef
  and has_function_privilege('anon',p.oid,'EXECUTE')
order by p.proname;

-- 4) Support-feedback policy definitions (no feedback/message rows).
select tablename,policyname,cmd,roles,qual,with_check
from pg_policies
where schemaname='public' and tablename='fr_support_feedback'
order by policyname;

-- 5) Notification queue counts and active-token count (no token values).
select
  count(*) as event_rows,
  count(*) filter(where status='queued') as queued,
  count(*) filter(where status='sent') as sent,
  count(*) filter(where status='failed') as failed,
  count(*) filter(where status='skipped') as skipped,
  (select count(*) from public.fr_notification_tokens where is_active=true) as active_tokens
from public.fr_notification_events;

-- 6) Notification status CHECK constraint. The current schema does not include
-- a processing/claim state; queue concurrency design must be reviewed separately.
select conname,pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid='public.fr_notification_events'::regclass
  and conname like '%status%';
