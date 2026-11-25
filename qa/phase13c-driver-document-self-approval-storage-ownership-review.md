# Phase 13C — Driver Document Self-Approval & Storage Ownership Catalog Review

Date: 2026-11-26
QA Supabase project: `pqsangtvietawkfgpgfu`
Read-only catalog audit only.

## Driver document RLS findings
Policies found on `public.fr_driver_documents` (authenticated):
- INSERT own document: requires owner_id=auth.uid(), driver_id=auth.uid(), verification_status='pending'.
- SELECT own documents or admin.
- UPDATE own pending documents; WITH CHECK requires owner_id and driver_id remain self and verification_status remain pending.
- Admin review UPDATE policy requires membership in admin_users.

Positive finding: owner UPDATE policy's WITH CHECK keeps verification_status pending, so catalog policy prevents a normal owner from changing a document row to verified/rejected through that policy.

Review flags:
- Column grants include UPDATE on review_note, reviewed_by, reviewed_at, verification_status, as well as ownership/document fields.
- No non-internal trigger found on fr_driver_documents in this catalog query.
- The policy restricts resulting status to pending, but owner may potentially write reviewer metadata fields while keeping pending; runtime testing needed. Admin review policy and owner policy are permissive, so evaluate how PostgreSQL ORs policies and how role context works in tests.

## Negative-test matrix
1. Driver changes verification_status pending -> verified: expect denied/rejected by owner WITH CHECK.
2. Driver changes pending -> rejected: expect denied/rejected.
3. Driver writes reviewed_by to self while pending: verify whether policy allows; flag as potential metadata spoofing.
4. Driver writes reviewed_at/review_note while pending: verify policy behavior.
5. Driver changes owner_id or driver_id to another user: expect denied.
6. Driver attempts another user's document read/update: deny.
7. Non-admin attempts review update on other driver: deny.
8. Admin review action: allowed only admin_users membership; verify audited identity and fields.
9. Test storage path ownership: owner prefix must be auth.uid().

## Storage.objects policies observed
Only three policies were returned in the catalog:
- road-ride driver photo SELECT own
- road-ride driver photo INSERT own
- road-ride driver photo UPDATE own
All are authenticated-only and require bucket_id `road-ride-driver-photos` plus first folder segment matching auth.uid().

No DELETE policy was present in the returned policy list. No other Storage object policies appeared in the catalog query. This is a catalog observation, not proof of complete photo/document storage configuration; bucket-specific policies, access modes and signed URL behavior require runtime/API tests.

## Runtime consolidation next
- Driver document self-approval and review metadata spoofing negative tests
- Cross-user driver-document read/write tests
- Storage path prefix manipulation and cross-user photo read/write
- Storage public/private bucket configuration and signed URL exposure
- Cross-role profile/photo/document API projection tests
- Shared Ride passenger-driver contact visibility after confirmation, booking-specific
- Public LIVE listing excludes phone, WhatsApp, profile identifiers and payment data

No runtime tests executed. No migrations, writes, deployment, merge, or production access.
