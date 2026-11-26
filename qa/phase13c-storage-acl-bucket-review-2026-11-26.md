# Phase 13C — Storage ACL / Bucket Review (QA read-only)

Date: 2026-11-26
Environment: FRIEND RIDE QA Supabase project `pqsangtvietawkfgpgfu`
Scope: Storage bucket privacy, MIME/size constraints, and object-policy catalog.
No object contents or personal data read. No storage changes or runtime API requests.

## Bucket catalog

All six buckets are private (`public=false`):
- customer-profile-photos — 3 MiB max; JPEG/PNG/WebP
- driver-profile-photos — 3 MiB max; JPEG/PNG/WebP
- fr-service-provider-kyc — 5 MiB max; JPEG/PNG/WebP/PDF
- partner-profile-photos — 3 MiB max; JPEG/PNG/WebP
- provider-payment-qr — 5 MiB max; PNG/JPEG/WebP
- road-ride-driver-photos — 3 MiB max; JPEG/PNG/WebP

## Storage policies catalogued

Authenticated own-folder policies observed for customer, driver, partner, service-provider KYC, road-ride driver photo, and payment QR upload/update/delete/read where policy exists. Admin-read policies are present for driver profile photos, partner profile photos, and service-provider KYC. Provider payment QR SELECT is participant-scoped to customer/driver in the matching payment session. Road-ride driver photos have own-folder read/upload/update policies; no delete policy observed.

## Assessment

Positive controls from catalog: buckets are private, MIME allowlists and size limits are set, own-folder path checks exist, and admin-read is explicit for selected KYC/profile buckets.

Remaining runtime verification: cross-user object read/write/delete denied; owner path and folder-name enforcement; admin-only KYC/profile read; payment QR participant boundary; signed URL lifetime/recipient scope; file MIME spoofing and extension mismatch; no anon access. Catalog evidence alone does not prove runtime enforcement.

## Status

Read-only catalog review completed. No data or policies changed. Runtime negative tests pending.
