# Phase 13B — Constraint / Trigger Dependency Audit

Date: 2026-11-26. QA only, read-only.

## Findings
- No non-internal triggers were returned for the Shared Ride tables in the inspected catalog query.
- Live constraints: rides booked_seats bounded 0..total_seats; total seats 1..12; vehicle auto/car; price >=0; status allowlist.
- Bookings: seats 1..12; fare snapshot and total fare >=0; status allowlist; FK ride/passenger; UNIQUE(ride_id, passenger_id).
- Payments: amount >=0, status allowlist, UNIQUE(booking_id), FK booking.
- Events: FK ride/booking/actor.

## Remediation implications
- Unique ride/passenger booking key can prevent a passenger from creating a second row for the same ride after a cancelled/refunded booking; intended rebooking behavior needs decision.
- No DB trigger was found enforcing aggregate seat count or automatically restoring booked seats on cancellation/refund. Current booking RPC increments seats under row lock; cancellation/refund paths/RPCs were not found in deployed catalog.
- Constraints enforce row-level bounds but not role approval, booking status transitions, booking-to-ride seat aggregate, cutoff/departure invariants, or cancellation seat restoration.
- No SQL applied, no live rows inspected, no runtime tests.

## Gate
Map cancellation/refund/confirmation/status mutation paths and decide rebooking policy before applying ACL or status remediation. Phase 13B remains 70%.
