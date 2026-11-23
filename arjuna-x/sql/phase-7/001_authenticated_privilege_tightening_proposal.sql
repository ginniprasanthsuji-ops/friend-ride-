-- Project Arjuna X / Phase 7
-- PROPOSAL ONLY — NOT EXECUTED.
-- QA catalog audit found authenticated has TRUNCATE grants across public tables.
-- TRUNCATE is not row-filtered by RLS, so remove this grant from the client role.
-- Review table list, service workflows, and migration environment before applying.
-- No data/schema objects are dropped or changed by this proposal.

begin;

do $$
declare
  t record;
begin
  for t in
    select schemaname, tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('revoke truncate on table %I.%I from authenticated', t.schemaname, t.tablename);
    execute format('revoke trigger on table %I.%I from authenticated', t.schemaname, t.tablename);
    execute format('revoke references on table %I.%I from authenticated', t.schemaname, t.tablename);
  end loop;
end
$$;

-- Intentionally NOT revoking SELECT/INSERT/UPDATE/DELETE yet:
-- app workflows and RPCs need a table-by-table grant/RLS review first.
-- Test in disposable QA with authenticated role checks, then review before
-- applying to any shared or production database.

commit;

-- Post-apply verification (run separately after approval):
-- select table_name, privilege_type
-- from information_schema.table_privileges
-- where table_schema='public' and grantee='authenticated'
--   and privilege_type in ('TRUNCATE','TRIGGER','REFERENCES');
-- Expected: no rows.

-- Extra targeted safeguard for admin membership table:
-- authenticated clients must not directly mutate admin membership.
-- (This section is a proposal and remains unapplied.)
-- revoke insert, update, delete, truncate, trigger, references on table public.admin_users from authenticated;
