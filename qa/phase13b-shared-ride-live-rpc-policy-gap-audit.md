# Phase 13B — Live RPC / RLS Gap Audit

Date: 2026-11-26. QA project only; read-only.

## Live deployed RPC validation gaps
- `fr_shared_ride_create` currently checks login, vehicle type, seat count, price, and departure time but does NOT verify `profiles.role='driver'` or `driver_approval_status='approved'`.
- `fr_shared_ride_book_seats` currently checks login and booking/ride capacity/status rules but does NOT verify `profiles.role='customer'`.
- `fr_shared_ride_is_passenger` returns true for any booking row for that passenger/ride without filtering booking status; this can preserve participant scope after cancellation/refund.
- All three functions are SECURITY DEFINER with fixed empty search_path. Catalog review found EXECUTE for authenticated/service_role (and admin roles); anon/public execute was not granted in the earlier focused catalog.

## Live RLS policy risks
- Booking UPDATE policy is participant-based for passenger OR assigned driver and allows updates where the same participant condition holds on old/new row; field-level guard was not found in the reviewed policy catalog. Status, ride_id, seat/fare fields may be exposed to direct-update abuse depending on table grants/constraints.
- Booking INSERT policy permits passenger_id=auth.uid(); direct INSERT grants were not effective for authenticated in latest privilege check, but anon has broad direct privileges (RLS/policy applicability still needs controlled negative tests).
- Ride driver INSERT/UPDATE policies check driver_id=auth.uid(), but do not verify approved driver profile status.
- Events/payments participant SELECT policies rely on booking/ride relationships and grants; broad anon table grants remain a critical permission exposure to review. No anonymous runtime test was executed.

## Existing draft reconciliation
- `qa/phase13b-shared-ride-role-approval-validation-draft.sql` already proposes server-side approved-driver guard in create RPC and customer-role guard in booking RPC.
- Draft is NOT applied; the RPC bodies above are live QA catalog definitions.
- ACL Stage 2 draft remains NOT applied; direct event/payment writes are not dependency-mapped because branch runtime source is missing.

## Required remediation/test gate
1. Reconcile actual QA app source/build with database schema/RPC.
2. Review and test role guards for driver-create and customer-book.
3. Scope participant helper by allowed booking statuses; review cancelled/refunded/no-show/disputed.
4. Restrict direct booking UPDATE to allowed status/fields via RPC/column-level guards.
5. Remove anon direct table grants, after dependency and rollback review.
6. Role/status negative matrix, including anonymous, non-driver, pending driver, non-customer, wrong participant, cancelled/refunded/completed.
7. No SQL applied; Main/Production untouched; no test PASS claims.

Phase 13B remains 70% (unchanged).