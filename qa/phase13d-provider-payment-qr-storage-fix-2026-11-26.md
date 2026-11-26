# Phase 13D QA — Provider Payment QR Storage Fix (2026-11-26)

## Applied to QA
Supabase project: `pqsangtvietawkfgpgfu` (QA only)

## Catalog verification
- Bucket `provider-payment-qr` exists
- Private bucket (`public=false`)
- 5 MiB limit
- MIME allowlist: PNG, JPEG, WebP
- Verified policies: owner-folder INSERT, owner-folder UPDATE, participant-scoped SELECT via `fr_ride_payment_sessions.qr_path`, owner-folder DELETE.

## Frontend alignment
Frontend partner payment settings uploads provider QR images to `provider-payment-qr`; road ride payment UI creates signed URLs from this bucket for both customer and driver views. Policy SELECT is scoped to the exact payment session QR path and either customer or assigned driver.

## Limits
Catalog and policy checks only. Signed URL issuance, cross-account isolation, upload behavior and complete customer-to-driver payment runtime flow are not yet tested. QR storage issue is catalog-configured; runtime proof remains pending.

Migration:
`supabase/migrations/20261126000200_phase13d_provider_payment_qr_storage.sql`
Commit: `1eed2070e12782ba0dfae02ebb2cfb9883b77af1`
