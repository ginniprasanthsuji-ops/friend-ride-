# Phase 13D — Ride/Payment Mutation Authorization Review (2026-11-26)

## Scope
Read-only review of function definitions in QA Supabase project `pqsangtvietawkfgpgfu`. No SQL writes or QA fixture creation. Main/Production untouched.

## Reviewed mutation paths
- Ride payment create: requires authenticated customer ownership of ride, completed ride, assigned driver, valid fare and configured driver QR; row-locks ride and session; blocks confirmed/awaiting-driver-confirmation and active pending sessions; creates/reuses expired session with 15-minute expiry.
- Customer transaction submission: requires active session owned by customer; transaction ref trimmed and 1–40 characters; pending/unexpired state; moves to awaiting-driver-confirmation.
- Driver payment confirmation: requires session's driver; only awaiting-driver-confirmation can become success.
- Driver start/complete: approved-driver profile check and assigned ride ownership; only accepted→ongoing and ongoing→completed; removes live location on completion.
- Road ride booking: locks ride; rejects own ride, non-live/expired/cutoff rides and duplicate active passenger; creates booking pending and marks ride booked.
- Road ride confirmation: locks pending booking; verifies ride owner and booked ride status; confirms booking.
- Shared ride seat booking: locks ride; validates seat range, open ride, future departure/cutoff, capacity, no duplicate active passenger booking; creates pending booking and increments booked seats.
- TASKO/Laundry provider transitions: assigned provider ownership; allowed transition order and completion validation.
- Service request status update: approved provider owner only and constrained transition chain.

## Notable review item — ride creation authorization
`fr_road_ride_create` and `fr_shared_ride_create` definitions authenticate the caller and validate ride fields, but the inspected definitions do not themselves check profile role or driver approval status. The table INSERT policies observed also primarily bind `driver_id` to `auth.uid()`. This is a **potential authorization gap requiring semantic confirmation**, not yet a confirmed exploit: role-specific frontend gating, profile role constraints, other database constraints/triggers, and the intended ability for non-driver users to create rides must be checked before remediation.

## Other observations
- Shared ride booking capacity is protected with a ride row lock.
- Road ride booking uses a ride row lock and single-passenger guard.
- Payment RPCs rely on manual driver confirmation; no bank/UPI verification is implied.
- Runtime cross-account/role-denial tests remain blocked pending controlled QA identities and seeded test rides.

## Status
No confirmed defect in the reviewed mutation definitions. Ride-create role/approval check is flagged for follow-up. No migration applied, no fixtures seeded, Production/Main unchanged.
