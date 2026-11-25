# FRIEND RIDE — Dark + Gold in-place UI migration inventory

**Branch:** `ui/full-native-dark-gold-2026-11-21`  
**Baseline:** `main` remains unchanged.  
**Scope:** 58 existing first-party page routes found in the current `index.html`.

## Migration checklist
- [x] Inspect single-file hybrid app entry point, page IDs, role dashboards, shared navigation, theme/style blocks, auth modal, and current Playwright configuration.
- [x] Replace the old 7-tab bottom navigation in place with Home / Services / Cart / Orders / Profile.
- [x] Keep existing service routes and bottom-cart count element.
- [x] Replace hard-coded native-home location with a mirror of the existing live location field; tapping the location row calls the existing location action.
- [x] Remove the two stacked Dark + Gold patch styles and consolidate the shared system into one final design-system style block.
- [x] Convert the learning-role style from the old purple/light presentation to Dark + Gold.
- [x] Add Playwright route/theme/nav/login coverage.
- [ ] Run all route-level visual and interaction checks.
- [ ] Verify each role with real auth/session and permissions.
- [ ] Verify Admin login -> Admin dashboard on device.
- [ ] Verify payment, maps, upload, notification, KYC, and live GPS integrations.
- [ ] Remove obsolete legacy presentation markup/components after each screen has been verified. **Not yet completed.**
- [ ] Review CSS conflict sources and remove obsolete/conflicting theme rules beyond the consolidated system. **Not yet completed.**
- [ ] Production build/quality gates and full regression pass.
- [ ] Merge and deployment only after all required checks pass.

## Existing routes

