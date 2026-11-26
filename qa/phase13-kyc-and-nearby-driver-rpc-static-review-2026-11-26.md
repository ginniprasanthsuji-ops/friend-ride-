# Phase 13 — KYC Upload & Nearby Driver RPC Static Review

Date: 2026-11-26
Branch: qa/phase8-13-data-integrity-2026-11-24
Scope: source-only review; no app or production changes.

## Evidence reviewed
- `assets/driver-kyc-upload.js` (blob `f9817b41947a42d4547fd33cbef75ced54d01725`)
- `qa/friend-ride.spec.cjs` (blob `e5c8282d8a77a1adbbde9291c7f5eb79e8d5b8`)
- `qa/PLAY-STORE-RELEASE-GATE.md` (blob `742da2be0c328e78f00c98d734f64fd679adede7`)
- Search results for `fr_customer_list_nearby_drivers`, `fr_driver_documents`, `admin_review_driver`, `accept_ride`, and partner catalogue RPCs.

## Static observations
1. Driver KYC upload handler requires an authenticated driver role, validates vehicle type, registration/licence fields, experience range, and all three files (Aadhaar, driving licence, vehicle RC).
2. File allowlist is JPG/PNG/WEBP/PDF; file size must be nonzero and <= 5 MB.
3. Upload path is scoped under the current user's ID in the private `driver-kyc-documents` bucket; document rows are written with pending status and profile path references are saved.
4. Existing document rows with verified or rejected status block re-upload through this handler.
5. The handler removes prior storage paths after replacement, but removal errors are ignored. Storage policy, DB policy, Admin preview/access, and upload cleanup behavior are not runtime-verified.
6. Browser QA source contains checks for four-role routing and references the approved-driver nearby-location RPC rather than direct driver_locations SELECT. Search did not locate the RPC SQL definition; server-side authorization, output minimization, and coordinate privacy remain unverified.
7. Release gate already marks real authenticated KYC upload/Admin review and live-device checks as incomplete. The old 29/29 results are historical and not rerun in this continuation.

## Verification status
- Static review: completed for listed files.
- Runtime/browser tests: not executed in this continuation.
- SQL/RLS/RPC authorization tests: not executed.
- Real KYC uploads/Admin review: not executed.
- Production changes: none.

## Findings / next verification
- Verify private bucket policies reject cross-user reads/writes and Admin preview uses authorized access.
- Verify `fr_driver_documents` owner/admin policies and Admin review RPC authorization.
- Locate/deploy evidence for `fr_customer_list_nearby_drivers` SQL and test non-admin/customer authorization, approved-driver filtering, and response data minimization.
- Keep Play Store gate BLOCKED until required live tests and release artifacts are evidenced.
