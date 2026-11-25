-- PHASE 13B Stage 1 — grant capture / rollback preparation (READ-ONLY)
-- QA project only. This script is not a migration and makes no changes.
-- Run in QA before any approved ACL change; retain output for exact rollback.
SELECT table_name, grantee, privilege_type, is_grantable
FROM information_schema.table_privileges
WHERE table_schema='public'
  AND table_name IN ('fr_shared_rides','fr_shared_ride_bookings','fr_shared_ride_events','fr_shared_ride_payments')
  AND grantee IN ('anon','authenticated')
ORDER BY table_name, grantee, privilege_type;

-- Rollback must be generated from the captured output and reviewed. Do not use GRANT ALL.
-- Never restore anon access automatically; require explicit review and approved need.
