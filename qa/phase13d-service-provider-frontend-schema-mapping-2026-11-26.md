# Phase 13D QA — Service Provider Frontend-to-Schema Mapping (2026-11-26)

## Scope
Static inspection of QA branch `arjuna-x/phase-13-feature-audit` index.html and read-only Supabase metadata. No code, database, storage, auth, or runtime changes/tests.

## Frontend registration implementation
Function: `validateServiceProviderRegistration()`
Storage bucket referenced: `fr-service-provider-kyc`
Object paths: `<uid>/tasko-profile-<timestamp>.<ext>`, `<uid>/tasko-id-<timestamp>.<ext>`
Upload validation: profile photo JPEG/PNG/WebP <=3 MB; identity document JPEG/PNG/WebP/PDF <=5 MB.
Frontend checks terms checkbox `spTerms`; on successful insert it reports application pending admin approval.

## Insert mapping compared with QA table
Mapped fields:
- provider_id ← currentUser.id
- service_category ← spCategory
- full_name ← spName
- phone ← normalized spPhone
- business_name ← spBusinessName or null
- full_address ← spAddress
- profile_photo_path ← uploaded profile object path
- identity_document_path ← uploaded identity object path
- identity_document_type ← literal `masked_government_id`
- emergency_contact_name ← spEmergencyName
- emergency_contact_phone ← normalized emergency phone
- experience_years ← clamped 0..60 numeric value
- service_details ← spDetails or null
- upi_id ← spUPI or null
- status ← pending

## Schema fields not included in frontend insert
- `reference_friend_consent`: non-null boolean, default false. Frontend does not send this value. Insert can rely on DB default, but the schema's reference-friend consent is not collected in this form. Frontend `spTerms` consent is a separate verification/terms/privacy consent and is not mapped to that DB field.
- `provider_gender`: nullable; not collected/sent (not an insert blocker).

## Environment/config mismatch
Frontend uploads to `fr-service-provider-kyc`, but QA storage catalog snapshot has only `road-ride-driver-photos`. KYC bucket absence was separately recorded in the prior storage recheck. This means upload is expected to fail in the inspected QA configuration unless the bucket is provisioned elsewhere (not verified).

## Status
Static field mapping largely matches the required table columns; status/timestamps have DB defaults. Main blockers/gaps: QA bucket absent, reference_friend_consent not collected (defaults false), no runtime test. Do not change app code or schema during this audit.

## Frozen tracking
13C remains frozen at 91%; Planning/Checklist 88%; Overall Audit 12%; progress graph frozen. QA branch only, Production/Main untouched.
