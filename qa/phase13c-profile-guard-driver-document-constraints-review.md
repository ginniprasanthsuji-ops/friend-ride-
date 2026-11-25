# Phase 13C — Profile Privileged-Field Guard & Driver Document Constraints

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Mode: Read-only catalog inspection only.

## Profile privileged-field trigger found
A BEFORE UPDATE trigger exists on `public.profiles`:
- `qa_guard_profile_privileged_fields`
- invokes `qa_guard_profile_privileged_fields()`
- SECURITY DEFINER, empty search_path.

For authenticated non-admins, the trigger raises an exception if role, driver approval status, or partner approval status changes, except when custom setting `app.friend_ride_role_registration` equals the authenticated user's UUID.

This is positive catalog evidence of an intended server-side guard for privileged profile fields. Runtime testing remains necessary to verify:
1. direct authenticated self-update of role/status is rejected;
2. registration flow's exception is narrowly scoped and cannot be bypassed/spoofed by a regular client;
3. admin update behavior works as intended;
4. unrelated profile fields remain usable.

## Driver-document constraints
Catalog constraints observed:
- document_type limited to `aadhaar`, `driving_license`, `vehicle_rc`.
- verification_status limited to `pending`, `verified`, `rejected`.
- unique driver_id + document_type.
- unique storage_path.
- driver_id and owner_id foreign keys; reviewed_by references auth.users.

## Remaining protection concern
Earlier policy/column ACL review showed authenticated UPDATE access on reviewer metadata and verification status fields. Catalog scan did not reveal a user-table trigger on `fr_driver_documents` in this inspection. RLS update policy restricts owner rows and pending state, but catalog constraints alone do not prevent a user from changing review metadata or verification status to an allowed value. Runtime test is required; consider a separate admin-only update pathway or server guard if the test confirms it is not protected elsewhere.

## Runtime matrix (pending, not executed)
- Non-admin self role/approval field change → reject.
- Test registration-specific setting path and ensure no client bypass.
- Admin role/status change → permitted according to admin workflow.
- Driver attempts status verified/rejected and reviewer metadata update → reject.
- Driver changes document type or path under pending self-row → verify only intended operations permitted.
- Duplicate driver/document type or storage_path → reject.
- Invalid document type/status → reject.

No data changes, migrations, policy changes, or deployments. Production/main project untouched.
