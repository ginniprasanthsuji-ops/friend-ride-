# Phase 13B — Shared Ride Participant Access Policy Review

**QA review draft only — no SQL applied.**

## Live findings
- Live QA only exposes `fr_shared_ride_is_passenger(p_ride_id)`; it returns true for any booking row for the current user on the ride, with no status filter.
- The RPC catalog query did not find deployed shared-ride contact, cancellation, or confirmation RPCs matching the reviewed patterns. Deployment/source mismatch remains to be reconciled.
- Booking participant SELECT and UPDATE RLS policies are participant-based. Events read and payments read are also participant-scoped through booking membership/helper logic.
- Shared rides SELECT allows LIVE/FULL listings, the ride's own driver, or the passenger helper. Therefore cancelled/refunded passenger membership may still grant ride/events/payment participant scope (depending on policy joins), despite cancellation/refund.

## Suggested status/access decision matrix — requires product approval
| Status | Passenger access proposal | Contact access | Live location |
|---|---|---|---|
| booking_pending | booking record only | no | no |
| confirmed | booking/ride/event/payment read | both confirmed participants | active ride only |
| boarding | read | both participants | yes, while active |
| in_progress | read | both participants | yes, while active |
| completed | history/receipt read | limited history; no new contact disclosure | no |
| cancel_requested | read own booking/status | no new contact unless driver/passenger coordination explicitly approved | no |
| cancelled | own cancellation record only; no participant privileges | no | no |
| refunded | own refund record only; no participant privileges | no | no |
| refund_pending | own refund status; participant scope should be revoked unless operational need approved | no | no |
| no_show | own dispute/history scope only | no new contact | no |
| disputed | booking/payment/dispute records needed for resolution only | case-scoped if necessary | no |

## Important caution
- This matrix is a recommendation, not a live policy or implemented behavior.
- Contact privacy requirement remains: phone numbers visible only to the specific confirmed booking's passenger and assigned driver, never public LIVE listings or other passengers.
- No contact RPC was found in this QA catalog pass; do not assume the contact-sharing requirement is implemented.
- Cancellation/refund must reconcile seat counts atomically and determine whether rebooking uses the existing row or a partial unique index over active statuses.
- Keep payment/event audit history while limiting participant access after cancellation/refund.

## Next actions
1. Locate frontend/migration source for contact, cancel, confirm, refund, and passenger completion actions; reconcile missing deployed RPCs.
2. Agree status-to-access matrix.
3. Draft least-privilege policies/RPC changes and rollback after source and dependency review.
4. Build role/status matrix tests; do not claim tests pass before execution.
