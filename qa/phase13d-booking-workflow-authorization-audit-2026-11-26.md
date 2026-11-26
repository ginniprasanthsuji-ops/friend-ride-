# Phase 13D Booking Workflow Authorization Audit — 2026-11-26

## Reviewed booking RPCs
- fr_road_ride_book
- fr_road_ride_confirm_booking
- fr_shared_ride_book_seats

## Static results
Road Ride booking:
- Auth required; ride row lock.
- Rejects driver booking own ride.
- Requires live status, future departure, cutoff not passed.
- Prevents duplicate active booking (one passenger seat).
- Creates booking_pending, moves ride status to booked, records event.
Confirmation:
- Auth required; booking row lock and pending status.
- Confirms only when caller owns driver ride and ride status booked.
- Updates status confirmed and logs event.
Shared Ride seats:
- Auth required; seats 1..12.
- Ride row lock; disallows driver self-booking.
- Requires live/full, future departure, cutoff not passed, capacity.
- Prevents duplicate active booking per passenger.
- Snapshot fare, creates pending, increments booked_seats and transitions live/full, records event.

## RLS and grants
- Road booking table: participant SELECT policy; authenticated ACL lacks INSERT/UPDATE/DELETE.
- Shared booking table: participant SELECT, passenger INSERT policy, UPDATE policy exists but authenticated ACL does not grant UPDATE; authenticated ACL includes SELECT/DELETE but no DELETE policy, so effective delete denied by RLS.
- Events are participant-readable only; no authenticated mutation policies/grants verified.
- Therefore direct update/delete mutation paths appear blocked at ACL/RLS layer.

## Gaps / tests
No cancellation RPCs found by name in catalog. Booking cancellation state transitions and seat-count decrement/ride-status reopening are not covered by these reviewed functions. Frontend may have another implementation; runtime/code review needed. No test fixtures created. Static catalog only.

## Scope
QA project only; Main/Production untouched.
