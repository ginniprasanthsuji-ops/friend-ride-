# Phase 7 — Storage & RPC Risk Checkpoint

Source reviewed in QA branch; no SQL or runtime policy tests executed.

## Storage client flows
- KYC documents: private `driver-kyc-documents` bucket; admin preview uses signed URL with 300-second expiry. Existing release-gate notes claim owner-folder policy and private bucket; current QA bucket existence/policy still requires catalog verification.
- Partner QR: uploads to `partner-qr` and `provider-payment-qr` with UID-prefixed paths; partner QR preview uses getPublicUrl() (public-access assumption). Source saves paths via SECURITY DEFINER RPC `fr_partner_save_payment_details`.
- Partner payment settings read profile fields upi_id, phonepe_number, partner_qr_path, partner_approval_status filtered by current user ID.
- Upload cleanup is attempted on save failure. Confirm policies permit cleanup only for owner and that QR file formats/size are validated in source.

## RPC/authorization call paths observed
- `fr_customer_list_nearby_drivers`: called with pickup coordinates and 15km radius; client filters returned rows for online and within radius. Server must validate radius bounds, coordinates, approved-driver status, and privacy fields.
- `fr_register_driver_partner`: client calls for driver/partner registration, then direct profile document-path update remains.
- `fr_partner_save_location`: partner location save via RPC.
- `fr_partner_save_payment_details`: payment detail/QR path save via RPC; verify UID path ownership and bucket/path restrictions.
- `admin_list_driver_documents`: admin-only list RPC; client generates 300-second signed links for document viewing.

## Risks/closure requirements
1. Catalog-verify actual storage buckets and policies in QA.
2. Test unauthorized cross-user uploads, read, signed URL creation, and delete.
3. Verify partner QR public exposure is intentional and QR content contains no private credential.
4. Verify payment QR save RPC enforces caller UID, validates both bucket paths, and prevents path substitution.
5. Review nearby-driver RPC output for unnecessary identity/contact disclosure and server-enforced radius/approval.
6. Runtime auth tests with customer, driver, partner, admin and unauthenticated sessions.

## Safety
QA branch only. No SQL execute, no data mutation, no production change, no merge/deploy.
