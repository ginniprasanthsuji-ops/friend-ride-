# Phase 7 — Storage drift reconciliation & source bucket inventory

Date: 2026-11-23. QA Supabase project `pqsangtvietawkfgpgfu`; production not queried.

## Catalog evidence
- Read-only `storage.buckets` query: 0 buckets.
- Storage policy catalog query: no storage policies returned.
- This blocks validating access-control behavior and upload flows in QA.

## Frontend source inventory
Static scan of QA-branch `index.html` found 17 `.storage.from(...)` call occurrences, 7 unique bucket names:
1. `driver-kyc-documents`
2. `partner-qr`
3. `provider-payment-qr`
4. `driver-profile-photos`
5. `customer-profile-photos`
6. `fr-partner-catalogue`
7. `fr-service-provider-kyc`

`assets/driver-kyc-upload.js` also references `driver-kyc-documents`, uploads UID-prefixed paths, validates allowed MIME types (JPEG/PNG/WEBP/PDF), size 5MB, and uses non-upsert uploads. It then upserts document metadata into `fr_driver_documents` and updates profile document paths. Source validation is not a substitute for server/storage policies.

## Environment drift
The source expects multiple buckets, but the QA storage catalog contains none. Older docs/expected storage policies are not proof of actual setup. Bucket creation, public/private flags, MIME/size constraints and policies must be reconciled against intended architecture. No bucket/policy changes were made.

## Risks
- KYC upload, signed preview, profile-photo, partner QR, catalogue and provider KYC flows cannot be security-tested in this QA project as currently cataloged.
- Partner QR source uses public URL preview assumptions (prior checkpoint); ensure QR only contains public payment handle or other approved non-secret data.
- Private KYC must not be exposed publicly; signed URLs should remain short-lived.
- Validate user folder ownership, delete cleanup policies, and upsert semantics after environment setup.

## Next step
Confirm intended QA project/branch and storage bootstrap source (migration/infra script) before creating or changing buckets. Then use synthetic files and cross-user negative tests.

## Safety
Read-only catalog/source scan. No SQL DDL, storage writes, data mutations, production access, merge or deploy.
