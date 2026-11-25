# Phase 13B — Live Booking RPC Deep Review

Date: 2026-11-26. QA read-only.

## `fr_shared_ride_book_seats`
- Requires authenticated user; no explicit customer-role check.
- Locks ride row (`FOR UPDATE`) before seat validation and update — helps serialize booking capacity decisions.
- Rejects own-driver booking, non-open ride, past departure/cutoff, insufficient capacity, and active duplicate booking.
- Active duplicate check excludes cancelled/refunded, implying rebooking intent; however unique `(ride_id, passenger_id)` constraint still blocks a second booking row for that passenger/ride. **Logic/constraint conflict confirmed.**
- Inserts booking status `booking_pending` and immediately increments ride `booked_seats`; status/payment confirmation workflow is absent from catalog.
- Updates ride status to full/live based on booked seats and writes event.
- Returned seats_remaining is computed from pre-update locked ride row plus requested seats.

## `fr_shared_ride_create`
- Requires login; validates vehicle auto/car, seats 1–12, nonnegative price, future departure.
- Does not validate driver role or approved status; booking cutoff is accepted without checking it is future or before departure.
- Inserts ride and event.

## `fr_shared_ride_is_passenger`
- Checks existence of any booking row for passenger/ride, without status filter; cancelled/refunded rows remain matching.

## High priority dependencies
1. Decide booking_pending meaning and when seats should be reserved/released.
2. Resolve rebooking mismatch: duplicate check permits cancelled/refunded but UNIQUE constraint does not.
3. Add approved-driver and customer-role validation to reviewed remediation draft.
4. Add status-specific participant scope and cancellation/refund seat restoration via safe RPCs.
5. Validate cutoff ordering and booking status/payment flow.

No SQL applied; no live booking rows read; no runtime tests. Phase 13B remains 70%.
