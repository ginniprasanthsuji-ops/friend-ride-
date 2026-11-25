# Phase 13C — Cross-User RLS Policy & Sensitive Column Grant Review

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Scope: Read-only catalog review of RLS and column privileges. No data mutation or runtime tests.

## RLS policy observations
RLS is enabled on the reviewed tables, including:
- `profiles`: own-row select/update; own-row insert with role limited to customer/driver/partner; admin read policy for driver profiles.
- `fr_driver_documents`: own document read; own pending insert/update; admin review policy.
- `fr_ride_notifications`: own user_id read/update.
- `fr_ride_sos`: own sender read/insert; admin read.
- `ride_live_locations`: only ride participants can read; insert/update require authenticated user ownership and participant ride relationship.
- Shared ride bookings: passenger or ride driver participant read/update; insert passenger_id must equal auth.uid().
- Shared ride payments: booking participant read.
- Shared rides: driver ownership insert/update; SELECT includes public live/full rides plus own driver/passenger participation.

## Priority runtime / policy risk
### Profiles self-update column exposure — HIGH PRIORITY TO VERIFY
Catalog shows authenticated column UPDATE grants on `profiles` include sensitive fields such as `role`, `driver_approval_status`, and `partner_approval_status`, while the policy permits a user to update their own profile row.

RLS row ownership alone does not restrict which columns a row owner can update. Confirm whether database triggers, constraints, RPC-only writes, or app/backend protections prevent self-promotion and self-approval. Test with a non-admin QA identity:
- attempt role change to admin/provider role
- attempt driver approval status change
- attempt partner approval status change
- attempt edits to other verification/identity fields
Expected: server rejects or preserves protected fields; no privilege/approval escalation.

### Driver document self-update fields — VERIFY
Authenticated column privileges include update access to document review-related fields (review_note/reviewed_at/reviewed_by/status). RLS update policy checks own ownership and pending status, with check requiring ownership and pending status. Runtime tests must confirm a user cannot falsify reviewer metadata or alter verification state, and cannot update documents after leaving pending state.

## Positive ownership catalog checks
- Profile RLS: own-row only for regular authenticated users.
- Driver document read: owner or admin.
- Ride notifications: user_id own row.
- SOS: sender own row, admin read.
- Live locations: ride participant scope and own user_id on insert/update.
- Shared booking/payment policies: participant/booking-scoped.

## Shared rides public-listing consideration
Shared ride SELECT policy intentionally permits rows with status live/full to be read publicly/authenticated, in addition to driver/passenger participation. Runtime and column-level response review should ensure LIVE listing contains only approved listing fields and does not expose passenger contact, private documents, payment identifiers, or sensitive profile data.

## Runtime matrix (not executed)
1. Customer A attempts to read/update Customer B profile — deny.
2. Customer attempts role/approval self-escalation — deny/protected fields unchanged.
3. Driver A reads Driver B documents — deny.
4. Driver changes review metadata/status — deny/protected fields unchanged.
5. Driver updates document after status no longer pending — deny.
6. Nonparticipant reads live location for another ride — deny.
7. Nonparticipant reads booking/payment rows — deny.
8. Public LIVE shared ride listing returns only safe listing data.
9. Participant read/update of own booking remains permitted only within intended workflow.
10. Admin review operations remain admin-only.

## Conclusion
Catalog indicates useful ownership and participant RLS boundaries. Sensitive column UPDATE grants on `profiles` and `fr_driver_documents` require runtime validation before security sign-off. This is a finding, not proof of exploitability. No runtime tests were executed; no changes applied; production/main project untouched.
