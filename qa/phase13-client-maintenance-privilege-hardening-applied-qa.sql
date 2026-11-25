-- Phase 13 QA-only security privilege hardening applied on 2026-11-26.
-- Verified target: dedicated FRIEND RIDE QA project pqsangtvietawkfgpgfu.
-- This revokes client TRUNCATE/MAINTAIN only; it does not delete or modify rows.
REVOKE TRUNCATE, MAINTAIN ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Applied successfully as postgres-owned public table future default privilege cleanup.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE TRUNCATE, MAINTAIN ON TABLES FROM anon, authenticated;

-- NOT APPLIED: Supabase-managed supabase_admin default ACL still includes TRUNCATE/MAINTAIN
-- for anon/authenticated. Attempt to change this default ACL returned permission denied.
-- All 39 existing public tables are postgres-owned; future probe table verified zero client grants.
