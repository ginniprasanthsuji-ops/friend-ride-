# Phase 13C QA — Registration Profile Photo Backend Enforcement Recheck (2026-11-26)

Read-only review of frontend registration upload helper and QA Supabase RPC catalog/definition. No writes or migrations; Production/Main untouched.

## Frontend helper observations
- Registration upload helper requires a selected file.
- MIME allowlist: JPEG, PNG, WebP, PDF.
- Enforces the passed client-side byte limit.
- Uses UID-first folder path and `upsert:false`.
- Registration profile-photo uploads use `driver-profile-photos`, `partner-profile-photos`, and `customer-profile-photos`; driver KYC uses `driver-kyc-documents`.
These are frontend validations and do not establish backend policy enforcement.

## QA backend RPC
Catalog/definition query returned `fr_register_driver_partner(p_role text,p_profile jsonb)`.
- Authenticated session required.
- Driver/partner role allowlist and customer-only role conversion guard.
- Name/phone validation; required driver/partner business details.
- Pending approval set.
- Provider QR path UID-folder validation.
- Profile photo path is not visibly required or validated in this RPC definition.
- The catalog query did not return an explicit home-service registration RPC under the tested names.

## Findings / status
1. Storage bucket catalog mismatch remains: frontend buckets are absent from QA catalog; only `road-ride-driver-photos` was present.
2. Profile photo is frontend-required, but backend registration RPC definition does not visibly require or validate the photo path. Treat this as a backend enforcement gap to review, not a confirmed runtime bypass.
3. No upload or RPC runtime tests were performed.

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; graph frozen.
