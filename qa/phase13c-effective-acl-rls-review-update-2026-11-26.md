# Phase 13C — Effective ACL/RLS Review Update (Read-only)

Date: 2026-11-26
Environment: FRIEND RIDE QA Supabase project `pqsangtvietawkfgpgfu`
Scope: Catalog-only review of ACLs, RLS policy coverage, and FORCE RLS for six tables.
No rows/data were read. No DML, DDL, privilege changes, or runtime destructive tests were performed. Main/production untouched.

## Verified RLS catalog

RLS is enabled for all six tables, but FORCE RLS is false for each:
- `profiles`
- `fr_driver_documents`
- `fr_service_provider_applications`
- `fr_service_providers`
- `fr_road_ride_guest_profiles`
- `fr_road_rides`

## Effective table grants (anon/authenticated)

Catalog confirms broad table-level grants, including:
- `profiles`: authenticated SELECT, INSERT, UPDATE, DELETE, TRUNCATE.
- `fr_driver_documents`: authenticated SELECT, INSERT, UPDATE, DELETE, TRUNCATE.
- `fr_service_provider_applications`: authenticated SELECT, INSERT, UPDATE, DELETE, TRUNCATE.
- `fr_service_providers`: authenticated SELECT, INSERT, UPDATE, DELETE, TRUNCATE.
- `fr_road_ride_guest_profiles`: anon and authenticated SELECT, INSERT, UPDATE, DELETE, TRUNCATE.
- `fr_road_rides`: anon INSERT, UPDATE, DELETE; authenticated has no direct SELECT/INSERT/UPDATE/DELETE grant shown, but does have REFERENCES/TRIGGER.

## Policy catalog observations

- `profiles`: authenticated own SELECT/UPDATE/INSERT policies; admin driver SELECT. No DELETE policy in the catalog.
- `fr_driver_documents`: owner/admin SELECT; owner pending INSERT/UPDATE; admin review UPDATE. No DELETE policy.
- `fr_service_provider_applications`: own pending INSERT, own/admin SELECT, admin UPDATE. No DELETE policy.
- `fr_service_providers`: admin ALL policy and approved/owner/admin SELECT. No owner INSERT/UPDATE/DELETE policy observed.
- `fr_road_ride_guest_profiles`: authenticated driver-own SELECT/INSERT/UPDATE. No anon policy; no DELETE policy.
- `fr_road_rides`: authenticated SELECT for LIVE, driver-owned, or passenger-authorized rows. No anon policy; no direct authenticated DML policy observed.

## Risk: TRUNCATE privilege is not constrained by row-level policies

Authenticated has table-level TRUNCATE on `profiles`, `fr_driver_documents`, `fr_service_provider_applications`, `fr_service_providers`, and `fr_road_ride_guest_profiles`. Anon has TRUNCATE on `fr_road_ride_guest_profiles` and `fr_road_rides`.

TRUNCATE is not row-level DML and RLS policies do not provide row filtering for it. This catalog grant is a high-priority least-privilege issue. It was not exercised because doing so would be destructive.

## Risk: broad anon DML grants

Anon has INSERT/UPDATE/DELETE/TRUNCATE table grants on `fr_road_ride_guest_profiles` and INSERT/UPDATE/DELETE grants on `fr_road_rides`. RLS is enabled, and no anon policies were catalogued for these tables; grants alone do not prove a successful unauthorized write. Runtime negative tests are still required using the normal anon API role.

## Priority / next actions

1. Owner/admin review and revoke unnecessary TRUNCATE grants (and unnecessary anon DML grants) in a separate approved change; do not apply from this audit.
2. Test anon insert/update/delete on guest profiles and road rides through PostgREST/API; stop if any unauthorized operation succeeds.
3. Test authenticated non-owner DELETE and owner/admin boundary for each table via safe non-destructive requests; do not test TRUNCATE against populated tables.
4. Verify cross-user ID mutation and role-change attempts.
5. Review FORCE RLS/owner bypass assumptions and SECURITY DEFINER function access separately.
6. Document evidence, then prepare a minimal least-privilege SQL proposal for explicit approval.

## Status

Catalog evidence only. Runtime negative tests pending. No database changes or production operations made.
