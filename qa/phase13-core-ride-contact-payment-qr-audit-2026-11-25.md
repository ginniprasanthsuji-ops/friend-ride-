# Phase 13 — Core Ride / Contact / Payment / QR Audit (2026-11-25)

Scope: dedicated FRIEND RIDE QA Supabase project and QA branch source only. Production/Main untouched.
Planning/checklist 88%, overall audit 12%, progress graph remain frozen.

## Verified working controls (static/database review)
- `fr_driver_start_ride` and `fr_driver_complete_ride` require an approved driver and the assigned ride; completion removes live-location rows.
- `get_ride_driver_details` returns driver data only to the assigned customer for eligible ride states.
- `get_ride_customer_details_v2` returns customer details only to the assigned driver for eligible ride states.
- RRS (`fr_road_rides`) direct SELECT is revoked for authenticated users; `fr_road_rides_public` exists and omits phone, photo path, and registration. Column SELECT checks for those fields are false.
- `fr_road_ride_get_participant_contact` exists and gates phone contact on a confirmed/later booking state and participant identity.
- Public table RLS inventory: **39/39 public tables have RLS enabled**.

## P1 / release-blocking findings
1. **Shared-ride booking mutation is too broad.** The current passenger/driver UPDATE policy permits updates when the participant identity remains valid, but does not restrict columns/status transitions. Static policy review shows a passenger can attempt to self-confirm or alter ride ID, seats, and fare snapshots. No SQL exploit test was run; transaction test execution was blocked by safety checks.
2. **Live-location UPDATE check is incomplete.** The existing policy checks participant access on the old row, but its `WITH CHECK` only requires `user_id=auth.uid()`; it does not revalidate participation in the new ride ID. Cross-ride reassignment is a static risk, not dynamically proven.
3. **Shared-ride creation lacks role/approval validation.** The current `fr_shared_ride_create` RPC only checks login and input values. Direct `fr_shared_rides` INSERT/UPDATE policies also remain. The QA hardening draft adds approved-driver checks and RPC-only writes, but is not applied.
4. **Shared-ride booking lacks customer-role validation.** Current `fr_shared_ride_book_seats` checks login, ride state, seats, and duplicate booking, but not `profiles.role='customer'`. A direct booking INSERT policy is also present.
5. **Shared-ride confirmation/contact flow is incomplete.** `fr_shared_ride_confirm_booking` and `fr_shared_ride_get_participant_contact` are absent in QA. The existing QA draft defines driver confirmation and contact RPCs, but is not applied. The requirement that driver/passenger phone numbers appear only for the specific confirmed booking is not certified.
6. **Main ride QR/payment backend is missing in QA.** `get_ride_payment_details_v1(uuid)` does not exist. The frontend calls it, but the database has no matching RPC. The `rides` table has no QR/payment fields.
7. **Ride completion does not confirm payment.** `fr_driver_complete_ride` completes the ride and its notification text explicitly says payment-provider integration is deferred. No completed-ride QR/payment confirmation was verified.
8. **Shared-ride payment flow is incomplete.** `fr_shared_ride_payments` has payment status fields and participant SELECT policy, but no payment write/confirmation RPC was found in QA.

## RRS (Road Ride Share) status
- Safe listing view and restricted direct table SELECT are present in QA.
- Participant-contact RPC exists, but driver phone verification is not checked inside the contact RPC; phone verification policy needs review.
- `fr_road_ride_create` and `fr_road_ride_confirm_booking` are authenticated/owner-oriented, but do not enforce approved-driver role in the current function definitions. Guest-driver intent makes this a design-policy question; no fix is applied without confirming the intended guest/registered-driver rule.

## Draft SQL reviewed, not applied
- `qa/phase13-shared-ride-contact-privacy-confirmation.sql`
- `qa/phase13-rrs-contact-privacy-and-confirmation.sql`
These are QA-only drafts. No SQL mutation was applied in this ride/contact/payment review.

## Test limitation
An attempted transaction-only RLS mutation test was blocked by tool safety checks. Therefore the broad-update/location findings are static policy findings; no exploit was executed. No PASS is claimed for ride booking, contact, payment, or QR.

## Release gate
**BLOCKED / NOT CERTIFIED.** Production remains untouched.
