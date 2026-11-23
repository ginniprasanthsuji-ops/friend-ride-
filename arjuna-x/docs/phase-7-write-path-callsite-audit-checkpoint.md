# Phase 7 — Write-Path Call-Site Audit Checkpoint

## Reviewed exact source files on QA branch

### `assets/driver-kyc-upload.js` — confirmed direct writes
- Uploads files to `driver-kyc-documents` Storage under `<currentUser.id>/<type>_<token>.<ext>`.
- Reads `fr_driver_documents` by driver_id; blocks reupload if any existing row status is verified/rejected.
- Direct `upsert` into `fr_driver_documents` with driver_id/owner_id, document_type, storage_path, pending status.
- Direct UPDATE `profiles` fields: vehicle_type, vehicle_model, vehicle_registration, driving_license_number, driving_experience_years, driver_aadhaar_document_path, driving_license_document_path, vehicle_rc_document_path.
- This is a concrete call-site dependency: do not revoke all KYC/profile update privileges without replacing this flow with a validated RPC or a verified narrow write policy. Document metadata row policy, bucket presence/privacy and Storage policies need runtime tests. Catalog previously reported no QA buckets, so the source's expected bucket is currently not confirmed.
- Code validates MIME, 5 MB size, path UID prefix and uses upsert=false for storage. However file MIME can be spoofed by client and must not be the only server-side validation; Storage path policy and private bucket remain key.

### `fr-notification-fallback.js` — read-only client path
- Selects only recent `fr_notification_events` for active user (user_id filter, 20-row limit), subscribes to INSERT filtered by user_id, and polls every minute.
- No direct INSERT/UPDATE/DELETE in this file. Notification event content is rendered using textContent, avoiding HTML injection in title/body here.
- Does not justify broad client write grants on `fr_notification_events`; verify other call sites.

### `assets/ride-contact.js` — pure client normalization
- Contains normalization helpers for names, phone, photo paths, vehicle fields, and lifecycle status.
- No database writes in this file.

### `sql/fix_ride_customer_driver_contact.sql` — RPC-based contact access
- SECURITY DEFINER functions require authenticated UID and restrict retrieval to ride customer/assigned driver relationship plus lifecycle status; anon/public execute revoked, authenticated execute granted.
- The SQL file is a migration/source artifact and was not executed in this audit.

## Remediation implications
1. KYC direct write paths require redesign or carefully narrow direct grants/RLS before sensitive profile grants can be revoked.
2. `fr_driver_documents` upsert fields should be reviewed for immutable owner/driver identity and status; status should be server/admin-controlled rather than client-provided if possible.
3. Storage bucket and policies must be present, private, UID-prefix constrained and validated in QA.
4. Notification fallback is read-only in this file; continue searching all client sources before determining global grant necessity.
5. Ride contact functions appear RPC-only in reviewed SQL source; validate actual frontend invocation and function ACL at runtime.

## Safety status
Static source review only. No code or SQL changes to runtime app; no SQL executed; no data changed. Production untouched; QA branch only.