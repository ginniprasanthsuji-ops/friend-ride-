# Phase 13B — Sensitive Operations Modules Policy & Column-Grant Review (QA, Read-only)

Date: 2026-11-26
Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Service-provider module, SOS/emergency contacts, driver documents, profiles, driver/live locations, admin_users. Catalog/policy metadata only; no row data; no writes.

## High-priority findings

### Profiles — self-update policy is broad
- `qa_profiles_update_own` UPDATE predicate and WITH CHECK only bind `id = auth.uid()`.
- Authenticated has table-level UPDATE and column grants across profile fields, including role, approval status, contact, vehicle, license/Aadhaar-related fields, photo/document paths, partner fields, QR paths, and business location fields.
- This policy/grant combination is a **high-risk authorization design**: policy metadata does not constrain which columns the owner can update. Role, driver/partner approval, verification, and sensitive identity/document fields should be treated as protected fields and tested with role-context attempts.
- No runtime write attempt performed; no escalation/exploitability claim.

### Driver documents
- Own INSERT requires owner_id and driver_id = auth.uid() and verification_status = pending.
- Own UPDATE row predicate requires owner_id and pending; WITH CHECK also binds driver_id to self and status pending.
- Admin UPDATE/read policies are present.
- Authenticated column grants include document path, verification status, review note, reviewed_by/reviewed_at. Evaluate whether owner can alter verification/reviewer fields within pending rows; predicate only restricts status to pending, not protected column values.
- No DELETE policy surfaced.

### Driver locations
- ALL policy row predicate binds driver_id to auth.uid().
- WITH CHECK additionally permits online=true only when profile role is driver and approval status approved. Offline updates are allowed without that approval subquery.
- Authenticated direct DML grants are broad; test ownership and approved-online guard in runtime.

### Live ride locations
- INSERT binds user_id to auth.uid() and requires the referenced ride to include that user as customer or driver.
- SELECT requires ride participation.
- UPDATE predicate checks owner user_id and ride participation; WITH CHECK only checks user_id remains self. This could allow changing ride_id to another ride while retaining own user_id if FK-valid; validate whether cross-ride movement should be prevented.
- Authenticated table-level DML grants present.

## Service-provider module
- Bookings: customer INSERT constrained to own customer_id, pending status, payment not_due. SELECT restricted to customer, assigned provider, or admin. Admin UPDATE policy present.
- Categories: active-category SELECT for authenticated; admin ALL policy.
- Provider applications: own pending INSERT, owner/admin SELECT, admin UPDATE.
- Providers: SELECT approved providers, owner, or admin; admin ALL policy.
- Requests: own customer INSERT with requested status and provider_id null; SELECT customer, provider owner, or admin; admin UPDATE.
- Broad authenticated DML grants exist at table level. Policies appear intended to restrict rows, but runtime tests and column-level transition checks remain needed.

## SOS and emergency contacts
- SOS INSERT requires sender_id = auth.uid(); own SELECT and admin SELECT. No UPDATE/DELETE policy surfaced.
- Emergency contacts ALL policy binds user_id = auth.uid() for both row predicate and WITH CHECK.
- Sensitive contact and location fields have authenticated column grants; verify row isolation and that SOS payload edits/deletes are blocked as intended.

## Admin users
- Self SELECT policy binds user_id = auth.uid(). No other policy surfaced.
- Authenticated grants include broad table-level privileges; policy command observed is SELECT only. Validate role-context access and confirm no direct mutation path.

## Recommended runtime negative tests (not run)
1. Customer profile: attempt changing role, driver/partner approval, Aadhaar/license identifiers and document paths; should be denied or restricted to approved safe fields.
2. Driver documents: owner attempt changing verification_status/review_note/reviewer fields; pending-to-approved must be denied for non-admin; cross-owner update denied.
3. Driver locations: unapproved driver online=true denied; approved driver self-update allowed; cross-driver writes denied.
4. Live locations: participant can update own point; nonparticipant denied; own user_id must remain; ride_id cannot be reassigned across rides if policy design intends strict binding.
5. Service requests/bookings: customer/provider/admin boundary and status transition/amount fields validated; unauthorized direct DELETE/UPDATE denied.
6. SOS/emergency contacts: cross-user read/write denied; participant/admin read boundary verified; unauthorized SOS update/delete denied.
7. Admin_users: authenticated non-admin cannot read other admin records or mutate.

## Status
Metadata-only audit. No customer/profile/document/SOS rows inspected. No SQL changes applied. Remediation drafts and runtime tests pending approval/staging credentials.
