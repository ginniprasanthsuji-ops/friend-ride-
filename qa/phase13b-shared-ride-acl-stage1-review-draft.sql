-- PHASE 13B — STAGE 1 ACL REVIEW DRAFT ONLY
-- Do NOT apply without explicit user authorization and QA rollback plan.
-- Live QA catalog review (2026-11-26): broad anon grants on four Shared Ride tables;
-- authenticated TRUNCATE grants present. RLS does not protect TRUNCATE.
-- This intentionally conservative stage removes anonymous table access and TRUNCATE,
-- but leaves authenticated INSERT/UPDATE/DELETE grants untouched pending app-write-path audit.
-- Not a migration; not executed.

BEGIN;

REVOKE ALL PRIVILEGES ON TABLE
  public.fr_shared_rides,
  public.fr_shared_ride_bookings,
  public.fr_shared_ride_events,
  public.fr_shared_ride_payments
FROM anon;

REVOKE TRUNCATE ON TABLE
  public.fr_shared_rides,
  public.fr_shared_ride_bookings,
  public.fr_shared_ride_events,
  public.fr_shared_ride_payments
FROM authenticated;

-- Preserve authenticated SELECT grants and existing RLS policies.
-- Do not yet revoke authenticated INSERT/UPDATE/DELETE: frontend and RPC dependency
-- inventory must be completed first to avoid breaking current workflows.
COMMIT;

-- QA validation required before/after authorized application:
-- 1) Confirm anon has no table privileges on these four tables.
-- 2) Confirm authenticated has no TRUNCATE on these tables.
-- 3) Confirm authenticated SELECT and participant RLS remain unchanged.
-- 4) Test live ride listing and participant booking/event/payment reads.
-- 5) Test direct anon access denied, direct TRUNCATE denied (do not execute destructive test;
--    inspect ACL and use a safe isolated test table for behavioral test).
-- 6) Regression test role identities and write workflows separately before Stage 2.
-- Rollback plan: capture exact pre-change grants first; restore only those captured grants
-- after reviewing the rollback, not by blanket GRANT ALL.
