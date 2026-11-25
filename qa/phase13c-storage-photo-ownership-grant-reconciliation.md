# Phase 13C — Storage Photo Ownership Policy & Grant Reconciliation

Date: 2026-11-26
Project: QA Supabase `pqsangtvietawkfgpgfu`
Mode: Read-only catalog review; no storage objects queried and no writes.

## Bucket inventory (QA catalog)
- Bucket: `road-ride-driver-photos`
- Private: `public=false`
- Limit: 3 MiB
- MIME allowlist: JPEG, PNG, WebP

This is only QA bucket metadata; it is not evidence about production bucket inventory or stored files.

## Storage object policies
Observed policies on `storage.objects`:
- Authenticated SELECT: bucket restricted to `road-ride-driver-photos` and first folder = `auth.uid()`.
- Authenticated INSERT: same bucket and own-user first-folder check.
- Authenticated UPDATE: both USING and WITH CHECK enforce bucket and own-user folder.
- No DELETE policy was returned in the current catalog.
- No anon-specific policy was returned.

## Privilege / RLS interpretation
Catalog grants show anon and authenticated have broad table-level SELECT/INSERT/UPDATE/DELETE privileges on storage.objects and storage.buckets. These grants are not equivalent to successful object/bucket actions because RLS policies also apply. The object-policy set is restrictive to authenticated own-folder access for the reviewed bucket; runtime tests remain necessary to verify effective behavior.
No storage.buckets policies were returned in the inspected policy catalog. This is a review flag: broad bucket table grants plus absent catalog policies should be validated through supported API/client role behavior and not through privileged SQL writes.

## Runtime test matrix additions
1. Anonymous SELECT on objects: must not reveal private driver photo objects.
2. Anonymous INSERT/UPDATE/DELETE object attempts: must be denied.
3. Authenticated User A SELECT User B photo path: denied.
4. Authenticated User A INSERT into User B folder: denied.
5. Authenticated User A UPDATE/rename object into User B folder: denied by WITH CHECK.
6. Authenticated User A UPDATE/rename own object into another bucket: denied.
7. Authenticated DELETE own object: expected behavior currently unclear (no DELETE policy observed); confirm deny unless explicit deletion workflow is required.
8. Anonymous/authenticated bucket listing or bucket metadata mutation via supported client API: verify intended restrictions; do not assume table grants imply access.
9. MIME spoofing and >3 MiB upload: expected rejected by bucket configuration; runtime verification pending.

## Conclusion
Catalog policy/grant reconciliation is documented. The policies appear scoped to authenticated owner folders for the one private QA bucket, but broad grants, absent DELETE policy, and missing runtime evidence remain open validation items. This is not a security certification.
