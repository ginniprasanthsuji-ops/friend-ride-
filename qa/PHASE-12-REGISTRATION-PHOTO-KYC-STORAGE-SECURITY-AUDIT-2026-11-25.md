# Phase 12 — Registration Photo & KYC Storage Security Audit
**Date:** 2026-11-25
**Scope:** Read-only GitHub search and QA Supabase metadata/policy inventory
**QA project:** `pqsangtvietawkfgpgfu`; production untouched

## Static source evidence
- Release gate says Driver KYC handler uploads Aadhaar/licence/RC to an existing private bucket, writes `fr_driver_documents` and profile paths; real authenticated upload and Admin review remain staging checks.
- Source/checklist mentions driver-owned KYC upload/read and driver profile-photo upload policies, with Admin read access.
- Partner profile photo/QR/KYC workflow remains PARTIAL and requires private file access checks.
- Home Service/TASKO Gigger source/checklist indicates private KYC bucket and owner-upload/admin-review policies; provider-specific authenticated upload/review remains runtime testing.
- Test inventory explicitly flags Home Service Technician private photo/KYC upload as blocked/live test required.

## QA metadata inventory result
- Read-only query to `storage.buckets` returned an empty result in this QA connection.
- Scoped `pg_policies` query did not return Storage `objects` policies; it did return service-provider application/provisioning policies:
  - Applicant insert own application with pending status.
  - Applicant reads own application; Admin can read.
  - Admin-only update.
  - Provider record read: approved, owner, or Admin.
  - Admin manage providers.
- Empty bucket metadata result does not prove buckets absent in deployment; connection visibility/metadata scope needs confirmation. Therefore private bucket configuration and storage object policies are **NOT independently confirmed** by this query.

## Required runtime security tests
1. Driver uploads own profile photo and KYC docs; own paths only.
2. Driver A cannot read/write Driver B's files.
3. Admin can review authorized KYC docs; non-admin cannot.
4. Partner own photo/QR/document upload; other partner blocked.
5. Service provider own upload/application; other provider blocked; Admin review works.
6. Verify buckets private, signed URL expiry, MIME/type and size restrictions, path ownership, overwrite protections.
7. Verify rejected/pending applications cannot access approved-provider functions or public catalogue.
8. Confirm photo display only on role-approved profile/dashboard; remove sensitive document links from public UI.
9. Test upload failures, retry, delete/replacement, orphan cleanup, and logout/session switching.

## Status
- Static audit: COMPLETE (source evidence partial)
- QA storage metadata visibility: INCONCLUSIVE (bucket query empty)
- Runtime/authenticated tests: NOT RUN
- SQL/code/config changes: 0
- Production changes: 0
- Release gate: PARTIAL / LIVE TEST REQUIRED

## Next
Audit partner catalogue and customer-facing store visibility, stock and price consistency, and approval gating.
