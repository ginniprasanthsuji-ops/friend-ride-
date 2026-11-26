# Phase 13C QA — Driver Payment QR / Shared Payment Metadata Recheck (2026-11-26)

## Scope
Read-only inspection of frontend `index.html` and QA Supabase metadata. No SQL changes, payment tests, or storage uploads. QA branch only; Production/Main untouched.

## Frontend references verified
- Driver QR upload uses storage bucket `provider-payment-qr`.
- Upload path is under the authenticated user's UID folder.
- Frontend calls RPC `fr_driver_save_payment_qr(p_qr_path)`.
- Driver payment confirmation UI calls `fr_driver_confirm_ride_payment(p_ride_id)`.

## QA backend metadata
- Neither `fr_driver_save_payment_qr` nor `fr_driver_confirm_ride_payment` was returned in the public function catalog.
- Shared-ride payment table `fr_shared_ride_payments` exists with booking ID, amount, currency, provider, transaction ID, status, paid/released/refunded timestamps, and audit timestamps.
- Its only inspected policy is authenticated SELECT restricted to booking passenger or ride driver. No write policy was returned.
- No public QR/payment-named RPC was returned by the read-only inventory query.

## Blockers / unverified
1. Frontend QR upload bucket `provider-payment-qr` is not present in the previously verified QA bucket catalog (only `road-ride-driver-photos`).
2. Frontend QR-save RPC and driver payment-confirm RPC are missing from QA public RPC inventory.
3. Shared payment table has participant-read policy only; write/settlement workflow is not established by metadata.
4. Runtime QR upload, payment confirmation, invoice consistency, and passenger/driver isolation remain untested.

## Frozen progress
Phase 13C 91%; Planning/Checklist 88% frozen; Overall Audit 12% frozen; graph frozen. No estimate changes.