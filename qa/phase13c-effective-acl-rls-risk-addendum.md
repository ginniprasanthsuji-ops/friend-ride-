# Phase 13C — Effective ACL / RLS Catalog Risk Addendum

Date: 2026-11-26
Environment: QA Supabase project `pqsangtvietawkfgpgfu`
Mode: Read-only catalog queries only. No rows/data read. No SQL writes. Main/Production untouched.

## Tables reviewed
`profiles`, `fr_driver_documents`, `fr_service_provider_applications`, `fr_service_providers`, `fr_road_ride_guest_profiles`, `fr_road_rides`.

RLS enabled on all six reviewed tables (catalog `relrowsecurity=true`). FORCE RLS is false for all six (`relforcerowsecurity=false`).

## Effective privilege findings from QA catalog
- `profiles`: authenticated has table SELECT/INSERT/UPDATE/DELETE/TRUNCATE privileges. Policies were catalogued previously; DELETE and TRUNCATE are high-impact privileges that need runtime/policy reconciliation and least-privilege review.
- `fr_driver_documents`: authenticated has SELECT/INSERT/UPDATE/DELETE/TRUNCATE privileges; policies include owner/admin SELECT, owner pending INSERT/UPDATE, admin review UPDATE. DELETE/TRUNCATE policy coverage must be checked (RLS policy catalog showed no DELETE policy).
- `fr_service_provider_applications`: authenticated has SELECT/INSERT/UPDATE/DELETE/TRUNCATE; policy catalog shows own pending INSERT, own/admin SELECT, admin UPDATE. DELETE/TRUNCATE policy coverage must be reconciled.
- `fr_service_providers`: authenticated has SELECT/INSERT/UPDATE/DELETE/TRUNCATE; policies include admin ALL and approved/owner/admin SELECT. Review how broad table grants intersect RLS; runtime non-admin DML denial tests pending.
- `fr_road_ride_guest_profiles`: anon and authenticated have SELECT/INSERT/UPDATE/DELETE privileges; RLS enabled, catalog policies only authenticated driver-own SELECT/INSERT/UPDATE were observed. Anonymous direct access and authenticated DELETE/TRUNCATE behavior require explicit runtime tests.
- `fr_road_rides`: anon has INSERT/UPDATE/DELETE privileges; authenticated has SELECT but not direct INSERT/UPDATE/DELETE, with TRUNCATE privilege present. RLS enabled. Anonymous DML privilege presence is a risk requiring policy/ACL runtime validation, not proof of successful operation.

## Risk interpretation
RLS being enabled does not itself establish a safe boundary. Broad table-level grants (especially DELETE/TRUNCATE, anon DML, and tables holding documents/photos) should be reviewed against the actual policies and effective runtime role. No exploitability conclusion is made because no API/client runtime requests were executed.

## Priority runtime cases
1. Anonymous direct INSERT/UPDATE/DELETE on `fr_road_ride_guest_profiles` and `fr_road_rides` must fail.
2. Authenticated non-owner DELETE/TRUNCATE attempts against profiles, documents, provider applications/providers, and guest profiles must fail or be unavailable through the client/API.
3. Authenticated non-admin document/application/provider DML must be rejected outside explicit owner-pending insert/update workflows.
4. Check role changes and cross-owner ID mutation.
5. Validate RPC and PostgREST access using normal client roles, not SQL owner.
6. Stop testing if any unauthorized operation succeeds; capture redacted evidence only.

## Status
This is a catalog risk addendum. Runtime negative tests remain pending. No privileges, policies, or data were modified.
