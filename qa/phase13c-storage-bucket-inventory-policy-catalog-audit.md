# Phase 13C — Storage Bucket Inventory & Policy Catalog Audit

Date: 2026-11-26
Scope: QA Supabase project `pqsangtvietawkfgpgfu`, metadata only.
No files, object contents, or user records read. No SQL writes or policy changes. Main/Production untouched.

## Inventory result
The QA metadata inventory returned one configured bucket:
- `road-ride-driver-photos`
- Private (`public=false`)
- 3 MiB file size limit
- MIME allowlist: image/jpeg, image/png, image/webp

No other buckets were returned in this QA project's bucket catalog at this time. This is a QA environment inventory finding, not a statement about production or the full deployed application.

## Policies found for storage.objects
1. `fr_road_driver_photo_read_own` — authenticated SELECT; bucket constrained and first folder segment equals auth.uid().
2. `fr_road_driver_photo_upload_own` — authenticated INSERT; same bucket and own-folder check.
3. `fr_road_driver_photo_update_own` — authenticated UPDATE; own-folder check in USING and WITH CHECK.

No DELETE policy was observed in the storage.objects policy catalog. No anon-specific storage.objects policy was observed.

## Catalog grants caution
The information_schema privilege catalog shows broad table privileges on storage.objects and storage.buckets for anon/authenticated roles (including write-type grants). These grants do not independently prove access: Storage RLS policy predicates still govern row-level operations. Because no anon policy was observed for the identified bucket, runtime unauthenticated and cross-user denials remain unverified and must be tested in a controlled QA test.

## Scope gap
Only one bucket exists in the returned QA bucket inventory. Other expected image/document buckets (profile photos, partner photos, driver documents, customer images, service-provider photos) were not present in this QA catalog response. Verify whether those modules store files elsewhere, use this bucket, or require QA environment setup. Do not assume they exist or are absent from production based on QA.

## Negative test checklist to carry forward
- Anonymous object read/upload/update/delete.
- User A read/upload/update/delete against User B folder.
- Folder-path spoofing (wrong first segment; extra nested segments).
- Wrong bucket ID.
- MIME mismatch and >3 MiB upload.
- UPDATE attempts moving object across users' folders (WITH CHECK enforcement).
- Signed URL/public access behavior; ensure private objects are not accidentally publicly retrievable.
- Confirm DELETE denied as intended or define owner/admin deletion policy.
- Validate expected buckets for each module against implementation and production deployment separately.

## Phase 13C progress
Storage bucket catalog inventory and policy metadata review: completed for QA.
Runtime negative tests and remaining module storage mapping: pending.
