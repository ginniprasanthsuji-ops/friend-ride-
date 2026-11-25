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