### Customer/shared routes
- [ ] `home` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cycleDelivery` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `explore` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `eventServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `serviceProviderRegister` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `bankingServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `ride` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `scheduled` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `goods` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `parcel` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `food` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `restaurantCatalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `shops` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `shopping` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `homeServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `laundryServices` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `storeBrowse` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `customerCatalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `marketCart` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `technicianRegister` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `parcelRelease` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `orders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `tracking` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `wallet` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `offers` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `customerDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `profile` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `notifications` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `support` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `about` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cart` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `frSupportFeedback` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `learnTeach` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `frSuperHub` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Driver
- [ ] `driverDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Partner/vendor
- [ ] `partnerDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerOrders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `products` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `inventory` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `gst` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `catalogue` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `subscription` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `referrals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerReports` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending

### Admin/CRM
- [ ] `adminDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `crmDashboard` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `users` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `referralApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `cashRewardApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `paymentApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerPaymentSettings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `platformBusinessSettings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `driverApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `driverDocumentReviews` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `partnerApprovals` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `adminOrders` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `reports` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending
- [ ] `settings` — existing route retained; shared Dark + Gold theme applied; screen-level verification pending



## Status semantics
The checked items above are changes actually committed to the QA branch. All 58 route IDs still exist and preserve their existing destination screens. **The full structural screen-by-screen legacy markup removal is not complete**, and the route verification checkboxes remain unchecked until the tests/device checks confirm them.


## Continuation audit — 2026-11-21

- QA branch remains isolated from `main`; no merge or deployment performed.
- Confirmed the Dark + Gold route regression spec and the 58-route inventory exist.
- Existing checklist explicitly leaves route-level verification, real role/auth/session verification, integrations, legacy markup cleanup, and full regression incomplete.
- The workflow is configured for pushes to this branch, manual dispatch, and daily scheduled regression. The latest inspected migration-branch commit had no reported workflow runs/status through the available GitHub status endpoints.
- Full `index.html` retrieval is currently unavailable via the connected GitHub file API (file SHA is returned but content is empty). Therefore no source edits or tests are claimed in this audit.
- Release gate remains BLOCKED until source access, test execution, and evidence-backed PASS results are available.


## Auth UI regression coverage added — 2026-11-21
- Added Playwright checks for Admin login modal: role lock, Admin title, Admin-specific OTP label, hidden registration, hidden role grid, dark modal surface.
- Added Playwright checks for Customer login modal: Customer title, Customer OTP label, registration visible, role grid hidden.
- These tests are committed but **not yet confirmed executed/PASS**. GitHub status/workflow query returned no status records and the wrapper does not expose push-triggered runs.
- Source audit confirmed the Dark + Gold design-system and native UI markers are present, but legacy styles remain: 27 style blocks and visible legacy purple/light color declarations were found. No destructive CSS cleanup was performed without route visual regression evidence.


## Source access restored — route regression expansion — 2026-11-21
- Corrected earlier stale note: full `index.html` source was retrieved via blob API in this continuation and inspected (source SHA `32f219925d99b285cec0cff7957ed7d97f772041`).
- Added a Playwright test iterating the route inventory and attempting to activate each existing destination screen under Admin context; it asserts no route IDs are missing and each target becomes active. Test commit: `3e63466b011ec1f9e6935f90e8c6642b480d448e`.
- This remains test coverage added, not test execution. No CI status or workflow runs are available from the current GitHub tool results; therefore no PASS is asserted.
- Source audit: 27 style blocks; legacy purple/light declarations remain. Cleanup is deferred until route and visual regressions can run, to avoid breaking existing screens.


## Regression runner inventory — 2026-11-21
- Confirmed the Playwright route inventory contains exactly 58 route IDs.
- Confirmed `.github/workflows/friend-ride-regression.yml` is configured to run on pushes to `main` and the Dark + Gold QA branch, manual dispatch, and daily schedule; it runs inline JS validation, installs dependencies/Chromium, starts a static server, and executes `npm test`.
- No workflow run/status records are currently returned for the latest QA commit. Actual runner execution is not available from the connected GitHub actions interface, so route tests and integrations remain UNVERIFIED, not PASS.


## Static source verification — 2026-11-21 continuation
- Retrieved the current QA branch source and performed an exact route-ID comparison: **58 test inventory IDs vs 58 existing page elements; 0 missing and 0 extra**.
- Confirmed the native home location element is synchronized from the legacy live-location text through a `MutationObserver`; the GPS reverse-geocoding function updates that legacy text. This supports the location-mirror test structurally, but browser permission/GPS behavior is still not executed.
- Current source contains 25 style blocks. Identified legacy color values in context: some belong to promotional poster gradients and product-art accents; others occur in older KPI/feature-card CSS. Do not blanket-remove these values without visual regression evidence because some are intentional marketing artwork and some legacy screens still use those selectors.
- `showPage()` route activation triggers route-specific loaders/maps and admin-specific panels. The added route test exercises the full activation function, but actual browser execution remains pending.


## Browser E2E gate result and fix — 2026-11-21
- Latest Quality Gate run #304 completed **FAIL** in the browser-e2e job: 47 passed, 9 failed.
- Failure diagnosis from runner logs: Dark + Gold test `beforeEach` blocked all HTTPS requests, including the required Supabase JS CDN library. This prevented app initialization (`supabase.createClient` undefined; `sb` and app state globals unavailable), so the new route/auth UI tests were exercising a broken harness rather than a valid initialized app.
- Fixed test harness to allow the required Supabase JS and Leaflet CDN library requests while continuing to block external API/map calls. Fix commit: `2abe334ad5fc36d1d4ab4163c8f62017cd24f5b6`.
- A fresh CI run is required before merge. PR #26 remains draft/unmerged. User requested merge/deploy, but the browser suite currently has a verified failure; do not merge until the corrected run is green.


## Quality Gate run 306 failure diagnosis and test corrections — 2026-11-21
- Quality Gate run #306: typecheck/core job **PASS**; browser-e2e **FAIL** with 54 passed and 2 failed.
- Failure 1 was a test selector scope bug: `main .page` counted 57 while the app has 58 route elements; corrected to count `.page` globally.
- Failure 2: registration entrypoint test clicked buttons while the Home route was not active/visible. Corrected the test to activate `home` via the existing `showPage('home')` before checking/clicking the registration buttons.
- Corrections commit: `40dcb3cc2800231d4ac495247df0ed42e22f2e05`. Fresh CI run required; no merge/deploy yet.


## Release-readiness audit — 2026-11-22
- QA branch source blob inspected: index.html blob SHA `553648fb053620ce27aad92c5300f38dc475dc40`. The 58-route inventory remains the migration scope; existing route IDs were preserved.
- Static source confirms the Dark + Gold design system and native-home location text mirror the existing `homeLocationText` field via MutationObserver. This is structural evidence only; live GPS permission/reverse-geocoding still requires device/browser verification.
- Static source audit found 27 style blocks and legacy presentation/color rules still present. Do not blanket-remove these without route-level visual evidence; screen-by-screen cleanup and verification remain release work.
- The source does not expose a clearly named standalone “Integration Project Page v1” route from keyword audit. It contains integration notices for backend/payment, catalogue persistence, OTP/APITXT, ride/tracking, and notifications. Confirm the intended project-page scope from its prior design/reference before inventing a new route.
- CI run 44936405386 reports typecheck/unit/core and browser-e2e jobs PASS, but its tested commit is not verified to be the current PR head. Current branch-to-main comparison: 31 commits ahead, 0 behind; main is unchanged.
- Release remains BLOCKED: current-head Quality Gate evidence, full role/route visual checks, and integration/device checks (GPS/maps, auth/OTP delivery, payment verification, uploads/KYC, push notifications, session/permissions) are not all verified.


## Phase 13 continuation — 2026-11-26

- Reconfirmed QA workflow file exists and targets `main`, `ui/full-native-dark-gold-2026-11-21`, and `arjuna-x/phase-13-feature-audit`; it supports manual dispatch and scheduled runs.
- Retrieved `qa/phase13-protected-route-authorization.spec.js` from the QA branch and confirmed it is valid-looking, line-separated JavaScript (not the escaped-newline concern raised by a commit diff rendering).
- The authorization spec covers dashboard role-locking, customer/driver/partner denied admin routes, customer/driver denied partner routes, partner access to partner routes, Admin access to admin and partner routes, and coupon-review access for Partner/Admin only.
- Queried combined status and workflow runs for commit `c12767bc6699d56bbc6fae97462bc69903d5aa5f`; both returned no records. CI execution remains UNVERIFIED; no PASS claim.
- Main/production was not changed. No merge or deployment performed.
- Next: run current QA-branch workflow on the latest branch head, fix any failures, then continue grouped role/route checks and release-gate integration/security review.


## Phase 13 continuation — role-route test scope review (2026-11-26)

- Reviewed the protected-route Playwright test source in detail. It uses synthetic QA identities and directly sets `currentUser`, `currentProfile`, and `selectedRole` in the browser; therefore it validates frontend route guards under mocked role state, not Supabase authentication, database RLS, or backend authorization.
- Role coverage: customer/driver/partner/admin dashboard destinations; customer/driver/partner denial of admin routes; customer/driver denial of partner routes; partner/admin access to partner routes; partner/admin coupon-review access.
- Admin route inventory in this test: 15 routes. Partner route inventory: 10 routes. These direct `showPage()` activation checks are useful UI-guard regression coverage, but do not establish server-side security.
- Security verification gap: backend/RLS tests are still required for cross-user data isolation and role permission enforcement. Actual sign-in/session behavior and authenticated Supabase-user tests remain needed.
- Status: STATIC REVIEW COMPLETE; browser execution and backend authorization evidence UNVERIFIED. No production/Main changes, merge, or deployment.
- Next audit focus: map each role to backend/RLS-sensitive datasets and identify concrete tests for ride/booking contact privacy, driver/partner records, orders/catalogue, and admin-only approval data.


## Phase 13 continuation — Supabase ride privacy audit (2026-11-26)

- Read-only inspection was performed against the identified FRIEND RIDE QA Supabase project (not Main/production).
- RLS catalog review: `rides` SELECT policy allows only ride customer or assigned driver; INSERT policy binds `customer_id` to `auth.uid()`. `ride_live_locations` SELECT is restricted to ride participants; INSERT requires participant relationship and `user_id=auth.uid()`.
- Shared Ride: booking SELECT policy restricts rows to the booking passenger or the ride's assigned driver. Booking UPDATE policy uses the same participant predicate and check. Public listing policy for `fr_shared_rides` allows LIVE/FULL rides, driver, or passenger; listing policy does not expose booking contact columns because booking table has no contact fields.
- Shared ride booking RPC inspected: `fr_shared_ride_book_seats` requires login, locks ride, prevents driver self-booking, validates status/time/cutoff/seat count, prevents duplicate active passenger booking, and records pending booking. Function is SECURITY DEFINER; deeper EXECUTE grants and status-change RPC audit remain open.
- Road Ride contact RPC `fr_road_ride_get_participant_contact` reviewed: login required; contact returned only if passenger or ride driver has a booking in confirmed/boarding/in_progress/dropped/completed/disputed statuses; otherwise raises an exception. This matches the confirmed-participant privacy intent for this RPC.
- Road Ride booking confirmation RPC checks the caller is the ride driver and booking is pending before confirmation. Booking participant SELECT policy allows passenger or driver. Contact RPC additionally gates by confirmed-like statuses.
- Profiles contain sensitive fields including phone, identity/document numbers, banking/payment identifiers and photo/document paths. Existing profiles policies inspected: self read/update, self insert with customer/driver/partner roles, Admin driver-profile read. Full column-level exposure review and authenticated-user tests remain required.
- QA security advisor output includes policy-performance warnings (auth-function re-evaluation), multiple permissive policies and other advisories. These are not fixed in this continuation; no DDL changes were made.
- Evidence status: catalog/policy/function STATIC REVIEW complete for listed areas. No real-user cross-account tests, RPC EXECUTE privilege test, or browser execution; those remain UNVERIFIED. No production/Main changes, merge, or deployment.
- Next: review RPC EXECUTE grants, direct table grants, storage policies for driver/customer photos and sensitive documents, and whether broad profile reads are blocked at column/API level.


## Phase 13 continuation — RPC grants, direct grants and storage audit (2026-11-26)

- Read-only catalog review: selected ride-related tables have RLS enabled (`relrowsecurity=true`); `FORCE ROW LEVEL SECURITY` is not enabled on these tables.
- Direct table privilege catalog shows broad grants to `authenticated` on several ride/profile tables and unexpectedly broad `anon` grants on road/shared ride tables. RLS appears enabled and no anon policies were found in the earlier inspected policy list for these tables, but direct grant minimization is still a hardening candidate. Do not revoke without app regression review.
- RPC EXECUTE privilege catalog: selected sensitive RPCs (road ride booking confirmation/contact, shared ride booking, participant helper functions) are granted to `authenticated`, `service_role`, and postgres; no anon grant surfaced for these functions.
- Storage bucket `road-ride-driver-photos` is private, size limit 3 MB, MIME allowlist JPEG/PNG/WebP. Storage policies reviewed: authenticated user can read/update/upload only within their own UID folder. Storage policy inventory for other customer/driver/partner documents or photo buckets returned only this bucket; confirm intended feature storage scope before any new bucket is added.
- Security note: RLS enabled but not forced. Table owner/bypass-role behavior is not covered by ordinary client RLS tests. No changes made.
- Evidence status: catalog review only; actual anon/authenticated request tests and storage cross-user tests UNVERIFIED. No production/Main changes, merge, deployment, or DDL.
- Next: targeted authenticated and anon API test matrix for RLS deny/allow, then review profiles sensitive-field exposure and legacy direct grants. Keep release blocked until evidence.


## Phase 13 continuation — permanent-photo/QR and temporary-KYC retention policy (2026-11-26)

- User retention requirement clarified: permanently retain only the Driver profile photo, Customer profile photo, Driver QR, and Partner QR (four file types grouped into three categories: driver photo, customer photo, QR codes). Billing/invoice files are not required for permanent storage.
- Temporary KYC: Aadhaar, driving license, and other verification documents remain private and admin-review-only. Admin must be able to view and download for offline filing; after approval/review and successful download confirmation, remove the object from Storage and remove its database file/path reference while retaining approval metadata/status only.
- Catalog read-only check: the inspected QA project currently has one storage bucket, `road-ride-driver-photos`, private, 3 MB limit, JPEG/PNG/WebP. Existing own-UID-folder upload/read/update policies were reviewed in prior audit. No buckets for customer photos or QR assets were observed in the catalog.
- Implementation caution: do not automatically delete KYC files on approval until admin review/download confirmation, retention/backup behavior, and secure-delete workflow are designed and verified. Provide admin review/download UI and a deliberate cleanup action/SQL RPC; avoid deleting permanent profile photos or QR assets.
- This is a requirement/audit note only. No Storage buckets, SQL tables, policies, objects, or data changed. Main/Production untouched; no merge/deploy. Real admin download and deletion tests remain UNVERIFIED.
- Next: design the retention workflow with explicit admin review/download confirmation, a guarded cleanup operation, and tests proving KYC cleanup cannot touch the four permanent asset types.


## Phase 13 continuation — KYC upload source-code mismatch review (2026-11-26)

- Reviewed `assets/driver-kyc-upload.js` on the QA branch. It currently targets Storage bucket `driver-kyc-documents` and uploads three document types: Aadhaar, driving license, and vehicle RC. It also writes document path fields to the driver profile and keeps `fr_driver_documents.storage_path` references for admin review.
- The read-only QA project Storage catalog inspected in this continuation showed only `road-ride-driver-photos`; the source upload script's `driver-kyc-documents` bucket was not present in that catalog. Therefore the upload path/bucket configuration is inconsistent and runtime KYC upload is UNVERIFIED.
- Current upload code does not implement the newly clarified retention workflow: admin view/download confirmation, approval completion, storage object deletion, and removal of document path references. The vehicle RC document is also currently collected although the user's requested temporary-doc scope needs a product decision/approval.
- `fr_driver_documents` has metadata fields including document type, storage path, verification status, review note, reviewer and review timestamp. No data was queried or deleted.
- No source changes or database/storage mutations performed. Main/Production untouched; no merge/deploy. KYC feature is not confirmed functional.
- Next: reconcile QA bucket name and source config; implement admin secure view/download then explicit review-confirmed cleanup; ensure permanent driver/customer photos and driver/partner QR assets are excluded from cleanup. Runtime tests required.


## Phase 13 continuation — retention protection and test assertions review (2026-11-26)

- Source/test review confirms existing profile-photo loading references role-specific private buckets `customer-profile-photos` and `driver-profile-photos`; the code uses signed URLs. QA test also expects partner photo bucket wiring.
- Shop QR/payment UI contains customer/partner QR elements; registration includes driver QR and UPI-related fields. Permanent asset retention is not yet enforced by a storage cleanup guard.
- `test.html` source audit check #03 expects `driver-kyc-documents`, KYC upload handler, partner profile photo bucket, and `fr_driver_documents`. This test checks source markers only; it does not prove bucket existence or secure runtime access. Earlier QA bucket catalog mismatch is still unresolved.
- `qa/friend-ride.spec.cjs` tests KYC input presence and source handler markers, but does not test admin download, post-approval KYC deletion, path reference removal, or protection of permanent profile-photo/QR files.
- Recommended guardrail for cleanup implementation: only allow deletion when object path maps to an approved KYC document type and a reviewed/download-confirmed status; deny all profile-photo and QR asset buckets/types; preserve approval/reviewer/time metadata; clear profile KYC path columns and `fr_driver_documents.storage_path` references; use idempotent cleanup; require Admin authorization. This is design guidance, not implemented.
- No code/SQL/Storage mutation in this continuation. Main/Production untouched; no merge/deploy. Test results remain source-only/unverified runtime.
- Next: add targeted regression tests for KYC-only cleanup and permanent asset deny-list; reconcile bucket mismatch before any implementation.


## Phase 13 continuation — KYC retention test matrix drafted (2026-11-26)

Targeted cases for the eventual guarded cleanup implementation (test design only; not executed):

1. **Admin-only preview/download:** authenticated admin can request a short-lived private signed URL for a pending/reviewed KYC object; non-admin, anonymous and unrelated user denied.
2. **Review gate:** cleanup denied until Admin has reviewed and explicitly confirmed download/offline filing; approval status alone must not auto-delete.
3. **Document-type allowlist:** only KYC types (Aadhaar, licence, approved verification doc types) can be cleaned; unknown type denied.
4. **Permanent-asset denylist:** driver/customer profile-photo buckets and Driver/Partner QR asset types/buckets must be denied regardless of caller input.
5. **Path ownership:** cleanup must use database-validated object path, never accept arbitrary caller-supplied bucket/path.
6. **Metadata preservation:** delete file and clear path references but preserve approval status, reviewer, reviewed_at, review note, and minimal audit event (avoid storing Aadhaar number/document contents).
7. **Idempotency:** second cleanup call returns a safe already-cleaned result; does not affect unrelated objects.
8. **Partial failure:** if Storage deletion fails, retain references and mark cleanup pending/error; if DB reference cleanup fails after file removal, record recovery state without re-uploading or broad deletion.
9. **Cross-user denial:** another driver/partner cannot preview/download/clean KYC objects.
10. **Customer profile-photo protection:** cleanup tests verify customer profile photo remains.
11. **Driver profile-photo protection:** cleanup tests verify driver profile photo remains.
12. **Driver QR protection:** cleanup tests verify driver QR remains.
13. **Partner QR protection:** cleanup tests verify partner QR remains.
14. **Bucket configuration consistency:** app bucket names match the configured private Storage buckets and policies in QA; no missing bucket references.
15. **Admin audit trail:** record reviewer, review/download-confirmation and cleanup timestamp/action, but not sensitive document contents.

Status: **TEST PLAN DRAFTED — NOT EXECUTED**. No implementation, SQL, Storage or data mutations performed. Main/Production untouched; no merge/deploy.


## Phase 13 continuation — Admin KYC review and permanent-asset path audit (2026-11-26)

- Admin KYC screen source review: frontend checks `currentProfile.role === 'admin'`, calls `admin_list_driver_documents`, creates 300-second signed URLs from `driver-kyc-documents`, and exposes Verify/Reject actions through `admin_review_driver_document`. This is source-level evidence only; RPC authorization and Storage policy enforcement are not runtime verified.
- Review flow currently supports Verify/Reject plus optional note and confirmation. It does **not** have an explicit downloaded/offline-filed confirmation or cleanup action. No KYC deletion code was found in the inspected snippets.
- Driver registration uploads profile photo to `driver-profile-photos`; Aadhaar, driving licence and vehicle RC to `driver-kyc-documents`; document paths are stored in profile and `fr_driver_documents`. Customer photo upload targets `customer-profile-photos`.
- Provider QR upload path is `provider-payment-qr` (driver/partner registration). Partner payment settings/market display also references `partner-qr` and a public URL in one settings preview, while customer-facing display uses a signed URL. This bucket/path inconsistency is unresolved; permanent QR retention cannot be asserted from source alone.
- Partner profile photo upload targets `partner-profile-photos`; it is **not** included in the user's current four permanent-asset categories (Driver photo, Customer photo, Driver QR, Partner QR). Do not infer permanence for it without user confirmation.
- No source or DB/Storage mutations. Main/Production untouched; no merge/deploy. Real role/RPC/RLS/Storage testing remains UNVERIFIED.
- Next audit: trace provider QR/profile field usage, verify bucket-name references across source and QA catalog (read-only), then document an implementation-safe storage naming and retention map before code changes.


## Phase 13 continuation — Storage path consistency and replacement behavior (2026-11-26)

- Registration QR upload: driver/partner QR goes to `provider-payment-qr`, profile row path `provider_qr_path`; path is UID/tag/timestamp-based and upload uses `upsert:false`.
- Partner payment settings upload currently duplicates the same QR image into `partner-qr` (`shop-qr_...`) and `provider-payment-qr` (`shop-payment-qr_...`). It then calls `fr_partner_save_payment_details` with both paths. Partner settings preview uses `partner-qr` public URL, while market/customer display uses signed URL for `partner-qr`. Driver ride payment QR uses `provider-payment-qr` and a DB RPC.
- Profile-photo update uses a timestamped unique path and updates the profile path; if DB update fails, it removes the newly uploaded object. On successful update, source does not remove the previous photo object. Thus the profile points to one latest photo, but storage may accumulate older photo files. This is a source observation, not a storage-object inventory.
- KYC upload and profile fields remain path-based. KYC review view creates a short-lived signed URL and Verify/Reject RPC, but no download-confirmation cleanup flow found.
- QR bucket duplication/path conventions and profile-photo old-object retention are candidates for QA-only implementation planning. Do not delete or migrate assets until a verified bucket inventory, database path mapping, and rollback plan exist.
- No source/database/storage mutations. Main/Production untouched; no merge/deploy. Runtime/storage tests UNVERIFIED.


## Phase 13 continuation — Storage acceptance criteria and QA coverage gap (2026-11-26)

### Confirmed source-level mapping
- Registration driver/partner QR: `provider-payment-qr`, profile `provider_qr_path`.
- Partner payment settings currently create two copies: `partner-qr` (`shop-qr_...`) and `provider-payment-qr` (`shop-payment-qr_...`); save RPC receives both paths. Customer/shop display uses `partner-qr`; ride payment display uses `provider-payment-qr`.
- Driver/customer profile-photo update writes a unique new object then updates profile path. When DB update succeeds, prior object is not removed in inspected source. When DB update fails, new object is removed.
- KYC admin review creates short-lived signed URLs and Verify/Reject actions. No cleanup action or explicit downloaded/filing confirmation identified.

### QA coverage gap
- Existing Playwright tests check UI/source wiring, but do not verify QR duplicate behavior, storage object retention, old photo cleanup, KYC download confirmation, deletion, or permanent-asset protection.
- Existing static `test.html` check #03 is a marker check only; it cannot prove Storage bucket existence, signed URL access, or ownership restrictions.

### Implementation acceptance criteria (not implemented)
1. Establish a canonical QR bucket/path scheme and migrate only after a reviewed inventory/backup/rollback plan; no blind deletion.
2. QR update should have a single canonical permanent asset path or documented paired assets if both are genuinely required; retain old permanent QR until replacement is verified, then archive/replace safely.
3. Profile-photo replacement: verify new upload and DB path before deleting old object; old path must be read from profile first, and deletion must be constrained to that user's correct photo bucket. Failure should retain a recovery path.
4. KYC: Admin preview/download, explicit offline-file confirmation, cleanup only of allowlisted KYC objects, preserve approval/reviewer/time/note metadata, and clear document-path references.
5. Permanent assets denylist/guard must include customer/driver photos and Driver/Partner QR assets; cleanup must not accept arbitrary bucket/path input.
6. Test cross-user/admin permissions, Storage failures, DB failures, replacement rollback, idempotent cleanup, and bucket-name consistency using a verified QA project.

Status: **SOURCE AUDIT COMPLETE FOR THIS PASS; ACCEPTANCE CRITERIA DOCUMENTED, NOT IMPLEMENTED/EXECUTED**. No SQL/Storage mutations; Main/Production untouched; no merge/deploy.


## Phase 13 continuation — QR replacement lifecycle audit (2026-11-26)

### Driver QR update
- Driver dashboard update uploads a timestamped new object to `provider-payment-qr`, then calls `fr_driver_save_payment_qr` to update the profile reference.
- Inspected client flow does not remove the previous QR object after the save succeeds. New QR is uploaded before database update; if RPC fails, the upload is not visibly cleaned up in this handler.
- Therefore: replacement can leave stale QR objects, and failed save may leave an orphan. Do not delete these objects until inventory and RPC ownership/authorization behavior are verified.

### Partner QR update
- Partner payment settings upload paired objects to `partner-qr` and `provider-payment-qr`, then call `fr_partner_save_payment_details` with both paths.
- If save fails before `saved=true`, client attempts cleanup of newly uploaded objects. On successful save, prior QR copies are not removed in inspected source.
- Pairing may be intentional for separate customer-market and ride-payment flows; decide canonicalization only after validating each consumer and backend RPC.

### Registration upload rollback
- Registration tracks newly uploaded files and attempts Storage removal when registration throws. This is rollback of newly created registration assets, not a lifecycle cleanup for already registered permanent assets.

### QA actions added to audit scope (not executed)
- Driver QR: successful save, RPC failure cleanup/orphan detection, old QR retention, signed-url consumer, owner isolation.
- Partner QR: one/both upload failure, RPC failure cleanup, successful save, old paired QR retention, preview and customer payment consumer consistency.
- Check bucket/path ownership and SQL RPC permissions in an identified QA database before runtime tests.

Status: **SOURCE REVIEW ONLY; no runtime tests, no SQL/Storage mutations, Main/Production untouched, no merge/deploy**.


## Phase 13 continuation — QA identity and Storage bucket inventory (2026-11-26)

### Supabase project identity — verified read-only
- Supabase project list confirms `fglyplxcczdjtfwobtzh` is named `friend-ride` (Main/Production); status ACTIVE_HEALTHY. **No queries/mutations were performed against this project in this pass.**
- Supabase project list confirms `pqsangtvietawkfgpgfu` is named `FRIEND RIDE QA`; region ap-south-1; status ACTIVE_HEALTHY. QA identity ambiguity is resolved from project metadata.

### Storage bucket inventory — QA only, read-only
- Current `storage.buckets` query returns only one bucket: `road-ride-driver-photos`, private, 3 MB limit, JPEG/PNG/WebP.
- Storage.objects policies for this bucket: authenticated owner-folder SELECT, INSERT, UPDATE. No DELETE policy returned for this bucket in the inspected policies.
- Source references expected but absent from the QA bucket inventory: `driver-kyc-documents`, `driver-profile-photos`, `customer-profile-photos`, `partner-profile-photos`, `provider-payment-qr`, `partner-qr`, `fr-service-provider-kyc`, `fr-partner-catalogue`.
- This is a confirmed QA bucket/source alignment gap. KYC, registration-photo, customer photo, partner photo, payment QR and catalogue storage runtime flows cannot be certified against this QA project until the expected buckets/policies are reviewed and provisioned in an authorized QA-only change.

### Safety
- Read-only project metadata, bucket catalog, and Storage.objects policy queries only.
- No object listing/deletion/upload, no SQL mutation, no migration, no production query, no merge/deploy.
- Runtime Storage owner/admin/cross-user tests remain unexecuted.


## Phase 13 continuation — Storage bucket source inventory & QA policy acceptance matrix (2026-11-26)

### Source bucket inventory cross-check
- Direct `storage.from(...)` references in current `index.html`: `driver-kyc-documents`, `partner-qr`, `provider-payment-qr`, `driver-profile-photos`, `customer-profile-photos`, `fr-partner-catalogue`, `fr-service-provider-kyc`.
- Dynamic profile-photo loader also uses `partner-profile-photos`.
- QA inventory remains only `road-ride-driver-photos`; all referenced storage features except that bucket are unprovisioned in QA.
- Source has a registration/upload helper with bucket parameter; KYC/registration bucket use confirmed by source review. No bucket provisioning SQL found in the reviewed repository SQL/migration inventory.

### Bucket-by-bucket QA acceptance matrix (spec only; not applied)
| Bucket | Intended data | Required access design | Retention |
|---|---|---|---|
| driver-profile-photos | Driver profile image | Private; owner upload/read/update; Admin review access only if needed | Permanent |
| customer-profile-photos | Customer profile image | Private; owner upload/read/update | Permanent |
| partner-profile-photos | Partner profile image | Private; owner upload/read/update; customer-facing signed display only where approved | Policy pending user confirmation |
| driver-kyc-documents | Aadhaar/license/RC KYC | Private; owner upload/read, Admin review/download; cleanup only after explicit reviewed/downloaded confirmation | Temporary; delete file/path after confirmation, preserve review metadata |
| fr-service-provider-kyc | Service provider KYC | Private; owner/admin constrained; temporary review lifecycle | Temporary policy requires role-specific review |
| provider-payment-qr | Driver/partner payment QR | Private; owner manage; only intended ride/shop counterparties via signed access | Permanent; protected from generic cleanup |
| partner-qr | Partner/shop customer QR | Private; owner manage; customer/shop display via authorized signed access | Permanent; protected from generic cleanup |
| fr-partner-catalogue | Partner catalogue assets | Private; partner owns; customer access limited to approved active catalogue items | Retention policy to follow catalogue lifecycle |
| road-ride-driver-photos | Road/shared ride driver photo | Existing QA bucket private; owner-folder SELECT/INSERT/UPDATE policies observed; DELETE policy not observed | Permanent photo; no cleanup/delete policy yet |

### Acceptance / risk notes
- Bucket creation and policy deployment must be QA-only and approved; no automatic provisioning from this audit.
- Each bucket must be private unless an explicitly reviewed public-display requirement exists. Public URLs are not accepted for sensitive KYC or permanent profile assets.
- Admin KYC download/review must use short-lived signed URLs or authorized download mechanism; no public exposure.
- Cleanup must be allowlisted to temporary KYC buckets/path types and require explicit confirmation. Never target profile photos or QR buckets.
- Storage policy runtime tests: owner vs other user, Admin vs non-admin, unauthorized delete, cross-bucket path spoofing, signed URL expiry, failed upload/DB save rollback, replacement old/new path safety. **Not executed.**

Status: inventory and acceptance matrix only; no SQL/Storage mutation, no object inventory/deletion, no merge/deploy, Main/Production untouched.


## Phase 13 continuation — Shared Ride hardening draft safety review (2026-11-26)

### Reviewed drafts (static only)
- `qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql`
- `qa/phase13-shared-ride-contact-privacy-confirmation.sql`

### Review observations
- Draft role checks add approved-driver requirement for Shared Ride creation and customer-only booking.
- Draft revokes broad table privileges (including TRUNCATE) from client roles and limits direct access to SELECT; SECURITY DEFINER RPCs are intended write path.
- Contact privacy helper predicates use active booking statuses; contact RPC itself is still absent from QA catalog per prior audit.
- The second draft includes a public listing view with SECURITY INVOKER and excludes lat/lng from its exposed columns; policy/view compatibility and existing frontend query compatibility must be verified before application.
- Draft changes to policy names/drop statements are not validated against exact QA live policy catalog in this pass; applying may unintentionally remove required policy behavior if names/coverage differ.
- Potentially sensitive: authenticated direct SELECT grants on booking/event/payment tables are broad at table level; RLS is expected to narrow rows, but row-policy and runtime tests are required. Do not treat grants alone as safe.
- No explicit confirmation/contact RPC in the reviewed draft content was established as installed; the QA catalog gap remains.

### QA-only review gate (not applied)
1. Compare every DROP POLICY/REVOKE against live QA policy/ACL catalog and frontend SELECT needs.
2. Ensure SECURITY DEFINER functions are owned by trusted role, use fixed search_path, and have EXECUTE restricted to authenticated as intended.
3. Test anon, customer, approved driver, pending driver, partner, admin, and cross-ride participant access.
4. Verify safe ride listing and participant access to bookings/events/payments without leaking phone/contact or precise location to nonparticipants.
5. Confirm confirmation/contact/cancel/payment lifecycle RPCs exist before relying on RPC-only write privileges.
6. Apply only after explicit QA mutation authorization and a rollback plan; Main/Production prohibited.

Status: STATIC DRAFT REVIEW ONLY. No SQL executed, no live policies changed, no merge/deploy, Main/Production untouched.
