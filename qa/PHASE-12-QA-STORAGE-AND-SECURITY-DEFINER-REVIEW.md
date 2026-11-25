# Phase 12 — QA Storage & SECURITY DEFINER Function Review

Review date: 2026-11-25
Project: FRIEND RIDE QA (pqsangtvietawkfgpgfu)
Scope: Read-only catalog and function-definition review. No SQL writes, data-row reads, or exploit attempts.

## Storage inventory
- `storage.buckets` query returned 0 rows in QA project.
- `pg_policies` query for schema `storage` returned 0 policies.
- Storage schema tables exist, so the empty bucket/policy result is an observed QA configuration snapshot.
- QA storage setup for profile photos, driver documents, RC/licence/Aadhaar uploads, and provider/shop images is NOT VERIFIED/NOT CONFIGURED in this snapshot. Verify expected buckets and policies before upload-flow testing. Do not use production files or real sensitive documents.

## SECURITY DEFINER function inventory
Catalog showed 27 public SECURITY DEFINER functions (snapshot count; re-run to confirm before release). All inspected functions had explicit empty search_path (`search_path=''`) except two functions using `search_path=public` (`fr_create_notification_preferences_for_new_user`, `qa_guard_profile_privileged_fields`). The latter is a trigger function and has execute ACL only for postgres/service_role in the catalog.

## Definitions reviewed
- `admin_review_driver`: checks admin_users membership and allow-listed decision values.
- `admin_review_driver_document`: admin check and decision allow-list.
- `fr_admin_review_partner`: admin check and decision allow-list.
- `fr_admin_assign_service_provider`: admin check; request/provider/category/approved-online validation.
- `fr_register_driver_partner`: authenticated UID required, role allow-list driver/partner, profile must currently be customer, required fields validated, registration context set transaction-locally, role and approval status pending.
- `accept_ride`: checks approved driver; only accepts unassigned requested ride; prevents active-ride conflicts.
- `fr_driver_start_ride`: approved driver and assigned accepted ride required.
- `fr_driver_complete_ride`: approved assigned driver and ongoing ride required.
- `fr_service_provider_update_request`: approved provider ownership and permitted transition checks.
- `get_ride_customer_details_v2`: login required; only assigned driver can read ride's customer details in allowed ride states.
- `get_ride_driver_details`: login required; only ride customer can read assigned driver's details in allowed ride states.

## Security positives observed in definitions
- Admin review/assignment functions check admin_users membership server-side.
- Ride lifecycle functions enforce driver identity, approval, assignment, and state conditions.
- Ride-contact detail functions enforce participant relationship and state allow-list.
- Registration role allow-list excludes admin and service-provider role; registration sets role approval to pending.
- SECURITY DEFINER functions have explicit search_path settings (catalog snapshot).

## Priority review items
1. QA has no storage buckets/policies visible in this snapshot; storage upload/access tests cannot be completed until QA storage is configured.
2. Review and test every SECURITY DEFINER function, not only sampled functions. Verify EXECUTE grants are intentional, admin guards, participant checks, input validation, and safe search_path.
3. Profile registration context bypass must be tested via the actual RPC and attempted direct client-side mutation; no bypass exploit was attempted.
4. Inspect `get_driver_requests`, counter-offer functions, notification claim function, laundry/TASKO transition functions, and public-feedback RPC before security certification.
5. Function definition review is not runtime security test evidence. Use separate authenticated QA accounts and document results.

## Verdict
REVIEW REQUIRED. Catalog/function checks are read-only and not a security certification. Production remains untouched.

## Next priority
SEC-P0: complete SECURITY DEFINER function review and staged role-account tests. Storage setup is a blocker for private document/photo workflows in QA.
