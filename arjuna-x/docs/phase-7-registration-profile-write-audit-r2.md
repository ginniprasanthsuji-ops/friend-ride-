# Phase 7 — Registration/Profile Write-Path Security Audit (R2)

Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Source reviewed: `index.html` on this branch.
Status: static source audit only. No database/storage writes, migration, production/main changes, or authenticated runtime test.

## Confirmed registration flow

- OTP verification obtains a Supabase session and sets it through `sb.auth.setSession`.
- Registration constructs profile data from validated form values and the selected role.
- Driver and Partner registration call `fr_register_driver_partner` RPC first.
- The frontend then performs a direct `profiles.update(registrationPaths).eq('id', user.id)`.
- Driver registration uploads profile photo, licence, Aadhaar, RC to private storage and then directly upserts `fr_driver_documents` rows with owner/driver ID and paths.
- Partner registration uploads a profile photo to its private bucket and uses `fr_partner_save_location` RPC for GPS location.
- Optional provider QR upload uses `provider-payment-qr`; its path is also included in profile fields.
- Customer registration path also directly inserts/updates profile fields and optional customer profile photo path.

## Security risks / verification requirements

1. **Profile column scope:** Confirm direct update/insert grants and RLS permit only owner-scoped, approved profile columns. Role, approval, admin, balance, subscription and other privileged fields must not be client-writable.
2. **Path ownership:** Every storage path must be constrained to the authenticated UID prefix and correct bucket. Reject another user's path, bucket crossover, arbitrary path, and path replacement.
3. **Driver document row:** Verify RLS binds `driver_id` and `owner_id` to `auth.uid()`, document_type allowlist, and storage path to UID; ensure pending status cannot be client-set to verified/approved.
4. **Registration RPC boundary:** Inspect `fr_register_driver_partner` server-side implementation for role allowlist, one-time role change, authenticated UID, duplicate/invalid registration and admin-role exclusion.
5. **Upload lifecycle:** Registration can upload multiple files before profile/RPC persistence. Frontend cleanup is not a security boundary; failed partial registrations can leave orphaned private files. Confirm cleanup is safe and owner-only, or design server cleanup.
6. **Provider QR:** Verify owner-only upload/read and that the path cannot be used to expose other providers' payment QR images.
7. **Customer photo:** Confirm optional photo path is owner-only write and permitted read visibility; never allow the path to update unrelated profile columns.
8. **Input validation:** File type/MIME and size are checked client-side. Storage must independently enforce bucket privacy, file-size/MIME restrictions, UID path and object ownership.

## QA negative/positive matrix

| Scenario | Expected |
|---|---|
| Anonymous profile write | Reject |
| Authenticated user writes another UID profile | Reject |
| Client changes role to admin/driver approval/verification | Reject |
| Owner updates permitted profile fields | Allow |
| Owner updates privileged profile fields | Reject |
| Owner uploads to another UID folder | Reject |
| Owner writes driver document row for another UID | Reject |
| Owner inserts document with verified status | Reject |
| Owner submits invalid document_type | Reject |
| Owner points profile path to another user's object | Reject |
| Driver registration RPC with invalid role or UID mismatch | Reject |
| Valid driver registration | Pending status; privileged approval remains server/admin-only |
| Valid partner registration | Pending status; privileged approval remains server/admin-only |
| Partial upload followed by registration failure | Cleanup behavior verified; no unauthorized delete |
| Provider QR path cross-owner access | Reject |
| Customer optional photo path owner-only write | Allow for valid owner path |

## Remediation sequence

- Inspect exact migration history and deployed RLS/storage policies for `profiles`, `fr_driver_documents`, and the registration/photo buckets.
- Confirm `fr_register_driver_partner` implementation and grants.
- Build isolated QA negative tests with two fake authenticated users and an Admin identity.
- Only after call-site/policy reconciliation, prepare narrow RPC or column-level grants/policy changes for explicit review.
- Do not apply any grant, RLS, storage policy, or migration to live project during this static checkpoint.

## Evidence boundary

This audit confirms frontend call sites and identifies required security assertions. It does not prove deployed database/storage authorization or runtime behavior.