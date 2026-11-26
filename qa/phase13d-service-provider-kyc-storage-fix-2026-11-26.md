# Phase 13D QA — Service Provider KYC Storage Fix (2026-11-26)

Applied on QA Supabase project `pqsangtvietawkfgpgfu` only.

## Verified catalog
- Bucket `fr-service-provider-kyc` exists and is private.
- 5 MiB maximum; allowlist JPEG, PNG, WebP, PDF (frontend profile-photo validator independently caps at 3 MiB and ID at 5 MiB).
- INSERT own UID-folder only.
- SELECT own documents or authenticated admin_users members.
- UPDATE/DELETE own UID-folder only.
- Policies and bucket catalog verified after apply.

## Frontend mapping
Registration uploads `<uid>/tasko-profile-<timestamp>.<ext>` and `<uid>/tasko-id-<timestamp>.<ext>`. Bucket configuration now matches both uploads and accepted identity file types.

## Limits
Storage catalog/policy verified. Uploads, signed URL viewing, admin review and cross-account access runtime tests are pending.

Migration: `supabase/migrations/20261126000400_phase13d_service_provider_kyc_storage.sql`
Commit: `a7f8ffc61a9180bba9d18c83555c47c815976f5d`
Production/Main untouched.
