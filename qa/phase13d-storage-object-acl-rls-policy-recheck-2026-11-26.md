# Phase 13D QA — Storage Object ACL vs RLS Policy Recheck (2026-11-26)

Read-only metadata review, QA Supabase project `pqsangtvietawkfgpgfu`; Production/Main untouched.

## Bucket snapshot
Only catalogued bucket:
- `road-ride-driver-photos`
- Private (`public=false`)
- 3 MiB maximum
- JPEG, PNG, WebP allowed

Frontend buckets referenced elsewhere (driver/partner/customer photos, KYC, QR, catalogue) remain absent in this snapshot; their runtime upload paths cannot be verified here.

## Storage.objects policies
Three policies returned, all scoped to authenticated:
- SELECT: `fr_road_driver_photo_read_own` — bucket and first folder segment must match `auth.uid()`.
- INSERT: `fr_road_driver_photo_upload_own` — same own-UID folder check.
- UPDATE: `fr_road_driver_photo_update_own` — own-UID folder in both USING and WITH CHECK.
- No DELETE policy returned in this catalog snapshot.

## Table privilege snapshot
`anon` and `authenticated` each have table-level SELECT, INSERT, UPDATE, DELETE grants on `storage.objects` in information_schema grant metadata. This is not by itself proof of access: RLS policy gates still apply.
- For anonymous role, no policies returned in this bucket/object policy snapshot, so effective object access is not confirmed and is expected to be blocked by RLS absent another route.
- For authenticated, SELECT/INSERT/UPDATE have own-folder policies. DELETE has no policy returned, so ordinary client deletion is not confirmed and is expected to be denied by RLS.
- No runtime anon, cross-user, delete, or signed-URL tests performed.

## QA classification
**Metadata-only finding.** Private bucket and UID-folder SELECT/INSERT/UPDATE policies are present for the driver photo bucket; DELETE policy is absent. Other frontend bucket names are not deployed in this QA catalog snapshot. No policy changes or uploads were performed.
