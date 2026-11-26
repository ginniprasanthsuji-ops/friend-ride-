# Phase 13C QA — Home Service Provider Application Flow Recheck (2026-11-26)

Read-only comparison of frontend registration flow and QA Supabase metadata. No database writes/migrations; Production/Main untouched.

## Frontend flow inspected
Home-service provider application frontend:
- Requires passport photo JPG/PNG/WebP, max 3 MiB.
- Requires identity document JPG/PNG/WebP/PDF, max 5 MiB.
- Uploads both to `fr-service-provider-kyc` using UID-first paths.
- Inserts into `fr_service_provider_applications` with provider ID, category, contact, business/address, photo/document paths, emergency contact, experience, service details, UPI, and pending status.
- On second upload failure, attempts to remove the first uploaded photo (cleanup behavior is frontend-only and not runtime tested).

## QA database metadata
- `fr_service_provider_applications` exists.
- RLS enabled; FORCE RLS false.
- No policies were returned for this table in the QA policy catalog query.
- Columns `profile_photo_path`, `identity_document_path`, `provider_id`, `status`, `id` exist.
- QA RPC catalog contains `fr_admin_assign_service_provider`, `fr_customer_list_approved_service_providers`, and `fr_service_provider_update_request`; no matching provider application registration RPC was returned by the tested catalog-name search.
- Storage catalog previously returned only `road-ride-driver-photos`, not the frontend bucket `fr-service-provider-kyc`.

## QA finding — submission path is not verified and appears blocked by policy metadata
Because RLS is enabled and no table policies were returned, the direct client INSERT described in the frontend cannot be confirmed as permitted and is expected to be denied for ordinary client roles under RLS, unless access is mediated by a separate mechanism not seen in this code path. Runtime INSERT test not performed. This is a metadata/code-path finding, not an observed runtime error.

## Status
Registration application, secure storage upload, admin review, and approval handoff remain unverified in QA. No fixes applied.

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.
