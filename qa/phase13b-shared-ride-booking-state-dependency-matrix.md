# Phase 13B — Booking State & Dependency Matrix

Date: 2026-11-26. QA catalog read-only review.

## Existing schema states
- Booking statuses are constrained by an allowlist (catalog audit previously reviewed); deployed booking RPC creates `booking_pending`.
- Payment table default is `awaiting_payment`; fields include `paid_at`, `released_at`, `refunded_at`.
- Booking table has completion timestamps `passenger_completed_at`, `driver_boarded_at`.
- No deployed Shared Ride confirm/cancel/refund/status-transition RPC was found in current catalog.
- No non-internal triggers on Shared Ride tables were found in prior catalog review.

## Proposed lifecycle (design only; not applied)
1. `booking_pending`: created by seat booking; seats reservation is counted immediately. Needs timeout/cancel path to release seats.
2. `confirmed`: transition only after explicit driver/booking confirmation policy and payment policy are satisfied; keep seats reserved.
3. `boarding` / `in_progress`: participant contact visibility allowed only for assigned driver + booking passenger, as previously scoped.
4. `completed`: terminal booking; contact access denied; payment settlement/release policy handled only through verified ledger/payment flow.
5. `cancelled` / `refunded` / `no_show` / `disputed`: terminal or restricted states; contact denied. Seat restoration must be idempotent and transactionally coupled to state transition. Refund handling must not infer payment or initiate external payment actions.

## Dependency and remediation ordering
A. Before status-transition RPC design, define payment/confirmation semantics and whether `booking_pending` reserves seats (current behavior: yes).
B. Resolve rebooking: either replace UNIQUE `(ride_id, passenger_id)` with a partial uniqueness rule for active statuses, or reuse/reactivate an existing booking row with audited status transitions. Do not remove constraint without migration and data/compatibility review.
C. Draft status-transition RPCs using row locks on ride and booking; validate actor/role; enforce state transition allowlist; update seat counts exactly once; write event atomically; reject repeated/terminal transitions.
D. Add approved-driver guard for ride creation and customer-role guard for booking only after profile role/status schema and trusted approval source are verified.
E. Only then map direct DML grants and finalize ACL remediation; avoid revoking paths required by app until runtime dependencies are reconciled.
F. Runtime tests on isolated QA fixtures: concurrent seat booking, pending timeout/cancel, repeated cancel, rebook after cancel, wrong actor, unapproved driver, role mismatch, state/contact visibility across every status.

## Verified facts vs open decisions
- Verified: booking RPC reserves seats immediately for `booking_pending`; payment schema includes payment lifecycle timestamps/status; no Shared Ride status/cancel/refund RPC currently discovered; no triggers discovered in previous audit.
- Open: booking confirmation actor/policy, payment requirement, timeout duration, refund semantics, whether seats are reserved before confirmation, no-show policy, and how active booking uniqueness should be modeled.

No SQL applied; no runtime tests; no rows inspected. Phase 13B remains 70%.
