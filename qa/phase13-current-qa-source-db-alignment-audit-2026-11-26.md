# Phase 13 — Current QA Source/Database Alignment Audit (2026-11-26)

**Scope:** Read-only review of the QA branch and dedicated FRIEND RIDE QA Supabase project. Production/main were not touched. No SQL migrations were applied. Planning/checklist 88%, overall audit estimate 12%, and progress graph remain frozen.

## Access verified
- GitHub source is available on `arjuna-x/phase-13-feature-audit`; branch head at audit start: `1f03edf065782da647105698d9082c448f7cf5df`.
- Dedicated QA Supabase project `pqsangtvietawkfgpgfu` is ACTIVE_HEALTHY.
- QA public schema currently has 39 base tables; 39/39 have RLS enabled.
- Recorded QA migration history currently ends at `20261125182631`. Later branch migration files exist and are not recorded as applied; do not infer their effects are live.
- No CI statuses were returned for the inspected branch-head commit. Runtime tests were not executed.

## Security/admin checks verified
- `fr_register_driver_partner` requires an authenticated OTP session, restricts registration to driver/partner, locks the existing profile, requires its current role to be customer, validates role-specific fields, and sets approval to pending.
- `qa_guard_profile_privileged_fields` trigger is installed on `profiles` to protect role/approval fields against ordinary updates.
- `admin_review_driver` and `fr_admin_review_partner` both require `admin_users` membership and validate decisions.
- Core ride accept/start/complete functions require an approved driver and assigned/available ride checks.
- `get_ride_driver_details` and `get_ride_customer_details_v2` limit contact details to the assigned counterpart and permitted ride states.
- RRS road-ride confirmation requires the ride owner and a pending booking on a booked ride. Participant-contact RPC gates contact disclosure on confirmed/later booking states and participant identity.
- These are static/database checks only; no role-authenticated runtime tests were executed.

## Confirmed security gaps (not fixed)
### P1 — Shared-ride creation/booking RPC role validation
- `fr_shared_ride_create` checks login, input bounds and future departure, but does **not** check that caller is an approved driver.
- `fr_shared_ride_book_seats` checks login, seat availability, ride state and duplicate booking, but does **not** require caller role customer.
- Both are SECURITY DEFINER RPCs with authenticated execution. This is a static authorization gap; no exploit/runtime test was run.

### P2 — Excess table privileges on shared-ride tables
- QA ACL inventory shows `TRUNCATE` granted to anon and authenticated on `fr_shared_rides`, `fr_shared_ride_bookings`, `fr_shared_ride_events`, and `fr_shared_ride_payments`.
- Broad anon table grants are also present. RLS does not protect TRUNCATE; no destructive operation was attempted. PostgREST reachability of TRUNCATE was not tested.
- Booking/event/payment row policies are restrictive, but privilege hardening is still needed (revoke unused anon/authenticated privileges and keep writes RPC-only).

### P1 — Shared Ride confirmation/contact backend incomplete
- `fr_shared_ride_confirm_booking` and `fr_shared_ride_get_participant_contact` are absent from QA public functions.
- Confirmed-booking phone disclosure workflow cannot be certified for Shared Ride in this environment.

## Core Ride payment / QR — backend gap
Frontend source invokes these RPCs, but none exists in QA public functions:
- `get_ride_payment_details_v1`
- `fr_get_ride_payment_state`
- `fr_customer_create_ride_payment`
- `fr_customer_submit_ride_transaction`
- `fr_driver_confirm_ride_payment`
- `fr_driver_save_payment_qr`

No ride-payment/QR table is present in the QA public-table inventory. UI references are not backend evidence; ride completion currently records a completion notice and explicitly defers payment provider integration.

## Catalogue / cart / order
The QA database does not contain the market catalogue/order tables (including `fr_market_orders` and order items). Frontend RPCs absent from QA include partner catalogue save/list, customer catalogue list, market order creation/list/quote/counter/accept, partner market-order listing/update, and multi-shop checkout. This workflow cannot be end-to-end tested against the connected QA project until schema/RPCs are present.

## Home Services
Approved provider listing and customer service-request creation/update foundations exist in QA. TASKO payment submission and admin payment-verification RPCs referenced by the frontend are absent. Laundry transition RPC exists. Provider/payment lifecycle remains partial and runtime-unverified.

## Referral Rewards
Referral-code bind/review/reward-credit foundations exist in QA, including an admin-only reward credit path and reward ledger. However, the latest branch order-eligibility migration depends on `fr_market_orders`, which is absent, and the newer migration is not recorded in QA. Two-paid-completed-order eligibility and reward-credit workflow therefore cannot be verified end-to-end.

## Flash Sale
Campaign table and reservation/cancel RPC foundations exist in QA. Branch migrations for reservation-to-order linking and quote-acceptance checkout discount are not recorded as applied; the order table required by those migrations is absent. Flash Sale reserve UI/RPC alone does not prove order linkage or checkout discount integration.

## ERS / RRS combined Live/Ongoing Station
Existing requirements and audits remain applicable: ERS/RRS source separation, safe public fields, authenticated/approved ERS drivers, RRS guest isolation, participant-only contact after confirmation, and a backend-sourced unified station have not been runtime-certified. No new combined station integration was found verified in this audit.

## Tests / release
- Static database and source checks above were executed read-only.
- Browser/Playwright, API authorization, payment settlement, OTP, push, GPS/two-device, catalogue/order, home-service payment, referral eligibility, Flash Sale checkout, and combined ERS/RRS runtime tests were **not executed**.
- No PASS claims.
- Release remains **BLOCKED**.

## Draft artifact created (not applied)
- `qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql` adds approved-driver and customer-role checks to the two shared-ride SECURITY DEFINER RPCs, and revokes client table write/TRUNCATE privileges while retaining authenticated SELECT. It is a review draft only; it is outside `supabase/migrations` and has not been run.

## Next safe action
Review the draft against the current UI/API contract, then reconcile missing QA schema/RPCs with source/migration files. Do not apply SQL to QA or production without explicit authorization. Keep all progress estimates frozen.
