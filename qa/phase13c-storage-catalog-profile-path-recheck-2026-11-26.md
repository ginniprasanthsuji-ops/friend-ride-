# Phase 13C Continuation — Storage Bucket Catalog and Profile Path Metadata (2026-11-26)

## Scope
Read-only metadata audit against QA Supabase project `pqsangtvietawkfgpgfu` and GitHub QA branch `arjuna-x/phase-13-feature-audit`. No SQL mutations, uploads, or policy changes. Production/Main untouched.

## Verified bucket catalog
The QA catalog contains exactly one bucket:
- `road-ride-driver-photos`
- Private (`public=false`)
- Size limit: 3,145,728 bytes (3 MiB)
- MIME allowlist: JPEG, PNG, WebP

## Verified object policies
Three policies exist, each scoped to authenticated users and this bucket:
- SELECT: first folder segment equals `auth.uid()`
- INSERT: bucket and first folder segment equals `auth.uid()`
- UPDATE: matching own-folder condition in USING and WITH CHECK
- No DELETE policy was returned
- No anon-specific object policy was returned

## Profile-path metadata
The QA public schema includes:
- `profiles.customer_profile_photo_path`
- `profiles.driver_profile_photo_path`
- `profiles.partner_profile_photo_path`
- `fr_service_provider_applications.profile_photo_path`
- `fr_service_providers.profile_photo_path`
- `fr_road_rides.driver_photo_path`
- `fr_road_ride_guest_profiles.driver_photo_path`

## Finding
The only bucket catalog entry does not match the multiple frontend bucket names previously enumerated. Although path columns exist, runtime upload/read behavior cannot be verified for the missing bucket references. The existing bucket policy is scoped to `road-ride-driver-photos`; it does not establish protection for other bucket names.

## Remaining tests
- Confirm QA bucket provisioning/mapping for the frontend bucket list and each bucket's intended public/private setting.
- Runtime tests for anon and cross-user read/upload/update/delete, path spoofing, MIME and size validation, and public/signed URL exposure.
- Test photo and KYC upload/profile display workflows once QA bucket mappings are ready.

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; graph frozen. No estimates changed.
