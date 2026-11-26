# Phase 13D — Approved Driver Ride Creation Guard (2026-11-26)

## QA-only scope
Applied to dedicated QA Supabase project `pqsangtvietawkfgpgfu`. Main/Production untouched.

## Finding
Static review of `fr_road_ride_create` and `fr_shared_ride_create` found authentication/input checks but no explicit approved-driver profile check. Trigger inspection showed no triggers on the ride tables. Table constraints covered data integrity but did not enforce profile role/approval.

## Remediation
QA migration `20261126000600_phase13d_approved_driver_ride_create_guard.sql` applied:
- Both RPCs now require `auth.uid()`.
- Both require a matching `profiles` row where `role='driver'` and `driver_approval_status` (case-insensitive) is `approved`.
- Existing field validation, ride insertion, event insertion and function signatures retained.
- No ride rows or test identities seeded.

## Verification
Post-migration catalog read confirms both function definitions include the approved-driver guard, `search_path` remains empty, and authenticated EXECUTE privilege remains present. This is static/catalog verification only; role-denial and approved-driver runtime tests remain blocked pending controlled QA identities.

## Status
Potential authorization gap addressed in QA DB and migration committed to QA branch. No production/Main change. Runtime QA still required before marking fully verified.
