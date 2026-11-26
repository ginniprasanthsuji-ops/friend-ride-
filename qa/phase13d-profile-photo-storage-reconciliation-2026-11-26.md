# Phase 13D — Profile Photo Storage Reconciliation (2026-11-26)

## Finding
QA schema has profile photo path columns: `driver_profile_photo_path`, `partner_profile_photo_path`, `customer_profile_photo_path`. Frontend source uses private storage bucket names `driver-profile-photos`, `partner-profile-photos`, `customer-profile-photos` and signed URL retrieval. QA bucket catalog initially returned none of these three buckets. The road-ride driver photo bucket is separate and already has owner-folder policies.

## QA remediation
Applied migration `20261126000700_phase13d_private_profile_photo_buckets.sql`:
- Created all three buckets as private.
- Image types JPEG, PNG, WebP.
- Maximum 3 MiB.
- Owner-folder INSERT/SELECT/UPDATE/DELETE policies for each bucket.
- No public access; no cross-user read policy added.

## Verification
Catalog read confirms three buckets private with limits and MIME restrictions. Catalog read confirms 12 owner-folder policies (four per bucket). Static verification only; upload, signed URL, wrong-owner denial and admin preview/runtime tests pending.

## Scope
QA project only; Main/Production untouched. No test accounts or photos seeded.
