# Phase 13C — Storage Bucket Configuration & Photo/Document Path Mapping Audit

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Read-only catalog inspection.

## Storage bucket catalog
Only one bucket was returned:
- ID/name: `road-ride-driver-photos`
- Public: false (private)
- Size limit: 3,145,728 bytes (3 MiB)
- MIME types allowed: JPEG, PNG, WebP

This is a positive configuration finding for private driver-photo storage. Runtime signed URL/access testing remains necessary.

## Storage path columns observed
Catalog column search found:
- `public.fr_driver_documents.storage_path`
- `public.fr_road_ride_guest_profiles.driver_photo_path`
- `public.fr_road_rides.driver_photo_path`
- `public.fr_service_provider_applications.identity_document_path`
- `public.fr_service_provider_applications.profile_photo_path`
- `public.fr_service_providers.profile_photo_path`
- `public.fr_service_providers.qr_path`
- `public.profiles.customer_profile_photo_path`
- `public.profiles.driver_aadhaar_document_path`
- `public.profiles.driver_profile_photo_path`
- `public.profiles.driving_license_document_path`
- `public.profiles.partner_profile_photo_path`
- `public.profiles.partner_qr_path`
- `public.profiles.provider_qr_path`
- `public.profiles.vehicle_rc_document_path`

## Catalog risk / gap
The catalog lists many photo, identity-document and QR path columns, but the bucket inventory returned only the private `road-ride-driver-photos` bucket and Storage policies returned only driver-photo own-folder policies. This does not establish whether all listed paths are actively used, stored in that bucket, legacy fields, or point to another storage system. Do not infer availability/access safety from path-column presence alone.

## Runtime test checklist
- Verify each path field's actual bucket/object format without exposing customer data.
- Confirm driver profile photo is private and owner-scoped.
- Confirm customer profile photo privacy and sharing behavior.
- Verify Aadhaar, license, RC, identity-document paths are not publicly accessible.
- Confirm QR paths resolve only to intended non-sensitive QR assets.
- Test signed URL expiry and access after expiry.
- Cross-user read/upload/update/delete attempts.
- Check any legacy path field is not unintentionally exposed through APIs or public listing projections.

## Audit limits
No storage objects were read, no signed URLs generated, and no runtime tests executed. No SQL writes, migrations, deployment, or production/main access.
