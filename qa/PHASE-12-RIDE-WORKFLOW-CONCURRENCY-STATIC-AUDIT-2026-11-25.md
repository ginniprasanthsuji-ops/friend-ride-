# Phase 12 — Ride Workflow Concurrency & Reliability Static Audit (2026-11-25)

QA project only: pqsangtvietawkfgpgfu
Read-only function-source review. No test rows queried or created. Production untouched.

## Reviewed functions

### accept_ride(p_ride_id)
- Requires authenticated approved driver.
- Rejects driver when existing ride status is non-terminal.
- Atomic conditional UPDATE claims ride only if driver_id IS NULL and status='requested'.
- Returns boolean based on affected row count.
- Positive: same ride competing acceptors should be serialized by the conditional row update; one claim succeeds.
- Risk: the active-ride pre-check and claim are separate statements without an evident per-driver lock or uniqueness constraint. Two concurrent accept requests for different rides by the same driver may both pass the pre-check and claim separate rides. Runtime race test needed.

### counter_offer_ride(p_ride_id,p_counter_fare)
- Requires approved driver and positive fare.
- Checks for existing active ride.
- Claims requested/unassigned ride by conditional update, sets counter_offered and agreed_fare.
- Same potential concurrent active-ride race across two different rides; no per-driver locking/unique active-ride guard evident in source.

### accept_counter_offer(p_ride_id)
- Requires authentication.
- Customer ownership and counter_offered state checked in conditional update.
- Conditional state update protects against stale offer acceptance; runtime replay test pending.

### decline_counter_offer(p_ride_id)
- Authenticated customer ownership and counter_offered status condition in UPDATE.
- Resets ride to requested and clears driver/agreed fare.
- Conditional update protects stale decline; runtime replay test pending.

### fr_driver_start_ride(p_ride_id)
- Approved driver required.
- Conditional transition accepted -> ongoing and assignment ownership.
- Emits customer notification after transition.
- Runtime duplicate start and unauthorized actor tests pending.

### fr_driver_complete_ride(p_ride_id)
- Approved assigned driver required.
- Conditional transition ongoing -> completed.
- Removes ride live-location rows.
- Emits completion notification.
- Runtime duplicate completion, unauthorized actor, cleanup and notification tests pending.

## Priority finding
P1 concurrency risk: concurrent accept/counter-offer calls for separate rides may permit one driver to acquire multiple active rides because the active-ride guard is a separate check from the ride claim. Static source review only; exploit/runtime behavior not confirmed. Remediation should consider transaction-level per-driver serialization or a database constraint/locking design compatible with terminal statuses. Do not implement without user approval.

## Required QA negative/concurrency tests (disposable QA accounts/data)
1. Two drivers accept the same requested ride concurrently -> exactly one success.
2. One driver accepts two distinct rides concurrently -> at most one active ride assigned.
3. One driver submits two counter-offers on separate rides concurrently -> at most one active ride.
4. Customer accepts counter-offer twice/replay -> second call fails or returns safe no-op.
5. Customer decline after acceptance/stale offer -> safe failure; no unintended state reset.
6. Wrong driver attempts start/complete -> denied.
7. Duplicate start -> no duplicate transition/notification.
8. Duplicate complete -> no duplicate transition/notification.
9. Completion clears live location and only notifies correct customer.
10. Verify all transitions and notification delivery using disposable QA data.

## Status
Static source review: complete for the functions returned.
Runtime tests: not run.
SQL changes: 0.
Production: untouched.
