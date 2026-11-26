# Phase 13C QA — Storage Bucket Deployment Mapping Recheck (2026-11-26)

Read-only frontend branch and QA storage catalog audit. No writes/migrations and Production/Main untouched.

## QA storage catalog
Only bucket returned in QA `storage.buckets`:
- `road-ride-driver-photos` — private, 3 MiB limit, MIME allowlist JPEG/PNG/WebP.

## Frontend references compared
Frontend references these upload/read bucket names:
- `driver-profile-photos`
- `driver-kyc-documents`
- `partner-profile-photos`
- `customer-profile-photos`
- `provider-payment-qr`
- `fr-service-provider-kyc`
- `partner-qr`
- `fr-partner-catalogue`

None of these names are the single catalogued bucket `road-ride-driver-photos`. The inspected QA storage object policies are only for `road-ride-driver-photos` and enforce UID folder ownership for SELECT/INSERT/UPDATE. No DELETE policy was present in that policy set.

## Finding
Frontend-to-QA bucket deployment/config mapping mismatch is confirmed at catalog level. Upload paths and profile-photo flow cannot be considered QA-runtime verified. Different buckets may be intended for distinct data classes; do not blindly rename/reuse buckets or migrate objects. Needs approved bucket provisioning/mapping and per-bucket private policies, MIME/size limits, and role-specific tests.

## Not tested
- actual upload or signed/public URL access
- anon/cross-user/cross-folder access
- update/delete policy behavior
- profile-photo display after approval
- QR/payment storage and catalogue storage runtime flows

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen.
