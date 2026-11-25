# Phase 13C — Shared Ride LIVE Listing & Booking ACL/RLS Review

Date: 2026-11-26
QA Supabase project: `pqsangtvietawkfgpgfu`
Mode: Read-only catalog review. No runtime/API tests.

## Shared ride listing policy
`fr_shared_rides` SELECT policy is assigned to authenticated only and permits:
- status live/full listings; OR
- own driver row; OR
- passenger participation via `fr_shared_ride_is_passenger(id)`.

The policy does not itself redact columns. Authenticated SELECT column grants include route labels/coordinates, driver_id, vehicle_type, seat totals, booked seats, fare, timestamps and status. Runtime/API payload checks must confirm which columns the app exposes in LIVE listings and ensure no passenger contact/private booking/payment fields are joined or returned.

## Booking table policy
`fr_shared_ride_bookings` participant SELECT and UPDATE policies are authenticated-only:
- passenger_id equals auth.uid(); OR
- ride's driver_id equals auth.uid().
Insert policy requires passenger_id = auth.uid().

Catalog shows authenticated SELECT privileges for booking fields including passenger_id, pickup/drop labels, seats, status, total fare and lifecycle timestamps. These fields should be returned only for a specific participant's booking. Verify the driver only sees booking records for their ride and passenger only sees their own.

## ACL/RLS mismatch flag — ANON
Information-schema column privileges show anon grants on shared ride and booking columns, including SELECT and various write/reference privileges. However, reviewed RLS policies are assigned to authenticated, with no anon policies found in this table review. This suggests anonymous role access may be blocked by RLS despite broad grants, but must be verified through API-level tests. Grants alone do not prove data access.

## SECURITY DEFINER workflow RPC catalog
`fr_shared_ride_create`:
- Requires auth.uid()
- vehicle type auto/car only
- seats 1..12
- nonnegative price
- departure future
- inserts driver_id = auth.uid().

`fr_shared_ride_book_seats`:
- Requires login
- seats 1..12
- row-locks target ride
- prevents driver booking own ride
- live/full status, future departure, cutoff checks
- seat availability check
- prevents duplicate active booking
- passenger_id set to auth.uid()
- booking and event inserted, booked_seats incremented.

Both are SECURITY DEFINER with empty search_path. Catalog shows meaningful business validation. Runtime negative/positive tests still required for race/edge conditions and role access.

## Runtime matrix pending
1. Anonymous SELECT on shared rides and bookings → deny.
2. Authenticated nonparticipant reads live ride listing → allow only safe listing data.
3. Nonparticipant direct booking-row read → deny.
4. Passenger reads own booking → allow.
5. Ride driver reads booking for their ride → allow.
6. Driver attempts to read another ride's booking → deny.
7. Passenger attempts booking passenger_id spoof → deny.
8. Driver attempts own ride booking → deny.
9. Invalid seat count, past departure, cutoff, insufficient seats, duplicate booking → reject.
10. Concurrent booking near seat limit → no overbooking.
11. Inspect API response for passenger contact, payment identifiers, private profile fields → must not be exposed on LIVE public listing.

## Conclusion
Participant-scoped RLS policies are present in catalog. Broad anon column ACL grants are a review flag; authenticated-only policies appear to provide the row gate but anonymous API behavior remains untested. No runtime tests executed. No changes, migrations, deployments or production access.
