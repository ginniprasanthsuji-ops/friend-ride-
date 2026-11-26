# Phase 13D QA — Shared Ride booking participant RLS review (2026-11-26)

## Scope and safety
- QA Supabase project only: `pqsangtvietawkfgpgfu`.
- Read-only catalog queries; no data mutations or migrations.
- Production/Main untouched.
- Runtime/authenticated-user impersonation tests were not performed.

## Findings (static catalog evidence)

### 1. Participant read isolation appears present
- `fr_shared_ride_bookings` SELECT policy permits authenticated reads when the user is the booking passenger or the driver owning the associated ride.
- `fr_shared_ride_events` SELECT policy requires the user to be the ride driver or a passenger with a booking on that ride.
- This is a static policy review only; runtime row isolation was not verified.

### 2. Passenger UPDATE policy is broad (review needed)
- `fr_shared_ride_bookings` UPDATE policy's USING and WITH CHECK predicates only establish passenger ownership OR ride-driver ownership.
- The policy does not constrain which columns a participant can change. If authenticated table UPDATE grants allow broad updates, passengers could potentially change booking fields such as status, seats, fare, ride_id, or participant identity while remaining owner-matched. This is a policy-level risk hypothesis, not confirmed exploit; table grants and runtime behavior need separate verification.
- Recommendation: revoke direct authenticated UPDATE where not needed and route state changes through guarded RPCs; if direct updates are required, use column-level grants and/or triggers that enforce immutable ownership/ride fields and allowed status transitions.

### 3. Ride-table direct update policy similarly owner-only
- `fr_shared_rides` UPDATE policy requires driver_id = auth.uid() before and after update, but does not itself constrain mutable columns or state transitions. Consider restricting direct update columns and enforcing lifecycle transitions through guarded RPCs.

### 4. Direct INSERT policies exist
- Ride INSERT requires driver_id = auth.uid().
- Booking INSERT requires passenger_id = auth.uid().
- These ownership checks are present in catalog policy definitions; required status/seat/fare rules should be enforced by RPC or constraints, not assumed from these policies.

## RPC static review
- `fr_shared_ride_create`: authenticated, vehicle allowlist auto/car, seats 1–12, nonnegative fare, future departure; inserts with auth.uid() as driver.
- `fr_shared_ride_book_seats`: authenticated, seats 1–12, prevents self-booking, requires ride status live/full, future departure, cutoff, available seats, and no active duplicate passenger booking; records booking and event.
- `fr_shared_ride_is_passenger`: SECURITY DEFINER helper checks passenger booking presence for ride ID.
- `fr_road_ride_confirm_booking`: separate Road Ride flow; pending booking and driver ownership checks, requires ride status booked, updates to confirmed and records event.

## ACL snapshot
- These listed RPCs show authenticated EXECUTE in the QA catalog ACL; anon EXECUTE was not shown.
- Runtime role tests were not performed.

## Conclusion
Participant read policies appear scoped to ride participants. The main static concern is broad direct UPDATE permission surface on bookings and rides, because the policies check row ownership but not allowed column/state changes. Confirm grants, frontend usage, and runtime tests before treating this as a vulnerability or applying changes.

## Frozen tracking
- Phase 13C: 91% frozen.
- Planning/Checklist: 88% frozen.
- Overall Audit: 12% frozen.
- Progress graph: frozen.
