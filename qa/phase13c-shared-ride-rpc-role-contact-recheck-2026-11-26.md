# Phase 13C QA — Shared Ride RPC Guard and Participant Contact Recheck (2026-11-26)

## Scope
Read-only inspection of RPC definitions in QA Supabase project `pqsangtvietawkfgpgfu`. No database changes. QA branch only; Production/Main untouched.

## Verified findings
- `fr_road_ride_create`: requires authenticated session and validates labels, fare, future departure, and radius. It does **not** enforce a driver role or driver approval.
- `fr_road_ride_book`: requires authenticated session and prevents own-ride booking, unavailable rides, past departures, cutoff violations, and duplicate active booking. It does **not** enforce Customer role.
- `fr_road_ride_confirm_booking`: owner-only confirmation guard is present and requires booking pending + ride booked.
- `fr_road_ride_get_participant_contact`: login required; confirmed participant checks restrict contact access. Driver-side contact query is ordered newest-first but returns only one passenger (`LIMIT 1`), so it does not support listing all confirmed passengers for a ride.
- `fr_road_ride_save_driver_profile`: checks ride ownership and validates photo path's first folder segment against authenticated UID.
- `fr_road_ride_save_guest_driver_profile`: requires login, 10-digit phone, name, registration, and own-UID photo path.

## Blockers / follow-up
1. Role/approval enforcement for ride creation must be reviewed and tested before release.
2. Booking RPC must enforce Customer-role authorization, not merely authenticated session.
3. Contact RPC should return all eligible confirmed passengers to the ride owner if multi-passenger contact coordination is intended; currently only newest contact is returned. Validate privacy behavior with runtime role-based tests.
4. No live runtime tests performed; findings are metadata/function-definition inspection only.

## Frozen progress
Phase 13C remains 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.