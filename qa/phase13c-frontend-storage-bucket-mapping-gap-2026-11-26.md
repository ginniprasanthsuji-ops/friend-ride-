# Phase 13C — Frontend Storage Bucket Mapping Gap (2026-11-26)

Scope: QA branch `arjuna-x/phase-13-feature-audit`; read-only metadata review and frontend source inspection. QA Supabase project `pqsangtvietawkfgpgfu`. No SQL writes, file uploads, object reads, or storage policy changes. Production/Main untouched.

## QA Storage inventory
The QA bucket catalog currently returned only:
- `road-ride-driver-photos` (private; 3 MiB max; JPEG/PNG/WebP)

Policies on `storage.objects` for this bucket:
- SELECT authenticated own folder
- INSERT authenticated own folder
- UPDATE authenticated own folder, with matching WITH CHECK
- No DELETE policy observed
- No anon policy observed

## Frontend bucket references discovered
The QA branch's `index.html` references additional storage buckets in upload/read flows:
- `driver-profile-photos` — driver profile upload and display
- `partner-profile-photos` — partner profile upload and display
- `customer-profile-photos` — customer profile upload and display
- `fr-service-provider-kyc` — technician/provider photo and identity upload
- `driver-kyc-documents` — signed URL for driver KYC documents
- `partner-qr` — partner/shop payment QR upload/public URL usage
- `provider-payment-qr` — provider payment QR upload/signed URL usage
- `fr-partner-catalogue` — catalogue image upload/public URL usage

## Finding
Frontend code references multiple buckets that were not present in the QA bucket catalog response. This is an environment/deployment mismatch risk and blocks runtime verification of these storage workflows in QA. Do not infer whether these buckets exist in production.

## Required follow-up
- QA setup/mapping for each referenced bucket and expected privacy.
- Verify private vs public intent and signed/public URL flows.
- Review object policies per bucket, owner-folder checks, MIME/size limits.
- Runtime tests: anonymous denial, cross-user denial, correct owner upload/read/update/delete behavior, path spoofing, MIME/size enforcement.
- Test role registration/profile-photo persistence and technician KYC flow after QA buckets/policies are configured.

## Progress protection
Phase 13C remains 91% unchanged; Planning/Checklist 88% frozen; Overall Audit 12% frozen; progress graph frozen. No production changes.
