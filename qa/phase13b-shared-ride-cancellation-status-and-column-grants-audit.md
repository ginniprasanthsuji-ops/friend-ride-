# Phase 13B — Cancellation/Status Path and Column Grant Audit

Date: 2026-11-26. QA project read-only review.

## RPC catalog
- Shared Ride RPCs present: `fr_shared_ride_create`, `fr_shared_ride_book_seats`, `fr_shared_ride_is_passenger` only.
- No deployed Shared Ride cancellation, confirmation, refund, or status-transition RPC discovered.
- Other unrelated cancellation RPC exists for flash-sale reservation; not part of Shared Ride.

## Column-level grant findings
- `anon` has column-level INSERT, SELECT, UPDATE, REFERENCES grants across every column of all four Shared Ride tables in the catalog: rides (17 columns), bookings (13), events (7), payments (12).
- `authenticated` has column-level grants on bookings/events/payments as reported by catalog; this complements previously recorded effective table privilege findings. Table privilege and column privilege results must be interpreted together; no runtime exploit test was run.
- `service_role` has broad column privileges, expected for server-side access.
- Stage 2 ACL draft still needs dependency review; the anon grants are an urgent least-privilege issue, but no revocation was applied.

## Mutation path gap
- No deployed Shared Ride RPC currently catalogued to safely confirm/cancel/refund/change booking status or restore seats.
- Status columns and timestamps exist (`status`, passenger_completed_at, driver_boarded_at), but catalog alone cannot prove a client/UI mutation path.
- Source search in the Phase 13 branch did not locate Shared Ride runtime implementation; migration history in QA shows schema/RPC foundation was deployed. Source/build reconciliation remains open.

## Next gate
1. Identify the actual deployed client/build source and every direct table mutation.
2. Map status transition matrix and seat-restoration/rebooking rules.
3. Create controlled negative tests using disposable QA identities; do not inspect production data.
4. Re-review staged ACL revocation and rollback plan before any apply.

No SQL applied. Main/Production untouched. Phase 13B remains 70%.
