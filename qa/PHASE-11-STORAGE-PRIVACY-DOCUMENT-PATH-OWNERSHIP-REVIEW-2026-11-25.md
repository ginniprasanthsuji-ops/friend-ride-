# Phase 11 — QA Storage Privacy & Document Path Ownership Review (2026-11-25)

Project: QA Supabase `pqsangtvietawkfgpgfu`
Method: Read-only catalog checks only.
No SQL changes, no storage tests, no production access.

## Storage catalog snapshot
- Storage buckets: 0 rows.
- Storage `objects` RLS policies: 0 rows.
- Therefore this QA project currently exposes no configured Supabase Storage buckets/policies in catalog snapshot.

## Document table policies observed
`public.fr_driver_documents`:
- SELECT: owner_id = auth.uid() OR admin_users membership.
- INSERT: owner_id = auth.uid(), driver_id = auth.uid(), verification_status = pending.
- UPDATE own pending: owner_id = auth.uid(), row remains owned by auth UID, driver_id = auth.uid(), status pending.
- UPDATE admin review: admin_users membership.
Static policy predicates are consistent with ownership/admin boundaries, but table privileges and column-level UPDATE permissions need separate review. Runtime policy tests not performed.

## Profiles policy snapshot
- Own SELECT: id = auth.uid().
- Own UPDATE: id = auth.uid() in USING and WITH CHECK; this is row-level identity scope only, not column-level protection.
- Admin SELECT for driver profiles: role=driver and admin_users membership.
- Own INSERT allows own ID and role in customer/driver/partner.
The broad profile column/table privileges and sensitive-field protection issue is tracked separately.

## Path ownership / file access
- Registration RPC source validates provider QR path first segment matches auth UID.
- Driver document INSERT policy requires owner_id and driver_id equal auth.uid() and pending status.
- No storage bucket/policy currently available to validate actual upload/download path access, signed URL rules, or private/public exposure.
- Current storage-based photo/document workflow cannot be runtime-validated in this QA project from the storage catalog snapshot.

## Required storage setup and verification gate
Before release:
1. Define required buckets and whether each is private (identity docs/photos should be private).
2. Add storage.objects policies for authenticated owner upload/read and trusted admin review, with strict path prefix ownership.
3. Prevent authenticated users from changing ownership/path or making sensitive files public.
4. Use short-lived signed URLs for admin document review; never expose service-role key in client.
5. Verify document/photo metadata paths and bucket names align with UI upload code.
6. Run owner/non-owner/admin negative tests using disposable QA accounts.
7. Test upload, read, download, delete, path traversal, cross-user access, and signed URL expiration.
8. Confirm any bucket policy supports required workflows without broad public access.

## Status
- Storage catalog check: completed read-only.
- Storage policies: none found in QA.
- Runtime upload/download tests: not run.
- SQL/schema changes: none.
- Production: untouched.
