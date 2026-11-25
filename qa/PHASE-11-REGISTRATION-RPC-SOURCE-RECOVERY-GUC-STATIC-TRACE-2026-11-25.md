# Phase 11 — Registration RPC Source Recovered; GUC Authorization Risk Confirmed by Static Trace

Date: 2026-11-25
Project: QA Supabase `pqsangtvietawkfgpgfu`
Read-only catalog inspection. No mutation or runtime bypass attempt.

## Recovered source from QA database catalog

Function `public.fr_register_driver_partner(text,jsonb)` source recovered using `pg_get_functiondef`:
- SECURITY DEFINER, empty search_path.
- Requires authenticated UID.
- Accepts only driver/partner roles and object JSON.
- Validates name/mobile and required role-specific details.
- Locks the user's profile row and requires existing role customer.
- Sets transaction-local custom setting `app.friend_ride_role_registration` to UID using `set_config(..., true)`.
- Performs intended role/approval/profile update.
- Returns success, role, pending status, and user ID.

Function `public.qa_guard_profile_privileged_fields()` source:
- SECURITY DEFINER, search_path public.
- If auth.uid() is non-null, not admin_users member, and custom setting does not equal UID, then role/driver approval/partner approval changes are rejected.
- Therefore the guard treats a matching custom GUC as an authorization bypass/allow signal.

## Trigger and grants verified
- Enabled BEFORE UPDATE trigger on public.profiles: `qa_guard_profile_privileged_fields`.
- `fr_register_driver_partner`: EXECUTE granted to authenticated and service_role; anon denied.

## Risk conclusion
The registration RPC correctly sets the custom GUC transaction-locally for its intended update. However, the trigger's authorization condition relies on a user-settable custom configuration value. PostgreSQL application-defined custom GUCs can generally be set by a session/client, so the current design appears susceptible to a direct authenticated own-profile update if the client can set that same GUC. Broad authenticated UPDATE grants on profiles, including role and approval columns, make this risk more serious.

**Static source trace now supports a high-confidence potential bypass design flaw, but it is still not runtime exploit-confirmed.** No test account was used and no attempt was made to set the GUC or update profile data.

## Required remediation (not applied)
1. Do not use client-settable GUC as authorization proof.
2. Change the trigger guard to validate a trusted source/authorization mechanism or use an RPC path that cannot be forged by client sessions.
3. Revoke broad authenticated UPDATE privileges; restrict writable columns and protect role/approval fields.
4. Remove TRUNCATE and other unnecessary client privileges.
5. Run approved isolated negative test after a reviewed remediation migration.

## Test gate
Runtime test remains blocked pending explicit approval of a disposable QA account, test procedure, and cleanup. Production was not accessed or modified.
