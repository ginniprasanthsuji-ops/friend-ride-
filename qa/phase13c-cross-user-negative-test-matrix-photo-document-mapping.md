# Phase 13C — Cross-User Negative Test Matrix & Photo/Document Mapping

Date: 2026-11-26
Scope: Read-only QA metadata review of project `pqsangtvietawkfgpgfu`. No user records, file contents, object contents, or auth secrets read. No SQL writes or policy changes. Main/Production untouched.

## 1) Metadata mapping: profile/photo/document path fields

Catalog columns found in QA:

| Table | Metadata path fields |
|---|---|
| `profiles` | `customer_profile_photo_path`, `driver_profile_photo_path`, `partner_profile_photo_path`, `partner_qr_path`, `provider_qr_path`, `driver_aadhaar_document_path`, `driving_license_document_path`, `vehicle_rc_document_path` |
| `fr_road_rides` | `driver_photo_path` |
| `fr_road_ride_guest_profiles` | `driver_photo_path` |
| `fr_service_provider_applications` | `profile_photo_path`, `identity_document_path`, `identity_document_type` |
| `fr_service_providers` | `profile_photo_path`, `qr_path` |
| `fr_driver_documents` | `document_type` (document metadata table; no file-path column surfaced by this column-name search) |

Storage catalog previously returned only one QA bucket: `road-ride-driver-photos` (private, 3 MiB, JPEG/PNG/WebP). Bucket policy set includes authenticated own-folder SELECT, INSERT, UPDATE. DELETE policy not observed.

**Gap:** The metadata inventory exposes path columns for several modules but only one bucket. This report cannot establish where those other paths are backed, whether they reference this bucket, or whether the related upload flows are deployed/working. No path values were read. Need schema/source mapping review and test uploads using dedicated QA accounts.

## 2) Policy predicate review (catalog only)

- `profiles`: own-row SELECT/UPDATE/INSERT predicates bind id to auth.uid(); INSERT role allowlist is customer/driver/partner. Admin driver-profile read policy is driver-role limited.
- `fr_driver_documents`: owner/admin SELECT; owner pending INSERT; owner pending UPDATE with owner/driver identity checks and pending-state check; admin review UPDATE.
- `fr_service_provider_applications`: provider-own pending INSERT; provider-own/admin SELECT; admin UPDATE.
- `fr_service_providers`: authenticated SELECT allows approved rows, owner rows, or admin; admin ALL.
- `fr_road_ride_guest_profiles`: driver-own SELECT/INSERT/UPDATE.
- `fr_road_rides`: authenticated SELECT for live rows, own driver rows, or passenger helper. Passenger helper status-scope needs the already identified separate negative test, especially cancelled/refunded bookings.

Predicates are metadata observations only. They do not prove effective runtime behavior, complete grants, or column-level protection.

## 3) Cross-user negative test matrix — not executed

Use two disposable QA users (A and B), plus separate anonymous, customer, driver, partner/provider, and admin test identities. Never use production accounts or real personal documents.

| Test | Identity/attempt | Expected security result | Status |
|---|---|---|---|
| N01 | Anonymous SELECT profile/document tables | Denied by auth/policy boundary | Pending runtime |
| N02 | User A SELECT profile B | No B row returned | Pending |
| N03 | User A UPDATE profile B / change id | Denied; own-row check remains enforced | Pending |
| N04 | User A INSERT profile with id=B | Denied | Pending |
| N05 | Customer attempt to set role=admin or unsupported role | Denied by role allowlist/policy/constraints | Pending |
| N06 | User A read driver document B | Denied unless A is authorized admin | Pending |
| N07 | User A upload document with owner_id/driver_id=B | Denied | Pending |
| N08 | User A change document owner/driver or verification status | Denied; owner pending constraints preserved | Pending |
| N09 | Non-admin UPDATE provider application B | Denied | Pending |
| N10 | User A read application B | Denied | Pending |
| N11 | User A modify provider row B | Denied unless explicit admin authorization | Pending |
| N12 | Unapproved provider listing visibility | Not exposed to ordinary customer unless approved/public policy allows | Pending |
| N13 | User A guest-profile read/write for driver B | Denied | Pending |
| N14 | Nonparticipant read non-live road ride | Denied | Pending |
| N15 | Passenger helper after cancelled/refunded booking | Confirm restricted access; status-agnostic helper concern | Pending |
| N16 | Anonymous storage read/upload/update/delete | Denied for private bucket | Pending |
| N17 | User A read/write/delete object in B's folder | Denied | Pending |
| N18 | Spoof first folder segment / nested path | Ownership check must still deny | Pending |
| N19 | Object UPDATE moved from A-folder to B-folder | Denied by WITH CHECK | Pending |
| N20 | Upload wrong bucket / unsupported MIME / >3 MiB | Rejected | Pending |
| N21 | DELETE own object | Confirm expected behavior; no DELETE policy observed | Pending |
| N22 | Public URL access to private object | Unauthenticated fetch denied | Pending |
| N23 | Signed URL expiry/revocation expectations | Expired URL denied; define acceptable revocation behavior | Pending |
| N24 | Admin read/update cross-user documents | Allowed only for authorized admin; non-admin negative case must deny | Pending |
| N25 | Cross-role direct RPC calls (customer→driver/admin, partner/provider→admin) | Role/ownership authorization enforced | Pending |

## 4) Test protocol

1. Create disposable QA identities A and B and role-specific identities, using existing test account procedure.
2. Keep auth tokens in the tester's secure local session only; do not paste secrets into audit reports.
3. Use each operation through authenticated client/API paths (not SQL owner bypass).
4. Record operation, actor role, target owner, HTTP/RPC response code, pass/fail, and redacted evidence.
5. Stop and report if a test unexpectedly succeeds cross-user; do not attempt destructive follow-up.
6. Do not alter RLS, grants, buckets, policies, or Main/Production as part of this audit.

## 5) Current conclusions

- Metadata suggests owner-scoped profile, document, application, guest-profile, and photo-folder boundaries in the reviewed policies.
- Runtime cross-user denials are **not yet tested**.
- The profile schema contains multiple photo/QR/document path fields but the QA storage catalog has only one bucket; mapping/backing bucket and upload/download paths remain unresolved.
- Shared Ride and Road Ride access boundaries require runtime role/participant/state tests; this report does not certify them.

## 6) Phase 13C progress

Completed: QA metadata mapping of path columns and relevant policy predicates; authored a 25-case cross-user negative test matrix.
Pending: executing controlled runtime tests, resolving path-to-bucket mapping, and documenting results.
