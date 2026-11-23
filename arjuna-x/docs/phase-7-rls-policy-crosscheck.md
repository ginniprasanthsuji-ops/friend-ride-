# Phase 7 — RLS Policy Cross-check (Read-only QA)

Queried QA project catalog only (read-only SELECT): `pqsangtvietawkfgpgfu`. No policy/grant changes executed.

## Policies confirmed in catalog
- `driver_locations`: authenticated ALL, driver_id=auth.uid(); with-check requires approved driver for online=true.
- `fr_bank_enquiries`: own insert (user_id UID, status=new, admin_note null), own/admin read, admin update.
- `fr_driver_documents`: owner/driver UID and pending on insert; own pending update; admin review update; own/admin read.
- `fr_emergency_contacts`: own user_id ALL.
- `fr_push_subscriptions`: own user_id ALL.
- `fr_ride_sos`: sender UID insert/read own; admin read.
- `fr_service_bookings`: customer pending insert/payment not_due; customer/provider/admin read; admin update.
- `fr_service_provider_applications`: provider UID pending insert; own/admin read; admin update.
- `fr_support_feedback`: own insert with unpublished/new/no admin_note; own/admin read; admin update.
- `profiles`: own insert (id UID; role allowlist customer/driver/partner); own select/update; admin driver-profile read.
- `ride_live_locations`: participant insert policy (customer or driver of ride, user_id UID); further policies require complete query output review.

## Confirmed grant/RLS mismatch
RLS enabled on these tables but not FORCE RLS. Authenticated still has broad table-level grants, including DELETE, REFERENCES, TRIGGER and TRUNCATE on the audited set. RLS does not filter TRUNCATE. The exact current catalog query confirms this risk; no privilege was revoked.

## High-priority review items
1. `fr_ride_sos` insert policy only binds sender_id to auth.uid() in visible policy; it does not visibly bind ride_id to caller participation or require active ride. Add participant + active-state validation via RPC/policy.
2. `fr_service_provider_applications` admin UPDATE policy checks admin membership but allows row update generally; column grants/transition validation need narrowing.
3. `fr_service_bookings` admin UPDATE likewise needs field/transition allowlist; direct admin assignment is UI-guarded only.
4. `fr_support_feedback` admin UPDATE allows admin policy but field-level restrictions and publication consent/moderation must be reviewed.
5. `fr_push_subscriptions` own-user policy protects user_id, but endpoint conflict/ownership behavior and narrow columns need verification.
6. `fr_emergency_contacts` own user_id check; restrict columns and validate phone/priority.
7. `fr_driver_documents` own pending UPDATE policy may permit altering document metadata/path while pending; narrow columns and private storage authorization are essential.
8. `profiles` self-update policy relies on profile guard trigger for privileged fields; custom GUC runtime bypass assessment remains open.
9. `driver_locations` approved-driver check is enforced for online state; verify column-level privileges, coordinates, and offline update.
10. `ride_live_locations`: verify all policies and lifecycle conditions; coordinate range and active ride checks needed.

## Safe proposed pattern (not executed)
- Revoke table-level authenticated privileges on each reviewed table, then grant only SELECT and verified column-level INSERT/UPDATE columns needed by direct client calls; use RPC for state transitions/admin/privileged fields.
- Explicitly revoke TRUNCATE, REFERENCES, TRIGGER, DELETE where not required; ensure inherited/default privileges reviewed.
- Preserve RLS ownership and admin checks. Column grants are not a substitute for RLS.
- Revalidate all client callsites, then authenticated runtime tests (cross-user, non-admin, role/status tampering, endpoint ownership, SOS ride participation, KYC path ownership).
- Do not apply until approved and rollback reviewed.

## Status
Static source and catalog review only. Runtime authenticated tests not run. QA SQL changes not applied. Production untouched; no merge/deployment.
