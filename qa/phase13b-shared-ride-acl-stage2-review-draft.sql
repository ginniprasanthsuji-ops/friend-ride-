-- Phase 13B Stage 2 ACL remediation review draft. NOT APPLIED.
-- QA project only. Review application/RPC dependencies and rollback before executing.
-- Scope: all 4 Shared Ride tables. Remove anon table privileges; remove authenticated TRUNCATE.
-- Events/payments: direct authenticated DML revoked (read-only participant policies are intended).
-- Rides/bookings authenticated direct DML deliberately preserved pending dependency review.

REVOKE ALL PRIVILEGES ON TABLE public.fr_shared_rides, public.fr_shared_ride_bookings, public.fr_shared_ride_events, public.fr_shared_ride_payments FROM anon;
REVOKE TRUNCATE ON TABLE public.fr_shared_rides, public.fr_shared_ride_bookings, public.fr_shared_ride_events, public.fr_shared_ride_payments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.fr_shared_ride_events, public.fr_shared_ride_payments FROM authenticated;

-- Validation after approved application (not run):
-- 1. Capture grants for anon/authenticated/PUBLIC, including column grants and inherited grants.
-- 2. Verify authenticated SELECT retained on all four tables with RLS.
-- 3. Verify event/payment writes occur only through trusted RPCs/service paths.
-- 4. Test anon denial; participant SELECT; nonparticipant denial; RPC workflows.
-- 5. Confirm rollback SQL and restore prior grants only if dependency validated.
-- This file contains statements only; do not apply until explicit approval.
