# Phase 12 — QA Database Role-Security Review (Read-only)

Review date: 2026-11-25
Environment: FRIEND RIDE QA Supabase project (project ref pqsangtvietawkfgpgfu)
Scope: Catalog inspection only. No data rows queried; no database changes performed.

## Snapshot
- Public tables observed with RLS enabled: 22
- Each observed table has at least one policy.
- This is only an RLS-enabled/policy-presence snapshot; it does not certify policies as secure.

## Policies/functions reviewed
- profiles: own SELECT, own UPDATE, own INSERT; admin driver-profile SELECT.
- admin_users: authenticated user can SELECT own admin marker.
- rides: customer/assigned driver SELECT; customer-owned INSERT.
- ride_live_locations: ride participants SELECT; own participant INSERT/UPDATE.
- driver_locations: own driver ALL, online state constrained by driver approval in policy check.
- driver documents: owner/admin SELECT; pending owner insert/update; admin update.
- service bookings/requests: customer, assigned provider and admin access paths.
- notifications/tokens/preferences: own-user access.
- support feedback/bank enquiries: own-user and admin policies.
- provider applications and providers: own/admin/approved-public-read patterns.
- SOS: sender and admin read; sender insert.

## Positive controls observed (policy-level)
- Ride reads limited to customer or assigned driver.
- Live-location reads constrained to ride participants.
- Driver documents read policy limits to owner/admin.
- Service booking reads use customer/assigned provider/admin.
- Notification data is user-scoped.
- Bank enquiries and support feedback have own/admin read paths.
- Driver online state has an approval check in the policy WITH CHECK expression.

## Review flags — require runtime tests / deeper review
1. Profile UPDATE policy: own-update policy permits row updates when id=auth.uid(); trigger qa_guard_profile_privileged_fields() blocks changes to role, driver_approval_status, and partner_approval_status for non-admin authenticated users, except while registration context setting matches current UID. Test that this context cannot be abused by client RPC/direct SQL and is only set inside trusted registration code.
2. Registration role allow-list: profile INSERT policy allows roles customer, driver, partner. Confirm service-provider registration creates a provider profile through a trusted workflow without permitting arbitrary role elevation.
3. Profile sensitive fields: own-profile SELECT includes sensitive columns (phone, vehicle/document identifiers, Aadhaar/license paths, approval statuses). Consider separate protected records or column-level controls; test exposure and least privilege.
4. Service provider public reads: approved providers are readable by authenticated users. Confirm returned columns do not expose private documents, phone, bank or sensitive fields; consider public-safe view/column separation.
5. Admin marker: admin_users own SELECT is not itself proof of admin authorization. Verify all admin RPCs/actions check the table server-side and cannot be bypassed by UI role.
6. Document/storage policy: table policies are not a substitute for private Storage bucket policies. Verify object access by owner/admin and signed URL expiry.
7. Driver-location policy: check if UPDATE WITH CHECK also requires ride participation and that changing ride_id/user_id cannot reassign rows; test direct mutation attempts.
8. Notification update policies: own-user UPDATE policies allow updates to own rows. Check users cannot change protected content, recipient, event linkage or privileged read/unread fields outside intended operations.
9. Service booking/request writes: INSERT policies validate customer ownership and initial state, but verify subsequent status changes are restricted to RPC/admin/assigned parties and state-transition rules.
10. Policy presence is not a functional security test: perform authenticated multi-account tests in QA and record actual denied/allowed results.

## Current verdict
REVIEW REQUIRED — not certified. No exploit was executed. No production or QA database modification was made.

## Next test priority
SEC-P0: test profile role/approval-field changes, direct role-registration context bypass, admin RPC authorization, and cross-user ride/location/document access with separate QA accounts.
