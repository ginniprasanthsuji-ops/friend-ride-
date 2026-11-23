-- Phase 7 — grant audit / verification SQL
-- READ-ONLY checks below. Remediation examples are comments only.
-- Do not run DDL/REVOKE until approved and verified against QA app flows.

-- 1) List effective table-level grants for authenticated.
select table_name, privilege_type
from information_schema.table_privileges
where table_schema='public' and grantee='authenticated'
order by table_name, privilege_type;

-- 2) Highlight high-risk privileges on public tables.
select table_name, privilege_type
from information_schema.table_privileges
where table_schema='public'
  and grantee='authenticated'
  and privilege_type in ('TRUNCATE','TRIGGER','REFERENCES')
order by table_name, privilege_type;

-- 3) Column grants for sensitive profile fields (adapt names to actual columns).
select column_name, privilege_type
from information_schema.column_privileges
where table_schema='public'
  and table_name='profiles'
  and grantee='authenticated'
  and column_name in (
    'role','driver_approval_status','partner_approval_status',
    'driver_aadhaar_number','driver_aadhaar_document_path',
    'driver_license_number','driving_license_number',
    'driving_license_document_path','vehicle_number','vehicle_registration'
  )
order by column_name, privilege_type;

-- 4) RLS coverage: public base tables and RLS flag.
select c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
order by c.relname;

-- 5) Policy inventory.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies where schemaname='public'
order by tablename, policyname;

-- 6) Proposed (not applied) targeted admin_users revocation:
-- revoke insert, update, delete, truncate, trigger, references
-- on table public.admin_users from authenticated;
-- Keep SELECT only if app's own-row membership check requires it and RLS
-- limits it to the current user. Validate RPC behavior before finalizing.

-- 7) Proposed (not applied) broad dangerous-grant removal:
-- revoke truncate, trigger, references on all tables in schema public
-- from authenticated;
-- Apply carefully: review default privileges, grants inherited via roles,
-- and any direct function/table workflow dependency.

-- Acceptance: queries 2 and 3 should show no sensitive direct privileges
-- after the reviewed migration, except explicitly documented exceptions.
