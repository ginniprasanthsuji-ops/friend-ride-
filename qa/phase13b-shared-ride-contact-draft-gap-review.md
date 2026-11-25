# Phase 13B — Shared Ride Contact Draft Gap Review

Read-only source and live-QA audit; no SQL changes.

## Newly located QA draft
`qa/phase13-shared-ride-contact-privacy-confirmation.sql` contains proposed Shared Ride contact RPC:
- `fr_shared_ride_get_participant_contact(p_booking_id uuid)`
- Requires login, loads booking by id, allows contact only for booking status `confirmed`, `boarding`, `in_progress`, `completed`, or `disputed`.
- Passenger gets driver contact; assigned driver gets booking passenger contact; other users raise an exception.
- Draft revokes PUBLIC/anon and grants authenticated EXECUTE.

## Live QA status
Read-only RPC catalog query returned no rows for:
- `fr_shared_ride_confirm_booking`
- `fr_shared_ride_cancel_booking`
- `fr_shared_ride_get_participant_contact`
Therefore draft is not deployed in QA as these functions.

## Gap / recommendation
- Contact after `completed` or `disputed` is broader than pickup coordination requires. Recommended contact disclosure statuses: `confirmed`, `boarding`, `in_progress` only. Completed should expose history/receipt; disputed should expose case-scoped records, not new phone disclosure.
- The draft contact function does not explicitly require driver phone verification; product rule should be clarified and enforced if required.
- Role checks are present on returned profiles (driver/customer), but approved-driver status/phone verification must be considered for the assigned driver.
- Function loads booking by ID and then checks passenger or assigned driver, which is booking-scoped. Negative tests still required: anonymous, unrelated passenger, wrong driver, cancelled/refunded, pending, completed, disputed.
- No test invocation of this draft function or real phone data was performed.

## Conclusion
There is a source-level contact draft, but live QA lacks the contact/confirm/cancel RPCs. The draft has a status-scope gap and verification-policy question; do not apply until corrected and dependency review completed.

## Next
Revise a QA-only draft with active-contact status allowlist, verify booking/ride participant ownership, role and driver-verification policy, least-privilege EXECUTE/table ACLs, and build an isolated negative authorization matrix. No production/main changes.
