# ARJUNA X — Phase 2 Repository & Assets Inventory

**Project:** ARJUNA X (internal codename) / FRIEND RIDE (app brand)  
**Phase:** 2 — Repository & Assets Inventory  
**Branch:** `arjuna-x/phase-2-repository-assets-inventory`  
**Source branch:** `arjuna-x/phase-1-scope-lock`  
**Inventory date:** 2026-11-23  
**Repository:** `ginniprasanthsuji-ops/friend-ride-`

## Scope and safety
This is a source-tree/config/documentation inventory only. No app runtime code, Supabase schema/data, auth, payment, main branch, or live deployment was changed. Findings describe file/config presence, not feature completion or runtime proof.

## Repository snapshot
- Recursive tracked-tree inventory currently returns **78 paths (62 blobs)**.
- Root app entry: `index.html` (reported tree size ~1,026,144 bytes; connector cannot reliably provide readable full content due to size).
- Single-page frontend with modular TS/JS assets and Supabase integrations.
- PWA manifests: `manifest.webmanifest` and `manifest.json`; service-worker files: `service-worker.js`, `sw.js`, plus `firebase-messaging-sw.js`.
- Existing project docs include Blueprint, Clean Restart baseline/inventory, architecture migration, notification setup, QA release gate and service-specific QA docs.

## Asset / branding inventory
| Asset | Observed | Verification |
|---|---|---|
| `icons/icon-192.png` | Present, 2,852 bytes | Image content not visually inspected in this inventory |
| `icons/icon-512.png` | Present, 3,392 bytes | Image content not visually inspected in this inventory |
| `manifest.webmanifest` | Present; references 192 and 512 icons | Confirmed by source |
| `manifest.json` | Present; references root GitHub Pages path | Confirmed by source |
| User-uploaded FRIEND RIDE logo (FR/location-pin mark, Navy/Orange/White) | Supplied in conversation | Not yet copied to repo or confirmed as the current icon asset |
| Other logo/splash/role assets | No dedicated filenames found in listed tree | Need inspect existing icons and image references in HTML |

**Brand lock:** Official logo reference is the user-uploaded image; brand palette Navy Blue + Orange + White. The teal/royal-blue design document is legacy; the current root source still has purple legacy theme tokens. Phase 3 UI migration is not yet started.

## App modules / source footprint
- `index.html`: large SPA entry; connector cannot return full readable source for a complete route inventory in this pass.
- Ride contact: `src/ride-contact.ts`, `assets/ride-contact.js`, `tests/ride-contact.test.cjs`.
- Driver KYC upload: `assets/driver-kyc-upload.js`.
- Education: `learn-teach.js`, `learn-teach.css`, marketplace Playwright spec.
- Core TypeScript: `src/core/result.ts`, `src/core/validation.ts`.
- TASKO/GIGGER and Laundry: SQL migrations, specs and checklists.
- Cycle-delivery pricing migration exists.
- Supabase migrations present: TASKO/GIGGER workflow, Laundry workflow, cycle delivery pricing, Learn/Teach marketplace and provider policies. No migrations applied during Phase 2.
- Service areas from scope: rides, food, grocery/local shops/catalog/multi-shop, parcel/goods, home services, TASKO/GIGGER, Laundry, VIDYA SETU, finance/digital service links, customer/driver/partner/provider/admin roles. Presence in scope does not mean current functionality is verified.

## Test infrastructure inventory
### Package scripts (observed)
- `npm test`: Playwright tests (configured testDir `qa`)
- `npm run test:unit`: Node test runner for `tests/*.test.cjs`
- `npm run typecheck`: TypeScript check of ride-contact module
- `npm run build:runtime`: build ride-contact runtime to `assets/ride-contact.js`
- `npm run test:core`: Vitest
- `npm run typecheck:core`: core TypeScript project check

### Playwright configuration (current)
- `testDir: ./qa`; timeout 45s; retries 1; list + HTML reporters; headless Chromium; trace on failure.
- `FRIEND_RIDE_BASE_URL` is **required** and the config rejects non-loopback hosts. Local CI explicitly uses `http://127.0.0.1:4173`.
- Active default suite excludes the archived `qa/dark-gold-route-regression.spec.js`; functional specs remain enabled, and ARJUNA X has a 58-route baseline plus PWA smoke test.
- Browser specs block external HTTPS except the specific library CDNs needed to initialize the app. CI uses a local static server and does not run live backend mutations.

### Existing specs/files (current)
- Active: `qa/friend-ride.spec.cjs`, `qa/tasko-laundry.spec.cjs`, `qa/tasko-laundry-main-regression.spec.js`, `qa/arjuna-x-phase2-route-baseline.spec.cjs`.
- `qa/arjuna-x-phase2-route-baseline.spec.cjs` reconciles 58 IDs, verifies route activation, and performs local PWA smoke (worker, manifest, icon HTTP).
- `qa/dark-gold-route-regression.spec.js` and checklist retained as legacy reference but excluded from default Playwright suite; they are not authoritative for Navy/Orange/White.
- Node tests include `tests/playwright-config-safety.test.cjs`, `tests/ride-contact.test.cjs`; Vitest core tests in `tests/unit`.
- `qa/read-only-regression.sql` remains read-only and was not executed. `test.html` remains simulation/live-only QA page.

## CI/workflow inventory (current)
| Workflow | Current trigger | Status |
|---|---|---|
| `quality.yml` | push main + active ARJUNA X QA branch; PR main; push ignores docs-only paths | Run #713 on action-v7 commit `8f74189` completed SUCCESS: 48 Playwright, typecheck/core typecheck, build, Node unit 7/7, Vitest 5/5. |
| `friend-ride-regression.yml` | push main + legacy Dark+Gold branch; manual; daily schedule | Legacy suite; theme spec excluded by Playwright config |
| `friend-ride-workflow-regression.yml` | old integration branch push; PR main | Legacy source checks |
| `tasko-laundry-main-regression.yml` | old integration branch push; PR main path filters | Legacy targeted checks; Node 20 |

Active quality workflow uses Node 22, local server, explicit loopback baseURL, typecheck/core typecheck, runtime build, Node unit/core tests and Playwright. CI docs-only commits are ignored on push; app/test/workflow changes trigger the gate. Branch protection/required status checks are not enforced (rulesets query returned 0).

## Notifications / PWA inventory (current)
- Root source has 3 registrations plus `fcm-web-push.js` registration; all target `service-worker.js`. `sw.js` and `firebase-messaging-sw.js` are not referenced by scanned source.
- Local CI smoke verified active `service-worker.js`, root scope, linked `manifest.webmanifest`, standalone metadata and icon HTTP responses. Device install/update/offline/push delivery remain untested.
- FCM token registration source/deployed endpoint alignment verified; dispatch Edge Function source checks secret header, but secret configuration is not verified. Realtime/poll fallback is foreground only.
- Two manifests remain: linked `manifest.webmanifest` and unlinked `manifest.json` with different paths/colors. Reconciliation is deferred to reviewed PWA/UI patch.

## Integration/config inventory (current)
- Production Supabase project `fglyplxcczdjtfwobtzh` and QA project `pqsangtvietawkfgpgfu` are both active/healthy. Root `index.html` and `fcm-web-push.js` hardcode production; QA project is not wired into app source. CI blocks external APIs, so no live backend E2E was run.
- Read-only metadata: production 79 migrations/85 public tables (all RLS; 23 with no policies), QA 25 migrations/21 tables (all RLS and policies). SECDEF/grant/security-linter review remains partial.
- Maps/Places, SMS/APITXT, payments/Cashfree, Firebase push, Zoom and finance/travel external links need integration-specific runtime/contract review. Preserve existing auth/payment/backend contracts.

## Conflicts / legacy artifacts (current)
1. Teal/royal-blue design document is legacy; current source still uses purple tokens. ARJUNA X target remains Navy + Orange + White.
2. Dark+Gold QA assertions are legacy and excluded from active Playwright suite; Phase 3 must add target-theme checks without losing route/function coverage.
3. Duplicate manifests and worker files remain; source audit identifies active worker but device/runtime matrix is incomplete.
4. Official logo/icon binary visual verification is unavailable; icons remain unverified against supplied official logo.
5. QA branch CI now runs and passes, but required checks/branch protection are not enforced.

## Pass 2 — Blueprint, specs and notification source inspection

### Blueprint-confirmed workflows
- Single unified app with role-specific dashboards for Customer, Driver/Rider, Partner/Merchant/Shop Owner, Service Provider/Gigger, Admin.
- Customer service scope includes Bike/Auto/Car, cycle delivery, parcel/goods, food, grocery/local shops, pharmacy marketplace under controls, shopping/catalogue, home services, laundry, TASKO/GIGGER, Education/Vidya Setu, authorized recharge/bill-pay and travel integrations, wallet/offers/referral, notifications/profile/support/complaints/feedback/ratings.
- Driver workflow includes onboarding/KYC/admin approval, online/offline, ride actions, navigation, tracking, earnings/history/wallet/settlement, SOS/support/notifications.
- Partner workflow includes onboarding/KYC/approval, catalog/product/stock/pricing/offers/orders, preparation/ready/pickup/delivery, earnings/settlement, subscriptions and reviews.
- Ride lifecycle in blueprint: Requested → Searching Driver → Driver Assigned → Accepted → Arriving → Arrived → Started → In Progress → Completed → Payment Pending/Completed, or Cancelled; valid transitions and authorization must be enforced.

### Notification code observations
- `fcm-web-push.js` registers `service-worker.js`, requests permission on button click, obtains an FCM token, and POSTs to `fr-notification-register-token` using an authenticated session.
- `service-worker.js` has both Firebase background handler and generic PushEvent handling; notification classification contains Telugu text and vibration patterns.
- `firebase-messaging-sw.js` also imports Firebase and handles background messages/notification click.
- `sw.js` is another generic push/caching worker.
- `fr-notification-fallback.js` uses Supabase notification events, Realtime insert subscription and 60-second polling; it displays a sticky in-app fallback card and browser notification if permission is granted.
- **Confirmed risk:** multiple worker files and registration paths need a unified registration/scope audit. The notification setup doc describes placeholders/contract verification; source presence alone is not proof of deployed token registration or background delivery. Voice announcement, closed-app delivery, deduplication across push/fallback, quiet hours and marketing consent are not verified in this source pass.
- Source uses public Firebase web config and Supabase publishable key; never expose service-role/private credentials. Public client config is not itself a privileged secret, but server-side authorization and abuse/rate controls must be reviewed.

### Test specification observations
- Main QA Playwright spec includes role entry points/router, runtime diagnostics visibility, and a QA test-page simulated/live-only distinction; not all tests represent real backend workflow E2E.
- TASKO/Laundry specs include source/function checks and invalid-booking validation; complete real customer-provider-admin workflow remains unproven.
- Learn/Teach specs assert landing screen/category cards; not complete teacher/student/Zoom/homwork workflow E2E.
- Existing tests are mixed: browser UI checks, source-marker checks, simulated tests, and limited backend-independent tests. Phase 10 needs coverage labels and test evidence classification.


## Pass 3 — Test/CI, migration and contract risk review

### Test evidence classification
- `qa/friend-ride.spec.cjs` covers SPA boot/role entry points/router self-test, diagnostics hidden from non-admin, QA page deterministic simulation vs live-only blockers, support/feedback wiring, and Friend Mart GPS/map wiring. It is a mixed UI/source-contract suite—not a complete live-backend E2E proof.
- `test.html` explicitly reports simulation checks and live-only constraints; simulated checks cannot be represented as production integration passes.
- TASKO/Laundry specs include source/function checks and invalid-state validation; live provider/customer/admin workflow is not demonstrated by this inventory.
- Learn/Teach spec checks landing/category surfaces; complete student/teacher/admin workflow, assignments and Zoom integration are not proven.
- Node and Vitest unit tests cover core utilities and ride-contact modules; exact coverage percentages are not configured/verified.

### CI details and risks
- `quality.yml` runs TypeScript checks, runtime build, Node unit tests, Vitest and Playwright against a local static server on PRs/pushes to main. It cannot by itself exercise authenticated Supabase flows.
- `friend-ride-regression.yml` runs source checks plus Playwright on main, legacy theme branch, manual trigger and schedule; uploads reports. Legacy branch trigger needs ARJUNA X alignment later.
- `friend-ride-workflow-regression.yml` source checks trigger on an old branch and PR-to-main; trigger alignment gap.
- `tasko-laundry-main-regression.yml` targeted suite triggers on old integration branch or relevant main PR paths; Node versions differ (20 vs 22) across workflows.
- Playwright base URL defaults to production; CI explicitly overrides local server in workflows, but manual runs must set `FRIEND_RIDE_BASE_URL` to avoid accidental live testing.

### Migration/schema review — no changes made
- Five migration files observed for TASKO/GIGGER, Laundry, cycle-delivery pricing, Learn/Teach marketplace, provider policies. Migration review must remain separate from UI-only work; none applied.
- Source implements TASKO provider transitions/payment verification, Laundry transitions, cycle pricing config with RLS, and Learn/Teach account/course/request/notification tables and policies. File presence does not prove production migration status.
- `qa/read-only-regression.sql` is labeled read-only and checks schema/function/storage/policy presence plus a profile test-data count. Reviewed only; not executed.

### Route/screen and logo limitations
- `index.html` is a very large SPA; connector extraction did not provide reliable complete source for route/screen enumeration. Route IDs, navigation handlers, role visibility and API/RPC calls remain a high-priority gap. Do not guess.
- Icon files exist but were not rendered/visually inspected. User-supplied logo is authoritative; repo binary equivalence remains unverified.


## Pass 4 — SPA route/page IDs and API/RPC inventory (source extraction)

### Actual SPA page IDs
Source extraction from `index.html` identified **58 page IDs**:
`home`, `cycleDelivery`, `explore`, `eventServices`, `serviceProviderRegister`, `bankingServices`, `ride`, `scheduled`, `goods`, `parcel`, `food`, `restaurantCatalogue`, `shops`, `shopping`, `homeServices`, `laundryServices`, `storeBrowse`, `customerCatalogue`, `marketCart`, `technicianRegister`, `parcelRelease`, `orders`, `tracking`, `wallet`, `offers`, `customerDashboard`, `driverDashboard`, `partnerDashboard`, `partnerOrders`, `products`, `inventory`, `gst`, `catalogue`, `subscription`, `referrals`, `partnerReports`, `adminDashboard`, `crmDashboard`, `users`, `referralApprovals`, `cashRewardApprovals`, `paymentApprovals`, `partnerPaymentSettings`, `platformBusinessSettings`, `driverApprovals`, `driverDocumentReviews`, `partnerApprovals`, `adminOrders`, `reports`, `settings`, `profile`, `notifications`, `support`, `about`, `cart`, `frSupportFeedback`, `learnTeach`, `frSuperHub`.

### Source-extracted Supabase table names (22 unique)
`driver-kyc-documents`, `profiles`, `partner-qr`, `provider-payment-qr`, `admin_users`, `fr_driver_documents`, `rides`, `driver-profile-photos`, `driver_locations`, `ride_live_locations`, `customer-profile-photos`, `fr_emergency_contacts`, `fr_ride_sos`, `fr_ride_notifications`, `fr_app_notifications`, `fr_push_subscriptions`, `fr-partner-catalogue`, `fr-service-provider-kyc`, `fr_service_provider_applications`, `fr_service_bookings`, `fr_bank_enquiries`, `fr_support_feedback`.

### Source-extracted RPC functions (58 unique)
`admin_list_driver_documents`, `admin_review_driver_document`, `fr_admin_list_partner_applications`, `fr_admin_review_partner`, `fr_partner_save_payment_details`, `admin_list_driver_applications`, `admin_review_driver`, `fr_partner_list_market_orders`, `fr_partner_update_market_order`, `fr_get_platform_business_details`, `fr_admin_save_platform_business_details`, `fr_partner_save_location`, `fr_customer_list_approved_stores_geo`, `fr_customer_store_payment_options`, `fr_customer_place_market_order`, `fr_register_driver_partner`, `fr_customer_list_nearby_drivers`, `get_ride_driver_details`, `get_ride_payment_details_v1`, `fr_get_ride_payment_state`, `fr_customer_create_ride_payment`, `fr_customer_submit_ride_transaction`, `fr_driver_confirm_ride_payment`, `get_ride_customer_details_v2`, `accept_counter_offer`, `decline_counter_offer`, `fr_driver_save_payment_qr`, `get_driver_requests`, `fr_driver_start_ride`, `fr_driver_complete_ride`, `accept_ride`, `counter_offer_ride`, `fr_partner_save_catalogue_item`, `fr_partner_list_catalogue`, `fr_customer_list_partner_catalogue`, `fr_partner_quote_market_order`, `fr_customer_list_market_orders`, `fr_customer_accept_market_quote`, `fr_customer_counter_market_order`, `fr_tasko_provider_transition`, `fr_tasko_submit_payment`, `fr_tasko_admin_verify_payment`, `fr_customer_list_approved_service_providers`, `fr_customer_create_parcel_request`, `fr_driver_list_parcel_requests`, `fr_driver_accept_parcel`, `fr_driver_confirm_parcel_payment`, `fr_customer_list_parcel_requests`, `fr_customer_get_parcel_delivery_otp`, `fr_driver_verify_parcel_delivery_otp`, `fr_customer_create_service_request`, `fr_customer_place_multi_market_order`, `fr_public_homepage_feedback`, `fr_partner_confirm_market_payment`, `fr_customer_market_payment_details`, `fr_customer_tick_market_payment`, `fr_laundry_provider_transition`.

### Edge Function / external endpoint findings
- No direct `supabase.functions.invoke(...)` function names were found in the extraction pattern.
- Nominatim OpenStreetMap search/reverse-geocode URLs are used.
- Leaflet and OpenStreetMap tile URLs are present.
- Supabase URL and client library are referenced in app source.
- WhatsApp share/contact links are present.
- Finance services link to FINEDUCATION websites.
- API inventory is source-call-name inventory only; argument contracts, role authorization and backend definitions still require separate review.

### Role mapping limitation
Page IDs and headings were extracted. Role-to-page permission rules are not yet fully verified; admin/partner/driver screen names suggest intended ownership but cannot be used as proof of access-control enforcement. Phase 2 must inspect the routing/visibility guards and test role sessions before closing.


## Pass 5 — Notification pipeline source audit

### Registration and delivery mechanisms found
- `fcm-web-push.js` creates opt-in UI, registers `service-worker.js`, requests permission from a user click, gets FCM token and calls token-registration Edge endpoint with authenticated session.
- `service-worker.js` contains Firebase background-message handling plus a generic Web Push `push` listener, classification, Telugu notification text and vibration patterns; it suppresses duplicate generic handling for FCM payloads.
- `firebase-messaging-sw.js` is another Firebase worker/background handler and click handler, but no registration call was found in inspected source files.
- `sw.js` is a separate generic push worker with notification click navigation and cache cleanup.
- `fr-notification-fallback.js` reads `fr_notification_events`, Realtime subscription plus 60-second polling, de-duplicates per active session, displays in-app/browser notifications, and is not push delivery when the app is closed.

### Risks confirmed
- Multiple worker scripts are present; registration path and scope must be consolidated/confirmed. FCM opt-in code points at `service-worker.js`, while separate Firebase worker exists.
- Firebase config/token registration contract and Edge Function deployment were not verified; code presence is not proof push delivery works.
- Closed-app delivery, Android/iOS PWA behavior, voice/TTS announcement, quiet-hours/marketing preferences, notification preferences and cross-path deduplication are not verified.
- Notification fallback does not guarantee background/closed-app delivery; polling requires active app runtime.

### Notification audit checklist
- [x] Opt-in/user gesture permission request inspected.
- [x] Worker registration path inspected in opt-in file.
- [x] FCM background handler(s) inspected.
- [x] Generic push handler and duplicate guard inspected.
- [x] Realtime/poll fallback inspected.
- [ ] Confirm worker registration sites and active scope in full source.
- [ ] Confirm deployed token-registration endpoint and storage contract.
- [ ] Confirm dispatch sender/server path and payload shape.
- [ ] Verify Telugu TTS/voice and sound behavior (no speechSynthesis found in inspected worker/fallback files).
- [ ] Verify app foreground/background/closed state on real Android device.
- [ ] Verify role-specific notification routing, deduplication, quiet hours and consent controls.


## Pass 6 — Owner requirements: subscription gateway, GST and toll-free contact

User confirmed: payment gateway is not yet integrated for collecting subscription fees; the app should allow future Admin integration/configuration. GST registration is pending; Admin-entered GST details should later control invoice tax display/calculation. Admin toll-free number should be displayed on homepage, with a separate future toll-free telephony integration.

### Current source findings
- Cashfree is mentioned in the SPA in subscription/payment placeholder text. It explicitly says live billing requires server-created Cashfree orders and payment verification; subscription selection says payment has not started and secure backend/webhook must be connected before charging. This is **not evidence of a working gateway integration**.
- Admin Platform Business Settings page contains Toll-Free (1800) and Platform GSTIN fields, validates formats, and calls RPCs `fr_get_platform_business_details` and `fr_admin_save_platform_business_details`. Backend persistence/permissions are source-call presence only; not runtime verified.
- Existing GST Bills & Invoices page describes a calculation preview, not a statutory tax invoice. It differentiates seller/partner GSTIN from platform GSTIN and cautions about HSN/SAC, place-of-supply, tax split, invoice numbering and GST registration validation.
- Toll-free homepage display was not verified in this pass. Admin configuration UI presence does not prove homepage rendering.

### Locked implementation requirement (deferred to Phase 8/10)
- Admin-configurable subscription gateway, initially scoped to subscription fees only, sandbox-first and secure server-side secrets/order/webhook verification. Keep existing ride/customer payment flow untouched.
- GST settings disabled/unregistered by default while user has no GST registration. Invoice tax must use one source of truth and only show configured, valid tax registration/tax; do not fabricate GST or change old invoices. GST activation/tax treatment requires qualified verification.
- Admin toll-free number configuration already appears in source; verify homepage visibility and add/repair only if missing. Future call/IVR provider integration is separate and not implemented.
- Detailed user-confirmed requirements are in `docs/ARJUNA-X-ADMIN-PAYMENT-GST-TOLLFREE-REQUIREMENTS.md`.


## Pass 7 — Role navigation guards and homepage toll-free verification

### Role access/navigation source findings
- `menuGo()` has role mapping for dashboards, admin-only page list, partner-only page list, login intent and post-login role validation. Admin is allowed through partner-required destinations.
- Driver and customer dashboard checks are explicitly enforced inside `menuGo()`.
- Many in-app buttons call `showPage(id)` directly (including admin-dashboard quick-action buttons). `showPage()` is a page visibility/navigation function, not an access guard. This means menuGo role checks are not consistently applied to all navigation paths at the UI layer. Backend RPC/RLS enforcement must still be audited and is not inferred from this finding.
- Driver document review and platform business save functions include explicit Admin checks in source. Other sensitive screens/functions require a per-function guard review.

### Toll-free homepage finding
- Admin Platform Business Settings has Toll-Free input, validates the expected 1800 number format and calls `fr_admin_save_platform_business_details` with the number/GSTIN fields.
- `loadPlatformDetails()` loads the settings and updates Admin fields plus an existing `gstPlatformDetails` text area/notice.
- Source search found no homepage reference to `toll_free_number`, `platformTollFree`, or a toll-free display element. Therefore homepage display is **not currently source-confirmed and appears absent**. This is an identified implementation gap for the planned Phase 8 work, not fixed in Phase 2.

### Phase 2 risk list updated
- Role-specific UI access checks may be bypassed by direct `showPage()` navigation; inventory exact sensitive pages and backend authorization before fixing.
- Toll-free number is Admin-configurable in source but homepage rendering appears absent.
- Subscription gateway is placeholder-only; no server order/webhook verification demonstrated.
- GST configuration exists but statutory invoice behavior is not runtime verified.


## Pass 8 — Supabase migration policy/security source review

Reviewed the five migration files tracked in this branch (source only; not applied):

- TASKO/GIGGER workflow migration: functions use `SECURITY DEFINER`; reviewed function bodies include authentication checks and provider/customer ownership checks, plus Admin membership check for payment verification. Explicit execute grants to `authenticated` found for the three workflow RPCs. This is a source review only; deployed function versions and table RLS status not verified.
- Laundry workflow migration: provider transition function is `SECURITY DEFINER`, checks authenticated user and booking assignment; explicit execute grant to authenticated. No RLS policy definitions were present in this migration file itself.
- Cycle-delivery pricing migration: table has RLS enabled and a SELECT policy for authenticated users where `active=true`. No admin write policy was found in this migration file; the app contains static price calculation and this pricing table's live usage/configuration was not verified.
- Learn/Teach marketplace migration: policies were observed for account self-insert/read and admin update; published-course read/provider own/admin; student request insert/read and admin update; own notification settings and notifications; admin notification insertion. Admin helper checks profile role.
- Learn/Teach provider-policy migration: approved teacher/institute can insert own unpublished course drafts and update own courses while keeping published=false; provider request read policy limits to assigned provider or unassigned requests for approved teacher/institute accounts.

### Security verification limitations
- Migration source is not proof migrations have been applied to the Supabase project.
- Current deployed table RLS policies, function bodies, grants and schema state were not queried; no live database access was used for this inventory pass.
- Review is not a penetration test. Direct-navigation UI gaps from Pass 7 must be matched with backend/RLS/function authorization before release.


## Pass 9 — PWA manifest / icon metadata review

### Manifest findings
- `manifest.webmanifest` is the linked manifest in the app head; it defines FRIEND RIDE name/short name, relative `start_url` and `scope`, standalone display, portrait orientation, and references `icons/icon-192.png` and `icons/icon-512.png` for 192/512 and maskable purposes.
- `manifest.json` is also present but uses GitHub Pages absolute `/friend-ride-/` start/scope, different background/theme colors, and no icons listed.
- The app head observed in `index.html` links `manifest.webmanifest`; duplicate `manifest.json` remains a legacy/conflicting metadata risk if another consumer/host uses it.
- Icon binary visual inspection could not be completed through GitHub connector (binary blob decoding failed). File sizes and paths are known; official logo match, padding, maskable safe-zone and visual quality remain unverified.

### PWA acceptance gaps
- [x] Active linked manifest identified: `manifest.webmanifest`; relative scope/start_url and standalone mode source-verified.
- [x] Local CI smoke: active `service-worker.js` scope, manifest response and declared icon HTTP responses verified (Pass 41).
- [ ] Confirm GitHub Pages/custom-domain installation behavior and manifest paths.
- [ ] Align/remove duplicate legacy `manifest.json` after usage/hosting checks.
- [ ] Visually inspect 192/512 PNGs against official logo, maskable safe-zone and Navy/Orange/White palette.
- [ ] OS install prompt, standalone launch, update/offline behavior and installed-device service-worker scope.
- [ ] FCM token registration, notification permission UX and foreground/background/closed-app delivery on device.
- [ ] Telugu voice/sound, role routing, dedupe, quiet hours and consent matrix.


## Pass 10 — CI workflow triggers and environment safety audit

Four workflows inspected:

- `quality.yml`: push main and PR to main; Node 22; typechecks, runtime build, Node/Vitest tests and Playwright using local static server. No trigger for the Phase 2 ARJUNA X branch.
- `friend-ride-regression.yml`: push main and legacy dark-gold branch, manual dispatch, scheduled run; Node 22; inline-JS check and Playwright local server; uploads report artifacts. No trigger for Phase 2 branch.
- `friend-ride-workflow-regression.yml`: push legacy `pr/workflow-integration-nov08` and PR to main; source checks only. Does not trigger on current ARJUNA X branch.
- `tasko-laundry-main-regression.yml`: push legacy integration branch and PR to main with selected file path filters; Node 20 (other main workflows use Node 22); local server and targeted Playwright. Does not trigger on current ARJUNA X branch.

### CI findings
- Existing workflows run locally served app targets for Playwright, which avoids accidental production target in those workflows.
- Branch trigger coverage is legacy/main-focused; current ARJUNA X QA branch does not automatically receive all existing CI workflows.
- Node version drift (20 vs 22) exists across workflows.
- Workflow run results for this branch were not fetched/executed in this inventory pass. Source inspection only.
- CI trigger alignment and safe QA branch workflow need a separate approved implementation task; no workflow changed in Phase 2.

## Phase 2 completion checklist
- [x] Repository tree and tracked file count inventoried.
- [x] App entry and architecture footprint identified.
- [x] Existing test scripts and Playwright config reviewed.
- [x] CI workflows and trigger gaps inventoried.
- [x] PWA/manifests/service-worker files identified.
- [x] Branding/logo assets filenames inventoried; visual identity binary verification pending.
- [x] Legacy/conflicting UI and test docs identified.
- [x] User Blueprint roles/modules/workflow source reviewed.
- [x] Notification source files reviewed (registration and duplicate-worker risks recorded).
- [x] Existing QA specs reviewed for simulated vs actual workflow evidence.\n- [x] CI workflow/test evidence classification and branch-trigger gaps reviewed.\n- [x] Migration files reviewed at source level; none applied.\n- [x] Read-only SQL QA script reviewed; not executed.
- [x] Full SPA page ID inventory (58 screens) source-extracted; role-access verification remains open.
- [ ] Visual inspection of icon assets and confirmation whether uploaded logo is already present (binary fetch inspection blocked).
- [x] Supabase tables/RPC/external endpoints source-call inventory extracted; detailed contracts and role-permission verification remain open.
- [x] Notification registration/worker/fallback source audit pass completed; dispatch/deployment/device verification remains open.
- [ ] Phase 2 final review/acceptance.
- [x] Pass 7: role navigation guard gaps and homepage toll-free rendering absence documented.
- [x] Pass 8: migration authorization policy source review documented.
- [x] Pass 9: PWA manifest conflicts and icon visual-inspection limitation documented.
- [x] Pass 10: CI trigger and Node-version drift documented.

## Current status
**Phase 2 — IN PROGRESS (inventory passes 1–10 committed).** Repository/config/docs, 58 SPA page IDs, source-call table/RPC inventory, notification pipeline source, role navigation checks, migration-policy source review, PWA manifests, and CI trigger/environment audit have been documented. Remaining items: role/backend permission and RPC contract verification, visual logo/icon verification, homepage toll-free confirmation/fix planning, notification server dispatch/deployment/device testing, and Phase 2 final acceptance. No runtime app code, backend, database, auth, payments, main, or live deployment was changed.


## Pass 11 — Client RPC contract inventory (source extraction)

### Scope and method
- Extracted direct `.rpc('name', ...)` call sites from the branch's `index.html` source.
- This is a client-call inventory only. It does **not** prove deployed function existence, SQL argument/signature compatibility, grants, RLS, or runtime success.
- **57 unique RPC names** were found in the current source extraction. Repeated call sites were deduplicated.

### RPC names (alphabetical)
```text
accept_counter_offer
accept_ride
admin_list_driver_applications
admin_list_driver_documents
admin_review_driver
admin_review_driver_document
counter_offer_ride
decline_counter_offer
fr_admin_list_partner_applications
fr_admin_review_partner
fr_admin_save_platform_business_details
fr_customer_accept_market_quote
fr_customer_counter_market_order
fr_customer_create_parcel_request
fr_customer_create_ride_payment
fr_customer_create_service_request
fr_customer_get_parcel_delivery_otp
fr_customer_list_approved_service_providers
fr_customer_list_approved_stores_geo
fr_customer_list_market_orders
fr_customer_list_nearby_drivers
fr_customer_list_parcel_requests
fr_customer_list_partner_catalogue
fr_customer_market_payment_details
fr_customer_place_market_order
fr_customer_place_multi_market_order
fr_customer_store_payment_options
fr_customer_submit_ride_transaction
fr_customer_tick_market_payment
fr_driver_accept_parcel
fr_driver_complete_ride
fr_driver_confirm_parcel_payment
fr_driver_confirm_ride_payment
fr_driver_list_parcel_requests
fr_driver_save_payment_qr
fr_driver_start_ride
fr_driver_verify_parcel_delivery_otp
fr_get_platform_business_details
fr_get_ride_payment_state
fr_laundry_provider_transition
fr_partner_confirm_market_payment
fr_partner_list_catalogue
fr_partner_list_market_orders
fr_partner_quote_market_order
fr_partner_save_catalogue_item
fr_partner_save_location
fr_partner_save_payment_details
fr_partner_update_market_order
fr_public_homepage_feedback
fr_register_driver_partner
fr_tasko_admin_verify_payment
fr_tasko_provider_transition
fr_tasko_submit_payment
get_driver_requests
get_ride_customer_details_v2
get_ride_driver_details
get_ride_payment_details_v1
````

### Source-level security observations
- Some admin/role call sites have explicit client-side role checks before invoking RPCs (driver/partner approvals, platform business settings, TASKO admin actions, Laundry admin).
- Client-side checks are **not** authorization controls by themselves. Backend authorization, grants, SECURITY DEFINER function checks, ownership validation and RLS must be independently checked against deployed SQL.
- Direct page navigation handlers can bypass menu role mapping in some cases (Pass 7); do not treat the UI as the security boundary.
- This inventory did not execute any RPC or query the live Supabase project.

### Requirements mismatch found for later verification
- The source UI text for ride QR payment currently says the QR/payment session is valid for **15 minutes**. The scope lock earlier requires **5-minute QR validity**. This is a source-level mismatch; server expiry and deployed behavior are not verified. Record as a release blocker for Phase 5/10 until the intended duration is confirmed and tested.

### Next audit items
- Match all 57 client RPC calls against SQL migrations/functions and deployed function signatures/grants (deployed status remains unavailable in this audit).
- Confirm payment session/QR expiry behavior server-side and align UI text with the locked requirement.
- Complete role guard/navigation and backend authorization matrix; do not infer security from client code.
- Continue notification registration/dispatch and logo/icon visual inspection; Phase 2 acceptance remains open.


## Pass 12 — RPC definition availability in tracked SQL

### Method and result
- Reviewed the six tracked SQL files discovered in the repository tree: one ride-contact fix SQL, four service/marketplace migrations plus the provider-policy migration, and the read-only QA SQL was not counted as function-definition source.
- Extracted **8 function definitions** from the five SQL source files inspected (including one helper not called by the client): `get_ride_driver_details, get_ride_customer_details, get_ride_customer_details_v2, fr_tasko_provider_transition, fr_tasko_submit_payment, fr_tasko_admin_verify_payment, fr_laundry_provider_transition, fr_learn_teach_is_admin`.
- Only **6 of the 57 client RPC names** have a matching definition in the inspected tracked SQL files: `fr_laundry_provider_transition, fr_tasko_admin_verify_payment, fr_tasko_provider_transition, fr_tasko_submit_payment, get_ride_customer_details_v2, get_ride_driver_details`.
- **51 client RPC names are not defined in the inspected tracked SQL source**. This is a source-availability gap only. It does not prove the RPCs are missing from the Supabase project; many may be pre-existing deployed functions or maintained elsewhere.

### Names without a definition in the inspected tracked SQL set
```text
accept_counter_offer
accept_ride
admin_list_driver_applications
admin_list_driver_documents
admin_review_driver
admin_review_driver_document
counter_offer_ride
decline_counter_offer
fr_admin_list_partner_applications
fr_admin_review_partner
fr_admin_save_platform_business_details
fr_customer_accept_market_quote
fr_customer_counter_market_order
fr_customer_create_parcel_request
fr_customer_create_ride_payment
fr_customer_create_service_request
fr_customer_get_parcel_delivery_otp
fr_customer_list_approved_service_providers
fr_customer_list_approved_stores_geo
fr_customer_list_market_orders
fr_customer_list_nearby_drivers
fr_customer_list_parcel_requests
fr_customer_list_partner_catalogue
fr_customer_market_payment_details
fr_customer_place_market_order
fr_customer_place_multi_market_order
fr_customer_store_payment_options
fr_customer_submit_ride_transaction
fr_customer_tick_market_payment
fr_driver_accept_parcel
fr_driver_complete_ride
fr_driver_confirm_parcel_payment
fr_driver_confirm_ride_payment
fr_driver_list_parcel_requests
fr_driver_save_payment_qr
fr_driver_start_ride
fr_driver_verify_parcel_delivery_otp
fr_get_platform_business_details
fr_get_ride_payment_state
fr_partner_confirm_market_payment
fr_partner_list_catalogue
fr_partner_list_market_orders
fr_partner_quote_market_order
fr_partner_save_catalogue_item
fr_partner_save_location
fr_partner_save_payment_details
fr_partner_update_market_order
fr_public_homepage_feedback
fr_register_driver_partner
get_driver_requests
get_ride_payment_details_v1
```

### Release/security implications
- The repo alone is insufficient to prove exact argument contracts, deployed function existence, SECURITY DEFINER behavior, grants, or authorization for these RPCs.
- No live database or deployed function metadata was accessed. No SQL was run or applied.
- Phase 2 cannot mark the RPC/backend authorization audit complete until the function source/contract evidence is available or this limitation is formally accepted for Phase 2, with live QA still required in Phase 10.


## Pass 13 — PWA manifests, worker implementation and push setup reconciliation

### Manifest mismatch confirmed
- `manifest.webmanifest` uses relative `./` start/scope and light theme colors (`#f4f6fb`); it includes 192/512 icon declarations and maskable purpose.
- `manifest.json` uses absolute GitHub Pages subpath `/friend-ride-/` and dark theme colors (`#101827`), but has no icon declarations.
- The two manifests therefore disagree on start/scope and theme, and may be deployment-host-specific. Which manifest the HTML actually links and which is active on the custom domain still requires full HTML/host verification. Do not consolidate during inventory without preserving the intended deployment paths.

### Worker behavior and documented setup conflict
- `fcm-web-push.js` registers `./service-worker.js`, requests permission on user click, obtains FCM token, and calls `fr-notification-register-token` with an authenticated access token.
- `service-worker.js` has Firebase background handling and generic PushEvent handling; the generic handler ignores payloads it recognizes as FCM to avoid duplicate handling. It contains notification categories and Telugu copy, but no verified TTS/voice playback or marketing-frequency/consent logic in the inspected file.
- `firebase-messaging-sw.js` is also a Firebase worker, but the inspected opt-in script does not register it.
- `sw.js` separately handles generic push and notification clicks and deletes caches except its own cache on activation. Multiple workers remain a scope/registration risk.
- `FCM-WEB-PUSH-SETUP.md` instructs registering `/firebase-messaging-sw.js` and says its apiKey/appId are placeholders, while the inspected source worker/config has values and the opt-in script explicitly registers `service-worker.js`. This documentation/runtime inconsistency is confirmed. Firebase config values are public client config; no private key was exposed in this pass.
- README describes a different/older notification setup and says background push is not fully activated by these files alone. Treat delivery as unverified until the deployed Edge Function, token storage, and device tests are confirmed.

### Confirmed notification release risks
1. Worker registration path mismatch across setup doc and opt-in code.
2. Multiple worker candidates and overlapping PushEvent handlers.
3. Token registration endpoint response contract is only client-assumed; deployed Edge Function source was not inspected.
4. Foreground new Notification usage and worker notifications may have differing click/deep-link behavior.
5. Telugu TTS, user sound/voice settings, hourly opted-in marketing cadence, quiet hours, and marketing opt-out are requirements but not demonstrated by inspected runtime code.
6. Lock-screen delivery and app-closed delivery are not verified; browser/OS restrictions apply.

### Phase 2 status update
- This pass adds source-backed reconciliation only. No runtime code, PWA manifest, worker, Supabase, auth, payment, main branch or live deployment changed.
- Inventory acceptance remains OPEN because full HTML route/role guard inspection, visual logo/icon verification, deployed backend contract/authorization evidence, and notification runtime/device behavior are outstanding.


## Pass 14 — CI workflow branch triggers and safe test-target review

### Workflow trigger matrix (confirmed from current branch source)
- `.github/workflows/quality.yml`: runs only on push to `main` and PRs targeting `main`; Node 22; starts local static server for Playwright and sets `FRIEND_RIDE_BASE_URL` to localhost.
- `friend-ride-regression.yml`: push to `main` or legacy `ui/full-native-dark-gold-2026-11-21`, manual dispatch, and daily schedule; Node 22; local server and explicit localhost base URL; uploads report artifacts.
- `friend-ride-workflow-regression.yml`: push to legacy `pr/workflow-integration-nov08`, PRs to `main`; source checks only; no full browser workflow.
- `tasko-laundry-main-regression.yml`: push to legacy `integration/tasko-laundry-main-safe`, PRs to `main` with scoped paths; Node 20; local server; targeted Playwright.

### Findings
1. None of the inspected workflow push triggers explicitly include the ARJUNA X Phase 2 branch.
2. Browser workflows use local static-server targets in CI, which is safer than the Playwright production default. Manual local runs still need an explicit `FRIEND_RIDE_BASE_URL` override.
3. Node version inconsistency remains: three workflows use Node 22, targeted TASKO/Laundry uses Node 20.
4. The Play Store release gate is an older main-branch audit (2026-11-09) and its stated CI/backend inventory must not be treated as current Phase 2 verification.
5. Workflows were source-inspected only. No Actions run was started, no test result is claimed.

### Phase 2 status
Inventory has been extended through Pass 14. Still open: reliable full route/guard source extraction, actual logo/icon visual verification, notification and PWA runtime registration proof, deployed RPC/Edge Function contracts and authorization, and actual CI/test evidence. Phase 2 remains IN PROGRESS; no runtime changes or live deployment.


## Pass 15 — Route registry evidence and QA spec scope audit

### Route/page IDs found in the legacy Dark-Gold route QA spec
The spec declares **58 route/page IDs** (including the newer `frSuperHub`) and **30 shared-customer route IDs**. The declared list includes home, rides/scheduled, goods/parcel/food/catalogue, shops/shopping/market cart, home services/laundry, orders/tracking/wallet/offers, role dashboards, partner orders/products/inventory/catalogue/reports/subscription/referrals, GST, Admin dashboards/CRM/users/approvals/reports/settings, profile/notifications/support/about/cart, feedback, Learn/Teach, banking/event/cycle-delivery/service registration, parcel release and Super Hub. This is a spec-derived list only; a complete live DOM reconciliation is not yet possible from the oversized root HTML through the current connector.

### Test evidence vs authority
- `qa/friend-ride.spec.cjs` tests role launcher (four cards), role routing self-test, local diagnostics, simulated QA page, support/feedback, partner GPS/store map, bank enquiries, and includes additional tests later in the file. Source inspection only; no test executed in this pass.
- `qa/tasko-laundry.spec.cjs` tests service entries, pricing UI and handler presence, Laundry types/unit mapping and unauthenticated guard. It does not prove authenticated backend writes.
- `qa/tasko-laundry-main-regression.spec.js` stubs navigation/auth and blocks external requests; verifies category routing and admin panel handler presence. It is explicitly isolated/mock-oriented.
- `tests/learn-teach-marketplace.spec.js` uses a hard-coded localhost URL and checks landing/category labels; current Playwright config baseURL override does not change its hard-coded URL. This test's server requirement/target must be verified in the CI workflow before execution.
- `qa/dark-gold-route-regression.spec.js` contains a 58-route list and UI checks asserting Dark-Gold theme variables and native-home markers. **These assertions are legacy Dark-Gold artifacts and conflict with the ARJUNA X Navy/Orange/White scope lock.** Do not treat this suite as authoritative for ARJUNA X acceptance; it must be replaced/retargeted later, not used to force Dark-Gold runtime changes.

### Source access limitation
- The root `index.html` is about 1 MB and current GitHub file connector retrieval is unreliable for full-source route/role-guard analysis. The 58 route names are from an existing QA spec, not independently verified against the actual root DOM.
- Binary icon files are listed in the tree, but the current GitHub connector cannot visually render/inspect PNG binaries in this inventory pass.

### Phase 2 open blockers reaffirmed
1. Complete source extraction or a safe local clone/readable slice of `index.html` to verify every page ID, role guard, registration form fields, and profile photo logic.
2. Visual inspection of official logo/icon files and app asset mapping.
3. Reconcile legacy Dark-Gold QA artifacts with the locked Navy/Orange/White direction without changing app runtime in Phase 2.
4. Current CI workflow run evidence and branch trigger coverage.
5. Live/deployed RPC/Edge Function contracts, authorization, push delivery and PWA registration evidence.

No runtime code, Supabase, schema, auth, payment, main branch or live deployment was changed. Phase 2 remains IN PROGRESS.


## Pass 16 — Root SPA source chunk extraction (registration, role routes, notification UI)

The GitHub connector successfully returned targeted line ranges of `index.html` for this pass, enabling source verification beyond the earlier full-file limitation.

### Verified root HTML facts
- Root `index.html` declares `lang="te"`, links `manifest.webmanifest`, and its current title/version marker is `FRIEND RIDE V11.1 PRO` / `11.1-PRO-category-routing-learning-isolation`.
- The source currently uses legacy purple theme variables (`--purple`, `--purple2`, purple backgrounds) and a light lavender body. This is source evidence; ARJUNA X Navy/Orange/White is not yet implemented in runtime.
- Existing role route sections `customerDashboard`, `driverDashboard`, `partnerDashboard`, and `adminDashboard` are present in the inspected source ranges. The customer dashboard has Book Ride, My Orders, Wallet and My Profile entry points.
- `showPage(id)` toggles `.active` on page sections and bottom-nav buttons; the extracted implementation has admin-specific UI handling for TASKO/Laundry panels, map initializers and several page-specific loaders. This is a navigation/source observation, not an authorization audit.
- `notifications` screen contains Enable Notifications, sound-preview buttons for order/ride/customer, permission status and recent activity feed. It does not by itself prove locked/closed-app delivery.

### Existing registration fields — source verified
**Customer:** optional profile photo (JPG/PNG/WEBP, maximum 3 MB, camera capture hint), complete address, SMS registration OTP.

**Driver registration group:** required driver photo, Driving Licence, Aadhaar, Vehicle RC; optional UPI ID and payment QR; registration OTP. The dashboard separately exposes vehicle type, model, registration number, licence number, experience and document upload controls. Source text says Aadhaar number is not stored in profile in the driver dashboard upload path.

**Partner registration group:** required owner photo, business category, business/store name, business address, GPS capture (latitude/longitude read-only), optional business proof, catalogue note and registration OTP. Categories include grocery/general, electrical, electrician, hardware/plumbing, chicken, meat, fish, produce, medical, dairy, mobile/accessories, bakery, stationery, restaurant/tiffin, other.

**Technician registration:** required passport photo, profession, full name, mobile, work experience, complete address, Aadhaar number/file, mandatory PhonePe number; optional UPI and QR. The inspected validator explicitly alerts that private storage and Admin approval backend mapping are not connected.

**Admin:** registration button is hidden for Admin role in the extracted auth source. Admin access text says verification is against `admin_users`.

### Registration implementation gap (confirmed in source)
- Customer photo preview validation is present (JPG/PNG/WEBP, 3 MB max).
- Driver dashboard save handler `saveDriverDetails()` currently validates registration/licence number then shows an alert saying private document storage/profile schema mapping is not yet connected in that path. This is distinct from the previously inventoried registration upload handler and KYC upload asset; do not assume every driver-details UI path is wired.
- Technician registration validator checks fields/files and then shows an alert explicitly saying private storage/Admin approval backend SQL still needs connection.
- Partner GPS capture and dashboard save functions exist and are tested for handler presence; actual authenticated writes still need live evidence.

### Phase 2 update
This pass materially reduces the root-HTML inspection gap, but full source remains too large to reliably retrieve in one pass. Continue targeted chunk extraction for customer/driver/partner auth verification, route list reconciliation, customer photo/avatar rendering, role checks, notification tone assets, and the remaining UI-to-backend placeholder alerts. No runtime code/backend/schema/auth/payment/main/live changes made.


## Pass 17 — Legacy route regression spec compatibility audit

### Source-verified findings
- The existing `qa/dark-gold-route-regression.spec.js` declares a 58-ID `allPageIds` array and a 30-ID `sharedCustomerRoutes` array. These are test-spec lists, not independently confirmed runtime DOM counts.
- The suite is explicitly titled `FRIEND RIDE in-place Dark + Gold UI` and asserts legacy design markers including `fr-dark-gold-design-system`, `theme-color #050b17`, and Dark-Gold assumptions. This is incompatible with the ARJUNA X locked Navy Blue + Orange + White direction and must not be treated as a release gate for the current design.
- Existing test coverage in the inspected first section includes screen presence/design markers, live-location text mirroring, customer/driver/partner registration entry points and home service-card navigation. Because the design assertions are obsolete, a failure may be a stale-test failure rather than an ARJUNA X regression; tests should be split/retargeted without weakening genuine route/function coverage.
- Repository tree confirms the four existing workflows previously inventoried; no branch trigger or CI run evidence was obtained in this pass.

### Phase 2 disposition
This audit confirms an additional test-authority mismatch. The 58 route IDs remain a provisional source list until runtime DOM IDs, role access, navigation and all route pages are reconciled. The legacy Dark-Gold regression is not authoritative for ARJUNA X. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; Phase 3 implementation cannot be considered complete based on this source audit alone. No runtime/backend/schema/auth/payment/main/live changes made.


## Pass 18 — PWA manifests, service-worker and notification opt-in source audit

### Source verified
- The root HTML links `manifest.webmanifest` (verified in Pass 16). That manifest uses relative `./` start URL/scope, standalone display, portrait orientation, light colors, and icon references to `icons/icon-192.png` and `icons/icon-512.png`.
- A second `manifest.json` exists with absolute GitHub Pages subpath `/friend-ride-/`, dark colors, standalone display, and no icon declarations. It is not the manifest linked in inspected root HTML; the duplicate is a configuration drift risk.
- The repository tree contains only two image assets by extension: `icons/icon-192.png` and `icons/icon-512.png`. The official supplied logo binary was not verified; icon image contents were not visually inspected in this pass.
- `service-worker.js` imports Firebase compat SDK and registers an FCM background handler, plus generic PushEvent handling that skips payloads identified as FCM to avoid duplicate handling. It also includes install/activate behavior.
- `firebase-messaging-sw.js` is a second FCM worker with its own background handler and notification click handling.
- `sw.js` is a third service-worker source with generic push notification and click handling, plus cache cleanup. These three worker sources create a potential overlapping-worker/configuration risk; runtime registration scope/active worker was not verified.
- `fcm-web-push.js` source contains Firebase config, VAPID public key, Supabase URL and publishable/anon client key, and a notification opt-in UI. These are public client configuration values, not private server credentials. Actual token registration, server delivery, locked/background/closed-app behavior and device permission lifecycle remain unverified.

### Phase 2 status
PWA and push source inventory is more complete, but runtime registration/delivery proof, exact manifest-to-deployment behavior, icon/logo visual verification, and server-side notification contract evidence remain open. Phase 2 is **IN PROGRESS / NOT ACCEPTED**. No runtime code, backend, schema, auth, payment, main or live deployment changed.


## Pass 19 — CI workflow triggers, test-target and toolchain audit

### Verified workflow configuration
- `.github/workflows/quality.yml`: push and PR targeting `main`; Node 22; typecheck/core typecheck/runtime build/unit/core tests; Playwright Chromium E2E; static local server with `FRIEND_RIDE_BASE_URL=http://127.0.0.1:4173`.
- `.github/workflows/friend-ride-regression.yml`: push branches `main` and legacy `ui/full-native-dark-gold-2026-11-21`, manual dispatch, daily schedule; Node 22; inline JS check, npm install, local static server, `npm test`, report artifacts.
- `.github/workflows/friend-ride-workflow-regression.yml`: push to legacy `pr/workflow-integration-nov08`, PR targeting main; source checks only (inline JS and learn-teach JS syntax).
- `.github/workflows/tasko-laundry-main-regression.yml`: push to legacy `integration/tasko-laundry-main-safe`, PR to main with specified path filters; Node 20; inline JS check and isolated TASKO/Laundry/Admin Playwright spec.

### ARJUNA X CI gap
None of the four inspected workflow trigger lists explicitly includes the active `arjuna-x/phase-2-repository-assets-inventory` branch. Therefore these workflow definitions do not provide automatic push regression coverage for this active branch. Node 20 vs 22 toolchain inconsistency also remains. No workflow was run in this audit; no run status is claimed.

### Phase 2 disposition
CI trigger alignment, branch-specific test execution and toolchain decision remain open acceptance items. No runtime/backend/schema/auth/payment/main/live changes made.


## Pass 20 — Existing QA specs: coverage boundaries and mock/live separation

### Source verified from the test files
- `qa/friend-ride.spec.cjs` includes role launcher (4 cards), role menu-to-OTP routing, self-test role mapping, local runtime diagnostics, automated QA simulation/live-only separation, complaint/feedback UI, and partner GPS/store-map handler-presence checks.
- The QA page test explicitly expects simulated results (`SIM ·`), at least 10 deterministic simulation entries, 15 source audit entries, and separate LIVE ONLY coverage. It checks that simulated Cashfree/KYC constraints remain blocked. This does not validate real payment/KYC backend behavior.
- The partner GPS/map test verifies element and handler presence; this alone does not prove geolocation permission, real GPS acquisition, persisted coordinates or map tiles.
- `qa/tasko-laundry.spec.cjs` checks visible service entries/pricing, service-type unit changes (kg/piece), handler presence, and an unauthenticated booking guard. No authenticated booking write is exercised in the inspected spec.
- `qa/tasko-laundry-main-regression.spec.js` is intentionally isolated: blocks external requests, overrides current user/login and `showPage` navigation, and checks shop category route intent/entry panel presence. It is a mocked navigation regression, not a production-auth/backend test.

### Phase 2 disposition
Test inventory now records boundaries between source assertions, simulation, isolated/mock behavior and live-only checks. Test execution and current CI status are still not evidenced in this audit. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. No runtime/backend/schema/auth/payment/main/live changes made.


## Pass 21 — Root runtime source: worker registration and role-gate reconciliation

### Worker registration source findings (root `index.html`)
- A page-load registration at source line 2276 registers `./service-worker.js`.
- Notification enablement function `frEnableDeviceAlerts` requests browser notification permission then registers the same worker at line 2271.
- A separate push-subscription flow around lines 2566–2571 also requests permission, registers `./service-worker.js` with `updateViaCache:'none'`, waits for `navigator.serviceWorker.ready`, and calls update.
- Thus the root app has multiple source paths for registration of the same worker. Duplicate registration of the same script/scope is usually idempotent, but the paths have different options and UX. Runtime active worker, scope, and delivery behavior are not proven by source inspection.
- This source links the generic/Firebase worker named `service-worker.js`; other worker files exist in the tree but their active registration is not evidenced in the inspected root source.

### Role-gate source findings
- `menuGo` maps the four dashboard IDs to customer/driver/partner/admin and defines admin-only and partner-only menu page groups.
- It checks role before opening protected page for both login callback and already-authenticated user. Admin is explicitly allowed for partner-required pages.
- Customer and driver dashboards also have explicit role checks. This is client-side UI source evidence only; backend RLS/auth authorization remains unverified.
- Existing role routing QA asserts these handlers/mappings and source fragments; it does not prove deployed auth or server permission enforcement.

### Phase 2 disposition
Source audit advances registration and role-gate reconciliation, but runtime worker activation, push subscription delivery, lock-screen/background delivery, role session enforcement and server-side permissions remain open evidence items. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. No runtime/backend/schema/auth/payment/main/live changes made.


## Pass 22 — Runtime page IDs versus QA route inventory reconciliation

### Exact source reconciliation
- Extracted all `<section id="..." class="page">` page IDs from root `index.html` and compared against `allPageIds` in `qa/dark-gold-route-regression.spec.js`.
- Runtime source contains **55 page sections**; QA spec lists **58 IDs**.
- Missing from spec: none.
- Stale spec IDs: home, crmDashboard, frSuperHub.
- Exact list match: **NO**.

### Scope/limitations
- The route spec file is named and styled for a Dark + Gold rollout. Its design-system/theme assertions are not authoritative for the currently locked Navy Blue + Orange + White design. Its page-ID list is useful inventory only; tests should be retargeted before being treated as release-gate evidence.
- Page IDs were source-reconciled only. Visibility, role permissions, real click navigation, backend integration and route activation still require runtime tests.

### Supabase repository inventory
- Repository tree contains five migration files: TASKO/GIGGER workflow, Laundry workflow, Cycle Delivery pricing, Learn & Teach marketplace, and Learn & Teach provider policies.
- Migration source inspection confirms these are schema/policy change files; no migrations were applied during this audit. Deployed database state, RPC/Edge Functions and current RLS behavior are not verified through repository source.

### Phase 2 disposition
Route ID reconciliation is complete at source level (58/58 list match). Design-system test retargeting, asset binary/visual validation, runtime worker/push evidence, deployed Supabase contract/RLS evidence and CI run evidence remain open. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. No application or database code changes.


## Pass 23 — Corrected runtime page count and asset/theme verification boundary

### Correction to Pass 22 wording
- The Pass 22 comparison correctly identified three stale IDs (`home`, `crmDashboard`, `frSuperHub`) and zero runtime IDs missing from the QA list, but its summary incorrectly called the runtime count 58.
- Re-extraction using exact `<section id="..." class="page"` pattern confirms **55 actual runtime page sections**, **58 IDs in the legacy QA spec**, **0 runtime page IDs missing from spec**, and **3 stale IDs**.
- Exact list match is **NO**. The spec contains 55 matching IDs plus the 3 stale IDs. This correction supersedes the inaccurate runtime count in Pass 22.

### Asset inventory status
- Git tree confirms two PNG files: `icons/icon-192.png` (2,852 bytes) and `icons/icon-512.png` (3,392 bytes), with tracked SHA values recorded in tree metadata.
- Binary retrieval/visual inspection could not be completed through the available GitHub fetch path. Therefore, whether they are official FRIEND RIDE branded assets, correct artwork, transparent, correctly sized, or visually suitable remains **UNVERIFIED**. No image claims are made.
- Root `index.html` source does not contain the old QA spec's `fr-dark-gold-design-system` or `#050b17` assertions. The source inspected has theme-color `#24105f`; this confirms the legacy Dark+Gold QA assertions are stale relative to current source, and the intended locked Navy Blue + Orange + White design is not verified/implemented by this audit.
- The inspected root source includes legacy location text `Tap to detect your location` and `useHomeLocation()`; this is source evidence only, not a runtime GPS proof.

### Phase 2 disposition
The page-ID inventory is source reconciled with corrected counts; asset visual validation and design-system implementation/test alignment remain blockers. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. No runtime, backend, schema, auth, payment, main or deployment changes.


## Pass 24 — FRIEND RIDE icon direction and asset pack prepared

### Design direction applied to a new draft asset
- Prepared a new draft icon artwork using the locked Navy Blue + Orange + White palette.
- Visual concept: FR lettermark, location-pin/road motif and mobility silhouettes; branded FRIEND RIDE text/tagline are included in the full draft image.
- Generated and exported resized PNG variants: 192×192, 512×512, 1024×1024, plus a 512×512 maskable variant with centered safe-area padding.
- These assets are prepared for review and are **not yet installed into the app or committed as binary assets**. The GitHub text-file connector used in this audit does not support binary PNG commits, so existing manifest references are deliberately unchanged to avoid broken PWA icon paths.
- Existing repository icon artwork still needs direct visual comparison and binary replacement through a binary-capable Git workflow; final browser/PWA install validation is pending.

### Pass 24 disposition
Draft icon pack prepared locally. No app runtime, manifest, backend, schema, auth, payment, main branch or live deployment changed. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 25 — PWA icon manifest integration review

### Verified manifest facts
- Active root `manifest.webmanifest` currently references `icons/icon-192.png` and `icons/icon-512.png`.
- It declares the 192 icon with `purpose: any maskable`, the 512 icon with `purpose: any`, and references the same 512 file again as `purpose: maskable`.
- Manifest `background_color` and `theme_color` are both `#f4f6fb`; icon replacement alone would not update the app launch/theme colors to the locked Navy/Orange/White palette.
- The newly prepared draft icon files are not committed in this branch. The binary-capable replacement workflow is still needed before changing manifest icon references or runtime assets.

### Safe disposition
- Do not edit manifest yet: existing binary paths are present and changing to unavailable/uncommitted assets could break installability.
- Next safe step when binary assets can be committed: replace 192/512 files, provide a separate maskable-safe 512 PNG, then update manifest purpose and palette fields and verify on local isolated PWA install/test.
- No application code, manifest, backend, schema, auth, payment, main branch or live deployment changed in this pass.

### Pass 25 status
Manifest integration review is documented; icon binary integration and install verification remain pending. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 26 — Phase 2 acceptance gate and isolated test execution boundary

### Revalidated branch/test constraints
- Latest inventory source is on the Phase 2 QA branch. Package scripts provide unit, core, typecheck, runtime-build, and Playwright suites.
- This connector session can read repository files and make text-file commits, but it does not provide a checkout/command execution environment for the repository. Therefore no npm install, unit test, typecheck, build, Playwright, browser/PWA install, or CI workflow run was executed in this pass.
- Playwright's configured default baseURL is production; any future local execution must explicitly set FRIEND_RIDE_BASE_URL to an isolated local server. Do not run mutation-capable tests against production.

### Phase 2 acceptance gate — current status
1. **Icon/official logo visual validation — OPEN.** PNG sizes/SHA verified; binary artwork and maskable safe-zone not visually inspected; supplied logo not confirmed in repo.
2. **Route inventory/runtime baseline — SOURCE + LOCAL CI VERIFIED.** 58 page IDs reconcile (0 missing/extra/duplicate) and all activate via router in isolated Playwright. Role launcher/router tests pass; full authenticated role/permission E2E remains open.
3. **PWA — PARTIAL.** Local CI verified active root `service-worker.js`, linked manifest and icon HTTP responses. Device install, update/offline and push/background/closed-app matrix remain open.
4. **Backend authorization — PARTIAL.** Production/QA projects healthy; migration/table/RLS metadata verified; 18 production functions sampled, SECDEF grants heuristic screened. Full function/grant/RLS/Edge secret audit remains open. Production leaked-password protection is disabled (owner review).
5. **QA environment wiring — OPEN.** App source hardcodes production Supabase; separate QA project not wired. CI blocks external API traffic, so live auth/payment/ride integration E2E is not available safely.
6. **CI alignment — VERIFIED for the active Quality Gate.** Run #713 on `8f74189` completed SUCCESS: 48 Playwright tests; typecheck/core typecheck; runtime build; Node unit 7/7; Vitest 5/5. Branch protection/required checks remain disabled, so checks are not enforced as a merge gate.
7. **Legacy theme tests — RETARGETED FOR ACTIVE SUITE.** Dark+Gold spec archived/excluded; functional tests and route baseline retained. Phase 3 must add Navy/Orange/White UI checks.
8. **Repository governance — OPEN.** Rulesets query 0; required checks/branch protection disabled. Owner policy/approval needed.
9. **Phase 2 disposition — NOT ACCEPTED.** Remaining evidence above must be closed before Phase 3. No main merge/live deploy.

### Safe next actions
- Obtain binary-capable access/inspection to verify official icon artwork; do not replace icons or manifest without visual evidence.
- Complete isolated PWA install/update/offline and device notification matrix.
- Complete RLS/SECDEF grants and Edge secret configuration audit; review leaked-password protection and OTP abuse controls with owner.
- Introduce an approved QA-only app config to target the separate QA Supabase project; keep production config and auth/payment contracts unchanged.
- Get owner-approved branch protection/required-check policy.
- After Phase 2 acceptance, begin Phase 3 App Shell & Design System (Navy/Orange/White) in sequence.

### Pass 26 disposition
Phase 2 acceptance remains **IN PROGRESS / NOT ACCEPTED**. No runtime app code, binary assets, manifest, backend, schema, auth, payment, main branch, or deployment changed. No tests were run; no test results are claimed.


## Pass 27 — CI workflow trigger and local-test safety review (fresh fetch)

### Freshly verified workflow facts
- `.github/workflows/quality.yml`: push/PR only to `main`; Node 22; npm install; typecheck/core typecheck/runtime build/unit/core tests; Chromium Playwright against local server with explicit `FRIEND_RIDE_BASE_URL`.
- `.github/workflows/friend-ride-regression.yml`: push to `main` and legacy `ui/full-native-dark-gold-2026-11-21`; manual dispatch; scheduled run at 02:17 UTC daily; Node 22; inline-JS check; local server; `npm test`; reports uploaded.
- `.github/workflows/friend-ride-workflow-regression.yml`: push legacy `pr/workflow-integration-nov08`, PR main; Node 22; inline JS and Learn/Teach syntax checks only.
- `.github/workflows/tasko-laundry-main-regression.yml`: push legacy `integration/tasko-laundry-main-safe`, PR main with paths; Node 20; targeted TASKO/Laundry/Admin Playwright.

### Branch safety decision
- Active ARJUNA X Phase 2 branch remains absent from these push trigger lists. The general regression workflow supports manual dispatch and scheduled runs, but no run evidence was retrieved in this pass.
- Do not broaden push triggers to ARJUNA X yet: the general regression suite includes legacy theme assertions and workflow/test readiness has not been verified against this branch. First retarget the suite preserving functional checks, then align branch triggers as a separate reviewed change.
- CI Node version inconsistency (20 vs 22) remains; do not change toolchain without checking lockfile/dependency compatibility.

### Pass 27 disposition
Workflow definitions were freshly fetched and compared. No CI run was started, no workflow file was modified, and no test result is claimed. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. No app runtime, backend, schema, auth, payment, main or deployment changed.


## Pass 28 — Test entry-point inventory re-confirmed

Freshly fetched `package.json` from the active Phase 2 branch. Confirmed test/build/typecheck entry points: `npm test` (Playwright), `npm run test:unit` (Node test runner `tests/*.test.cjs`), `npm run typecheck`, `npm run typecheck:core`, `npm run build:runtime` (TypeScript output to `assets/ride-contact.js`), and `npm run test:core` (Vitest). These commands are inventory only; they were not executed in this continuation because no checkout/command runtime is available through the GitHub text connector. Before any runtime build, verify working tree/branch and generated artifact handling locally or in isolated CI to avoid unreviewed generated-file changes. Phase 2 remains IN PROGRESS / NOT ACCEPTED. No runtime app code, backend, schema, auth, payment, main branch, or deployment changed.


## Pass 29 — QA spec coverage and test realism audit

Freshly fetched QA source specs from the active Phase 2 branch:
- `qa/friend-ride.spec.cjs`: checks page boot/role entry cards, menu role selection, role router self-test, diagnostics, and `test.html` simulation/live-only boundaries. These are source assertions and simulation checks; not live authentication or production runtime evidence.
- `qa/tasko-laundry.spec.cjs`: checks TASKO/Laundry home entries, pricing labels, service type/unit selection, handler presence, and rejects unauthenticated booking. Handler presence/UI assertions do not prove backend persistence or provider/admin operations end-to-end.
- `qa/tasko-laundry-main-regression.spec.js`: intentionally mocks user/auth/navigation and blocks external HTTPS requests; useful for isolated UI integration checks but not real Supabase or auth integration evidence.
- Test files contain assumptions about legacy production-like UI and may need careful retargeting to the locked Navy/Orange/White visual direction without deleting functional checks.

### Safe testing boundary
Because the repository connector can fetch/edit text but cannot checkout, install dependencies, execute commands, or launch a browser in this session, runtime test execution remains unavailable. Before execution, set `FRIEND_RIDE_BASE_URL` to an isolated local server; do not allow tests to default to the live GitHub Pages URL. The targeted legacy main-regression spec hardcodes localhost 4173 and is intended to be run only with the local server prepared.

### Pass 29 disposition
Audit findings documented only. No QA tests changed, no tests executed, no live endpoints contacted, no runtime code/backend/schema/auth/payment/main/deployment changed. Phase 2 remains IN PROGRESS / NOT ACCEPTED.


## Pass 30 — Playwright production-target safety guard added

### Verified change
- Updated `playwright.config.cjs` to require `FRIEND_RIDE_BASE_URL`; removed the former implicit GitHub Pages production fallback.
- Validates the URL and rejects any hostname except `localhost`, `127.0.0.1`, or `::1`. Error messages explain the local-isolated-server requirement.
- Retains the existing `testDir`, timeout, retries, reporter, headless mode and failure trace settings.
- CI workflows reviewed in Pass 27 set local loopback URLs for the generic Playwright suite. The TASKO/Laundry targeted regression spec uses a local server address explicitly.

### Verification limits
- Config was re-fetched after commit to verify its contents. Static reasoning/source inspection only; no node command or Playwright invocation was possible because this connector is text/API-only.
- A local command with no env should now fail fast; non-loopback target should fail fast; loopback URL should be accepted by configuration parsing. These three runtime behaviors are NOT executed/verified in this pass.
- CI branch trigger alignment remains pending; legacy dark-gold tests need retargeting to current Navy/Orange/White palette before a safe broad trigger.

### Pass 30 disposition
- QA-only configuration safety change committed on `arjuna-x/phase-2-repository-assets-inventory`.
- No app runtime, backend, schema, auth, payment, main branch, or live deployment changed.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 31 — Root SPA visual/theme source confirmation (targeted line ranges)

Freshly fetched targeted ranges from `index.html` to work around the 1 MB source limit:
- Root `<meta name=theme-color>` is `#24105f` (purple), application-version is `11.1-PRO-category-routing-learning-isolation`; title also has legacy V11.1/V10.3 text.
- Initial root CSS variables include purple `#5420b8` / `#7b35df`, dark-purple navy-like `#211044`, orange `#ff8a24`, light-purple background `#f6f4fb`, purple text `#201936`, and gold `#ffc65a`; body/topbar/buttons/drawer/catalogue contain numerous purple-gradient treatments. Navy/Orange/White locked direction is not yet consistently applied at the root.
- The home source includes a role launcher for customer/driver/partner/admin and a home location label initially showing “Tap to detect your location”; this is source presence only, not proof of GPS permission/location resolution.
- Legacy page source includes purple theme and multiple additive style blocks. This confirms UI consolidation/theme migration work is still outstanding; preserve the current page IDs and feature contracts when implementing.

### Phase 2 boundary
Targeted source snippets are sufficient to confirm the theme mismatch and role launcher, but not a full runtime route/role/location audit. Do not mark these features accepted from source snippets. Record theme implementation and full route visual/behavioral validation as Phase 3+ work after inventory gate.

### Pass 31 disposition
Source inventory update only. No UI/runtime source was edited; no browser, location/GPS, auth, database or live API testing performed. Phase 2 remains IN PROGRESS / NOT ACCEPTED.


## Pass 32 — Loopback guard correction and branch CI evidence

- Freshly re-fetched Playwright config after follow-up correction: loopback allowlist includes `localhost`, `127.0.0.1`, `::1`, and bracketed IPv6 `[::1]` URL hostname representation. Config still rejects absent env, invalid URL and non-loopback hostnames. This is source verification only; no Node execution.
- Queried GitHub Actions runs filtered to active Phase 2 branch `arjuna-x/phase-2-repository-assets-inventory`; API returned `total_count: 0`. No workflow run is currently evidenced on this branch. This aligns with Pass 27 trigger review.
- Latest documentation blob re-fetched before update. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; test execution and route/PWA/runtime verification blocked by lack of checkout/browser runtime in this session.
- No app runtime, backend, schema, auth, payment, main branch, or deployment changed.


## Pass 33 — Branch governance and latest ref check

- Fresh branch API check confirmed Phase 2 QA branch HEAD is `6ee47ab88436fbae5d0bde66b9d4fa2ff71272cb` (Pass 32 inventory commit). `main` currently points to `64845496f22487788aedbcf66b74147add3ab9c1`, commit message `Add FRIEND RIDE navy-orange UI skin`; main was read-only in this pass. This indicates a separate main-branch UI update exists and requires a controlled reconciliation review before release; no merge/cherry-pick was attempted.
- GitHub branch API reports Phase 2 QA branch protection disabled and required status checks empty. Direct commits to the branch are technically permitted; maintain the project's explicit manual QA discipline and keep all changes on the work branch. Phase 10 should include reviewed branch protection/status-check configuration when authorized.
- A GitHub compare endpoint request was rejected by the connector allowlist; ahead/behind and full diff relationship remain **unverified**. Do not infer mergeability.
- No main update, merge, test run, deployment or app/backend changes occurred.


## Pass 34 — Enable quality gate on the active ARJUNA X QA branch

### Implemented change
- Updated `.github/workflows/quality.yml` push trigger to include `arjuna-x/phase-2-repository-assets-inventory` alongside `main`. Pull-request target remains `main` only.
- Existing quality workflow runs typechecks, runtime build, unit/core tests, and Playwright with an explicit loopback URL. This gives the active QA branch an automatic isolated CI trigger without changing the legacy dark-gold regression workflow.
- Change commit: `fbc0b197bf4ccacd6ba60a3525ca698100e835b0`.

### Verification / run status
- Re-fetched the branch and workflow after commit; HEAD is `fbc0b197bf4ccacd6ba60a3525ca698100e835b0`, and the push branch trigger is present.
- Queried GitHub Actions runs filtered to the active branch immediately after the commit: returned `total_count: 0`. No CI run result is evidenced yet. This may be delayed or unavailable; do not report tests as passed.
- Branch protection still disabled / required checks absent (verified in branch API earlier this continuation). This is a governance blocker, but we do not enable protection without owner-authorized policy details because the current workflow may fail and required checks are not yet established.
- Reconciliation correction: Pass 33's recorded HEAD `6ee47ab...` was the pre-documentation commit; the actual resulting Pass 33 doc commit was `0f5f3441ab17e7716f37ecd9567848054e14a090`. The branch history was freshly fetched and confirms both.

### Pass 34 disposition
- Workflow trigger change committed to QA branch only. No local npm/test/build commands were run; GitHub Actions run query returned zero at check time. Main untouched, no merge/deploy, no app runtime/backend/schema/auth/payment modifications. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 35 — Main/QA ancestry and source-tree reconciliation

- Fresh GitHub compare by immutable commit SHA: main `64845496f22487788aedbcf66b74147add3ab9c1` versus QA `0f5f3441ab17e7716f37ecd9567848054e14a090`. Git reports `diverged`, QA `ahead_by=51`, `behind_by=1`; this is ancestry divergence and does not imply runtime code differs.
- Compare file list showed only ARJUNA documentation additions and `playwright.config.cjs` modification; no app runtime source/binary differences in that compare.
- Independently fetched recursive trees for both commits and SHA-verified equality of these source/PWA files: `index.html`, `manifest.webmanifest`, `manifest.json`, `icons/icon-192.png`, `icons/icon-512.png`, `service-worker.js`, `sw.js`, and `firebase-messaging-sw.js`. These content hashes are identical between main and QA tree snapshots.
- This narrows the one-commit ancestry gap: the latest main commit is represented in the QA tree content for these key UI/PWA assets, but no merge or cherry-pick is required or performed. Keep ancestry relationship documented; do not infer full tree equality beyond the checked compare file list and explicit hashes.
- Quality Gate workflow run `45055689330` on QA commit `fbc0b197bf4ccacd6ba60a3525ca698100e835b0`: typecheck-and-unit job completed SUCCESS (npm install, typecheck, core typecheck, runtime build, unit tests, core tests); browser job was still running Playwright when this pass was recorded. Await final result.

### Pass 35 disposition
Tree/hash and compare API evidence only; no merge, deploy, app/backend/schema/auth/payment changes. Phase 2 remains IN PROGRESS / NOT ACCEPTED until all acceptance blockers and browser/runtime evidence are addressed.


## Pass 36 — Correct route count and retarget active browser baseline

### Route-count correction to Pass 23
- Re-fetched the current `index.html` and legacy route array. Counting every DOM source element whose class list contains the `page` token gives **58 runtime page sections**, matching **58 unique IDs** in the legacy array, **0 missing**, and **0 stale**. The previous 55 count used exact `class="page"` and excluded 3 valid routes that carry extra classes: `home` (`page active`), `crmDashboard` (`page fr-crm-page`), and `frSuperHub` (`page fr-premium-hub`). Pass 23's 55/3-stale statement is superseded by this extraction.

### CI regression findings
- Quality Gate run `45055689330` on `fbc0b197...`: typecheck/core typecheck/runtime build/unit/core tests succeeded; Playwright browser suite ended **47 passed / 10 failed**. The 10 failures are in the obsolete `qa/dark-gold-route-regression.spec.js` suite, whose design markers, native-home/drawer/CRM/navigation/auth selectors and dark-gold assertions do not match the current app. Other Playwright specs passed in that run. Do not mislabel these as application regression findings without retargeting the test.
- New Playwright config safety unit tests on run `45055830357`: **7 passed, 0 failed** in Node unit job, including missing-env fail-closed, production-host rejection and localhost/IPv4/IPv6 loopback acceptance. Typecheck, core typecheck, runtime build and Vitest also succeeded in that job. Browser run on that commit was still pending at this note.

### Test-suite correction
- Preserve the obsolete Dark+Gold spec file as historical evidence but exclude it from the default Playwright suite; it is not an ARJUNA X theme authority. Keep all other functional QA specs enabled.
- Added `qa/arjuna-x-phase2-route-baseline.spec.cjs` with static route registry reconciliation (58 IDs; no missing/extra/duplicate IDs) and activation of each route via the existing router as Admin. This retargets route coverage to current scope without altering app code.
- Added push `paths-ignore: docs/**` to quality workflow to avoid redundant test runs for documentation-only commits. Application, QA test, and workflow changes still trigger the branch quality gate; PR-to-main trigger remains unchanged.

### Pass 36 disposition
- Combined test/config correction committed on QA branch only. CI triggered for this commit; final browser result is pending. No app runtime/backend/schema/auth/payment/main/live changes. Phase 2 remains **IN PROGRESS / NOT ACCEPTED** until current CI and remaining PWA/backend/runtime evidence are complete.


## Pass 37 — CI isolation hardening and current gate evidence

### Verified latest CI evidence before this patch
- Run `45056228462`, commit `bfce6331605b927d6efd336772eadd7dfef3e374`: overall **SUCCESS**. Type/unit job succeeded (typecheck, core typecheck, runtime build, Node unit tests `7/7`, Vitest); browser job succeeded with **47 passed in 28.0s**.
- Run `45056138040`, commit `8faf72849ba223747bb9daa1ff1d6d84e8eafc2f`: overall **SUCCESS**, browser **47 passed in 23.5s**. The newer run above additionally verifies the network-isolated route baseline spec revision.
- Earlier run `45055689330` failed only in legacy Dark+Gold theme spec (47 pass / 10 fail); after excluding that obsolete spec and adding ARJUNA X route baseline, the two full-gate runs passed. Keep legacy spec as reference; do not count it as target theme acceptance.

### Additional isolation improvement
- Added a shared beforeEach interception in active `qa/friend-ride.spec.cjs` and `qa/tasko-laundry.spec.cjs`: external HTTPS is blocked except the Supabase JS CDN and Leaflet library CDN needed for app initialization. Supabase API endpoints and other external services are aborted during these QA browser specs. The route-baseline and targeted TASKO/Laundry integration specs already block external requests.
- Combined with Playwright loopback-only baseURL guard, active suite is intended to run against the local static server with external API traffic blocked. CI is triggered for this QA/test change; results pending.

### Remaining Phase 2 acceptance blockers
- PNG icon binary visual/official-brand verification remains blocked by binary fetch/inspection capability; file SHA/size only.
- PWA installability, active worker/scope, update behavior and push/background notification runtime evidence remain unverified.
- Deployed Supabase RPC/Edge Function/auth/RLS contract and permission evidence not retrieved; do not change backend.
- Full live role/permission integration E2E is not proven by local static browser tests.
- QA branch protection and required checks remain disabled/unconfigured; owner approval/policy required before changing repository governance.

### Pass 37 disposition
- Test isolation source edits and status documentation committed on QA branch only; CI for this patch pending. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. Phase 3 is still gated. No app runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 38 — Live Supabase project/migration/security metadata review (read-only)

### Project and migration evidence
- Production project `friend-ride` (`fglyplxcczdjtfwobtzh`) and QA project `FRIEND RIDE QA` (`pqsangtvietawkfgpgfu`) both reported `ACTIVE_HEALTHY`. Production region: `ap-northeast-2`; QA: `ap-south-1`.
- Production: **79 recorded migrations**, latest `fr_notification_remove_duplicate_order_triggers`; **85 public tables**, all 85 with RLS enabled, 62 with at least one policy and 23 with no policies (RLS denies access unless privileged/service role). QA: **25 recorded migrations**, latest `arjuna_qa_rides_rls_policy_performance`; **21 public tables**, all 21 RLS enabled and all 21 have policies.
- Public function metadata: production 103 functions / 102 SECURITY DEFINER; all 102 have a search_path setting; 6 are executable by `anon`, 88 by `authenticated`. QA: 27 functions / 27 SECURITY DEFINER; all have a search_path setting; 1 anon-executable, 25 authenticated-executable. Counts come from read-only catalog queries; do not interpret all SECDEF grants as vulnerabilities without function-level review.

### Read-only sampled function and Edge Function review
- Reviewed 18 production SECDEF functions across admin driver/partner/provider operations, platform GST/toll-free settings, ride acceptance/counter-offer/start/complete, nearby drivers, service booking, TASKO/Laundry provider transitions, registration and ride participant detail RPCs. Sampled functions contained expected role/ownership/approval checks (admin checks via `admin_users`/`is_friend_ride_admin`, approved-driver checks, customer-role checks, assigned-provider checks, and ride participant/status constraints). This is a **sample**, not a full audit of 88 authenticated-executable functions.
- Public anon-executable functions were inspected: approved store/catalogue listing, platform business details, admin-check boolean, and published homepage feedback. Their code returns public/approved/published data or a boolean; grant purpose still requires owner review. QA has one public `fr_public_homepage_feedback` function.
- Production `fr-notification-register-token` and QA counterpart have `verify_jwt=true` and validate the user session before upsert. `fr-notification-dispatch` is `verify_jwt=false`, but deployed handler checks `FR_NOTIFICATION_DISPATCH_SECRET` in `x-dispatch-secret`; whether the secret is present/strong/configured was not read. `Sms-otp` is `verify_jwt=false`; source has a 60-second per-phone send cooldown and five verification attempts; IP-based throttling was not observed in this source.
- Security Advisor warnings: production reports 23 RLS-enabled tables with no policies (informational), 6 anon-executable SECDEF, 88 authenticated-executable SECDEF, and **Leaked Password Protection disabled**. QA reports 1 anon-executable and 25 authenticated-executable SECDEF. The warnings require owner/security review; no settings, grants, policies or backend code were changed.

### Current CI evidence
- QA branch commit `ee3422dcaf107d6b15df6fc9aa0a35e8224137af`; Quality Gate run `45056419922` **SUCCESS**. Typecheck, core typecheck, runtime build, Node unit tests, Vitest succeeded; Playwright **47 passed (22.3s)**. The active suite now blocks external HTTPS except required CDN libraries in the friend-ride and TASKO/Laundry specs. No live backend mutations were run.
- Main remains `64845496f22487788aedbcf66b74147add3ab9c1`; no merge/deployment.

### Pass 38 disposition
- Live project/migration/catalog/security metadata and sampled function contracts were reviewed read-only. Phase 2 remains **IN PROGRESS / NOT ACCEPTED** because icon binaries are not visually verified, PWA worker/install/update/push runtime evidence is incomplete, the full SECDEF/RLS/Edge secret audit is incomplete, full live role/permission E2E is not proven, and QA branch protection/required checks remain disabled (owner approval/policy needed). Phase 3 stays gated. No backend/runtime/schema/auth/payment/main/deployment changes.


## Pass 39 — PWA/service-worker registration source reconciliation

- Re-fetched all JavaScript/TypeScript source paths in the tracked tree and scanned for `serviceWorker.register` and worker filename references. Found **3 registration call sites in root `index.html`** and **1 in `fcm-web-push.js`; all four register `./service-worker.js`**. No registration references to `sw.js` or `firebase-messaging-sw.js` were found in the scanned source files. Those two workers appear legacy/unreferenced in source, but runtime registration cannot be proven without browser inspection.
- Active `service-worker.js` source includes Firebase messaging import, `skipWaiting`, `clients.claim`, generic `push` handling and `notificationclick`. The separate `firebase-messaging-sw.js` also contains an FCM background handler and click handler; `sw.js` has generic push/click and cache cleanup, but neither is referenced by the source scan.
- `fcm-web-push.js` registers `service-worker.js`, passes the registration to `messaging.getToken`, and POSTs the token to `fr-notification-register-token` using the user's Supabase access token. Deployed token-registration Edge Function has `verify_jwt=true` and calls `auth.getUser()`. This confirms source/deployed contract alignment, not a successful device token or background delivery.
- `fr-notification-fallback.js` is a separate Realtime + 60-second polling fallback, deduplicates by event ID in memory, displays an in-app card, and can show browser notifications. Permission remains user-gesture-driven. Delivery/duplication/closed-app/device matrix is untested.
- Active `manifest.webmanifest` is linked and uses relative scope/start_url, standalone portrait, light `#f4f6fb` theme/background. Duplicate `manifest.json` is not linked in root source and has absolute `/friend-ride-/` scope/start_url plus `#101827` colors. The duplicate should be retired/reconciled only in a reviewed Phase 3 PWA/UI patch. PNG icon binary artwork remains unverified.

### Pass 39 disposition
- Source registration/worker/manifest inventory only. PWA install/update/runtime registration and actual push delivery remain **NOT VERIFIED**. No runtime/backend/schema/auth/payment/main/deployment changes. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 40 — Add isolated local PWA smoke test

- Added Playwright smoke coverage to the ARJUNA X baseline suite: fetch linked `manifest.webmanifest`, verify name/start_url/scope/display and declared 192/512 icons, fetch icon resources, and wait for an active local `service-worker.js` registration with the expected localhost scope.
- Updated the route-baseline network allowlist to permit only required Supabase JS, Leaflet and Firebase compat CDN libraries; other external HTTPS remains blocked. No token registration, notification permission, push dispatch, database writes or production calls occur in this test.
- Test is source-committed to the QA branch and triggered a local-static-server CI run; result pending. It does not verify OS installation prompts, maskable icon artwork/safe zone, background/closed-app push, or actual device notification delivery.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED** pending the CI result and remaining runtime/backend/asset/governance evidence.


## Pass 41 — PWA smoke CI acceptance evidence

- Quality Gate run `45056922006`, QA commit `d00abcfc369adfee2355a702ca51a3562aa5a5ed`: **SUCCESS**. Typecheck, core typecheck, runtime build, Node unit (`7/7`), Vitest succeeded. Playwright **48 passed in 21.7s**.
- The new PWA smoke test passed: on the local static server it observed an active `service-worker.js` registration and matching root scope, fetched the linked `manifest.webmanifest`, verified name/start_url/scope/display and 192/512 icon declarations, and successfully fetched every declared icon resource.
- The immediately preceding run `45056898153` failed only because the test itself used Node-side `location.href` in a Playwright assertion (`ReferenceError: location is not defined`); the assertion was corrected to use `page.url()`. That failed run had 47 other browser tests passing. The corrected commit run above is green; this is a test harness fix, not an app runtime failure.
- PWA smoke evidence is local/browser CI only: no OS install prompt, installed app, maskable icon safe-zone/visual check, FCM token registration, permission prompt, push delivery, background/closed-app, or device notification matrix was tested. No external API calls are permitted by the active test network allowlist.

### Pass 41 disposition
- Local PWA registration, manifest and icon HTTP availability verified through isolated Playwright. Phase 2 remains **IN PROGRESS / NOT ACCEPTED** because remaining PWA/device/asset, full security audit and repository governance evidence are incomplete. Phase 3 remains gated. No app runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 42 — Production/QA Supabase environment wiring audit

- Fresh source scan confirms root `index.html` and `fcm-web-push.js` hardcode the production Supabase project ref `fglyplxcczdjtfwobtzh`. The separate active/healthy QA project `pqsangtvietawkfgpgfu` is not referenced by these app sources; no environment selector was found in the inspected files.
- Consequence: unblocked local/manual app tests could target production unless they explicitly block or mock Supabase requests. Current CI test route/network guards abort external API traffic, so these CI browser runs did not mutate backend data. No real auth/payment/ride API integration tests were executed.
- A future approved QA-only config selector is needed before full live E2E against the QA Supabase project. Do not replace production URL/key or alter auth/payment/backend contracts in Phase 2.

### Pass 42 disposition
- Source/config audit only. QA backend remains separate and active/healthy but is not wired into app source. This is a Phase 2 acceptance blocker for live integration testing. No runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 43 — Repository governance ruleset check

- Fresh read-only GitHub rulesets query returned **0 rulesets**. Prior branch-protection inspection recorded protection disabled and no required status checks on the active QA branch; the branch protection API URL could not be re-fetched in this pass because the connector rejected the encoded branch path.
- Quality Gate is now push-triggered on the active QA branch, but the workflow is not enforced as a required check. Do not enable required checks/protection without owner-approved policy and a stable required-check name; this governance blocker remains.

### Pass 43 disposition
- Read-only governance inventory only; no branch settings changed. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**.


## Pass 44 — SECDEF grants heuristic screen (read-only catalog)

- Production catalog: 88 SECURITY DEFINER functions executable by `authenticated`; 72 definitions reference `auth.uid()`, 20 reference admin helpers/`admin_users` (overlap), 85 reference role or ownership identifiers. A simple source-reference heuristic finds at least one auth/admin/role/ownership reference in 87/88; the one no-reference function is `fr_get_platform_business_details()`, an intentionally public business-details RPC reviewed in Pass 38. This is a heuristic screen, not proof of authorization correctness.
- QA catalog: 25 authenticated-executable SECURITY DEFINER functions; 22 reference `auth.uid()`, 8 reference admin helpers (overlap), and all 25 contain role/user/owner identifiers; the heuristic found no function without these references. Still not a full manual grant/function audit.
- All 102 production and 27 QA SECURITY DEFINER functions have a `search_path` setting. Production has 23 RLS-enabled tables with no policies (likely service-only; verify intended grants), QA has 0. Names of the 23 prod tables are cataloged in this pass: `fr_ai_usage_daily`, `fr_market_order_items`, `fr_market_orders`, `fr_parcel_orders`, `fr_partner_catalogue_items`, `fr_partner_order_candidates`, `fr_partner_order_routes`, `fr_platform_business_settings`, `fr_service_requests`, `fr_v8_delivery_otps`, `fr_v8_invoice_lines`, `fr_v8_invoice_verification_logs`, `fr_v8_invoices`, `fr_v8_order_ledger`, `fr_v8_platform_settings`, `fr_v8_subscription_events`, `friend_ride_receipt_email_logs`, `phone_otps`, `ride_offers`, `shop_delivery_assignments`, `shop_invoice_counters`, `shop_order_items`, `shop_payment_profiles`.
- Manual review of 18 production functions and the 6 anon-executable function definitions remains sampled, not complete. Security Advisor warnings are review flags; no grants, policies, settings or backend code changed.

### Pass 44 disposition
- Catalog/source heuristic review only; Phase 2 remains **IN PROGRESS / NOT ACCEPTED** until the full grant/function/RLS review, QA environment wiring, PWA/device/asset and governance evidence are complete.


## Pass 45 — Inventory summary and acceptance checklist reconciliation

- Refreshed stale top-level summaries to current evidence: 78 tree entries/62 blobs; loopback-only Playwright config; active QA branch CI trigger; 48-test green run; PWA local smoke; read-only production/QA Supabase metadata and sampled security review; hardcoded production backend wiring; zero repository rulesets.
- Corrected the old 55/58 discrepancy: all 58 `.page` IDs reconcile and activate; no missing/extra/stale IDs.
- Updated PWA checklist and Phase 2 gate: local worker/manifest/icon HTTP smoke is now checked; device install/push, visual icon/logo, full security audit, QA environment wiring and branch governance remain open.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; Phase 3 remains gated. No app/backend/schema/auth/payment/main/deployment changes.


## Pass 46 — CI dependency audit warning and runner deprecation risk

### Fresh evidence from workflow run 45056922006
- Browser job log is tied to checkout commit `d00abcfc369adfee2355a702ca51a3562aa5a5ed` and confirms 48 Playwright tests passed in 21.7 seconds. Job-level checks succeeded; artifacts were not published for this run.
- `npm install` emitted **3 dependency audit advisories (1 moderate, 2 critical)**. This run did not execute `npm audit` as a separate report, so package identities, dependency paths, fix versions, exploitability, and whether advisories affect production runtime remain unknown. Do not blindly run `npm audit fix --force` or upgrade dependencies without a lockfile-aware review and regression.
- Runner log also emitted a Node.js 20 deprecation warning: `actions/checkout@v4` and `actions/setup-node@v4` were run under the runner's forced Node 24 compatibility transition. This is an action/runtime warning, not a test failure. Review newer action major versions in a dedicated compatibility change.
- CI output included Node `punycode` deprecation warning from the tooling chain. No attribution/remediation verified.

### Pass 46 disposition
- Recorded as an **open Phase 2 dependency/tooling risk**; no package versions, lockfile, workflow actions, app runtime, backend, schema, auth, payment, main or deployment changed.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. Next safe step: get an isolated checkout/command runner and run `npm audit --json` against the exact branch/lockfile, then review dependency tree and upgrade candidates in a separate QA patch with tests.


## Pass 47 — Lockfile absence and non-reproducible install risk

- Fresh fetch confirmed `package.json` exists and declares Playwright `^1.56.0`, Vitest `^3.2.4`, Node types `^22.15.0`, TypeScript `5.8.3`; repository fetch returned 404 for both `package-lock.json` and `npm-shrinkwrap.json` on this branch (interpreted as absent tracked files, not runtime proof).
- CI workflows use `npm install`, not `npm ci`. Without a committed lockfile, semver ranges may resolve to different dependency graphs between runs, complicating repeatable test evidence and the Pass 46 advisory triage.
- Do not fabricate a lockfile or switch workflows to `npm ci` yet: lockfile generation requires a real package install/command environment and then a fresh isolated full CI run. No dependency files/workflows changed in this pass.
- Phase 2 acceptance adds a reproducible dependency install/lockfile requirement. Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; no runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 48 — Dependency advisory evidence capture CI (pending result)

- Fresh CI logs from successful run `45056922006` confirm the install step reported **3 vulnerabilities: 1 moderate, 2 critical**, but the log did not print advisory/package detail. The run passed typecheck/core typecheck/runtime build, Node unit (7/7), Vitest (5/5) and Playwright (48/48). It ran at SHA `d00abcfc369adfee2355a702ca51a3562aa5a5ed`, which is older than the current branch head.
- Added a non-blocking `npm audit --json` report capture after install in the Quality Gate workflow, and upload the raw JSON artifact. It is non-blocking because dependency remediation and a committed lockfile are not yet prepared; it does **not** resolve the reported vulnerabilities.
- Workflow commits: `f69e86b` (audit report step) and `19fe31e` (shell-safe summary correction). Run `45066821254` for `f69e86b` was in progress at observation; run `45066833414` for `19fe31e` was queued. No outcome claimed.
- Current branch head verified: `19fe31e276a1c73d25fec779974b9d910d0c2104`. Branch protection is disabled and required status checks are absent.
- No dependency upgrade, lockfile generation, runtime test execution, main merge or deployment was performed in this pass. Phase 2 remains NOT ACCEPTED.


## Pass 49 — Dependency audit capture verified in CI logs

- CI job logs for run `45066821254` show the audit capture step completed successfully and reported: `info=0, low=0, moderate=1, high=0, critical=2, total=3`. The raw `npm-audit.json` artifact was uploaded (artifact `14772085077`, 1,075 bytes). The connector can read artifact metadata but cannot download its archive/inspect package advisory detail here; detailed remediation is therefore pending artifact review.
- The first audit-step version's log shows the summary command executed and succeeded. A shell-safe heredoc follow-up was committed at `19fe31e` and its CI run `45066833414` was still in progress when checked. Browser regression on that run was pending Chromium installation.
- Audit capture is informational/non-blocking; vulnerability count is unchanged and not remediated.
- No runtime tests executed in this environment; CI is doing the run. Phase 2 remains NOT ACCEPTED.


## Pass 50 — Audit-artifact workflow run evidence

- Run `45066821254` (workflow commit `f69e86bb8134d55f90a28ae21da678c28e18ec31`) completed SUCCESS. Both jobs passed; browser regression **48/48**. Typecheck/core typecheck/runtime build, Node unit **7/7**, Vitest **5/5** also passed. The audit artifact was uploaded.
- This run executed the first audit summary implementation; it was subsequently made shell-safe in commit `19fe31e`. That follow-up run `45066833414` remained IN PROGRESS at this observation, with browser tests running and typecheck/unit job complete-success.
- CI still used npm install and did not create a committed lockfile. The 1 moderate + 2 critical vulnerabilities remain unresolved. Artifact package-level detail could not be inspected through the available connector.
- Phase 2 remains NOT ACCEPTED; no app/backend/schema/auth/payment/main/deployment changes.


## Pass 51 — Follow-up Quality Gate and branch divergence reconciliation

### Fresh CI verification
- Workflow run **45066833414 / #712** on commit `19fe31e276a1c73d25fec779974b9d910d0c2104` completed **SUCCESS**; both jobs completed successfully.
- Browser job log: Playwright **48/48 passed** (22.1s). The earlier audit-capture workflow run **45066821254 / #711** also succeeded: 48 Playwright tests; Node unit **7/7**; Vitest **5/5**; typecheck, core typecheck and runtime build succeeded.
- Run #712's typecheck/unit job confirms npm audit totals: **1 moderate + 2 critical (3 total)**. Audit artifact from run #711 is present (ID `14772085077`, 1,075 bytes), but the connector cannot download/inspect the ZIP here; package/advisory-level detail remains unverified. `npm install`/audit counts are evidence only; vulnerabilities remain unremediated.
- Run #712 also logs the Actions Node 20 deprecation transition (actions forced to Node 24 compatibility) and `punycode` / `url.parse` tooling deprecation warnings; these are not test failures.

### Branch divergence and UI asset finding
- Fresh branch API confirms active QA head before this documentation pass: `29397f274a0423ced51355e1385e5cc47ab55eac`; branch protection disabled, required checks absent.
- Fresh comparison `main` (`64845496f22487788aedbcf66b74147add3ab9c1`) vs QA branch reports **79 commits ahead, 1 behind, diverged**. No merge/cherry-pick performed.
- The one main-only commit `6484549` adds `friendride-ui-v1.css` (Navy/Orange/White styling). Fresh main `index.html` head still contains legacy purple tokens and does not link this stylesheet in the inspected head; the QA branch lacks this CSS file (404). Treat this as an unintegrated Phase 3 UI asset, not as completed UI rollout. Do not cherry-pick until reviewed and branch reconciliation is approved/isolated.

### Pass 51 disposition
- CI evidence blocker for run #712 is **closed as verified evidence**; the dependency remediation/artifact-detail blocker remains open.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**. Exact open gates: lockfile and `npm ci` reproducibility (requires real checkout/install/commit), package-level advisory review/remediation, official icon/logo visual verification, device PWA install/update/offline and background/closed-app push, full deployed auth/RLS/SECDEF/Edge secret review, safe QA backend wiring/integration E2E, and owner-approved branch protection/required checks.
- No app/runtime/backend/schema/auth/payment/main/deployment changes. No tests run in this automation environment; CI logs were read-only evidence.


## Pass 52 — Active Quality Gate action runtime refresh (CI execution pending)

- Reviewed the active `.github/workflows/quality.yml` after Pass 51. Updated only this QA workflow's `actions/checkout`, `actions/setup-node`, and `actions/upload-artifact` references from major v4 to v7, based on current official action documentation indicating Node 24 runtime support. `package.json` has no `packageManager` field; setup-node v7 automatic npm caching should therefore not be activated by package-manager detection. App Node target remains 22; this action-runtime refresh does not change app runtime.
- Commit **`8f74189030b15ac1c8a2785eb0baf436b1bf7843`** contains the workflow update.
- Fresh branch API confirms this commit is the QA head. The Actions runs list still shows latest successful run #712 on `19fe31e`; **no new run for `8f74189` is visible**. The available GitHub connector is read-only for workflow dispatch; cannot manually start a run or execute local commands. Do not claim this workflow upgrade tested. Stop at this access boundary; wait for a push-triggered run/owner action.
- Pass 52 disposition: safe workflow-only patch committed on QA branch; runtime verification **PENDING / NOT RUN**. Phase 2 remains NOT ACCEPTED. No app/runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 53 — Action-v7 CI run started; status refreshed

- Fresh fetch confirms active Quality Gate now uses `actions/checkout@v7`, `actions/setup-node@v7`, and `actions/upload-artifact@v7` (workflow commit `8f74189030b15ac1c8a2785eb0baf436b1bf7843`).
- Workflow run **45072777611 / #713** was created for that commit and is currently **IN PROGRESS**. `typecheck-and-unit` completed SUCCESS (typecheck, core typecheck, runtime build, Node unit, Vitest, and audit artifact upload); `browser-e2e` has completed checkout/setup/npm install/Chromium install/local server startup and is currently running Playwright. No browser conclusion yet.
- Supersedes Pass 52's initial observation that no run was visible. The CI action refresh is now being tested by this run; do not report overall PASS until the browser job and run conclusion complete.
- Top-level CI summary refreshed. Dependency advisory counts remain 1 moderate + 2 critical; artifact detail inaccessible. Lockfile absent. Phase 2 remains NOT ACCEPTED; no app/backend/schema/auth/payment/main/deployment changes.


## Pass 54 — Action-v7 Quality Gate completed successfully

- CI run **45072777611 / #713** on workflow commit `8f74189030b15ac1c8a2785eb0baf436b1bf7843` completed SUCCESS. Both jobs passed.
- Browser job: **Playwright 48/48 passed** (16.8s).
- Typecheck/unit job: `npm run typecheck` PASS; `npm run typecheck:core` PASS; `npm run build:runtime` PASS; Node unit **7/7 PASS**; Vitest **5/5 PASS**; npm audit artifact upload succeeded.
- `npm install` reported **3 vulnerabilities (1 moderate, 2 critical)**; audit JSON totals confirmed `info=0, low=0, moderate=1, high=0, critical=2, total=3`. This run did not remediate them. Artifact package/advisory detail remains unavailable through the connector.
- No Node 20 action-runtime deprecation warning was found in the filtered logs for this run; the action-v7 update is verified by successful CI. Node `punycode`/`url.parse` tooling deprecation may still be present in dependency output (not a test failure).
- CI status summary reconciled to run #713. Phase 2 remains **IN PROGRESS / NOT ACCEPTED** due remaining dependency/lockfile, logo/icon, device PWA/push, full security audit, QA environment and branch governance gates. No runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 55 — CI audit advisory visibility + branch asset reconciliation (2026-11-23)

### Actual QA-branch source and comparison review
- Freshly fetched the active Phase 2 inventory, phase plan, quality workflow, package scripts, Playwright config/safety test, and route-baseline spec.
- Fresh main vs QA comparison before this pass's workflow commits: QA **88 commits ahead / 1 behind** (diverged). Main-only commit 64845496f22487788aedbcf66b74147add3ab9c1 adds friendride-ui-v1.css; QA branch fetch for that asset returns 404, confirming it is not integrated on QA.
- Reviewed the main-only CSS patch: it is a 32-line broad selector skin with Navy/Orange/White tokens, but also maps legacy --gold to orange and aliases purple tokens. It is a Phase 3 candidate requiring route-wide visual/accessibility review; no cherry-pick/copy/merge in Phase 2.
- Freshly fetched the existing Phase 2 route baseline spec: it inventories 58 IDs, asserts 58 page sections/no missing/extra/duplicate IDs, activates all 58 through existing router, and checks local manifest/worker/icon HTTP responses. This is source confirmation; run #713 CI job was verified successful, but this automation did not execute browser tests itself.
- Fresh job-step lookup for CI run 45072777611 / #713 confirmed both jobs completed success and all expected steps (typecheck/unit and browser regression) succeeded.

### Incremental CI change
- Commit a49c5ab12672bd8c8e34c61a5ab0c193dcd12834: added a GitHub Actions job-summary step that reports npm audit counts and package-level severity, direct/transitive status, vulnerable range, fix label, and HTTPS advisory links; artifact upload remains.
- Commit d6cb8c79c1ff5c5bffbfb8137b998b4ad10de0f9: corrected Markdown escape handling in the summary script. Workflow-only change; no app/backend behavior changed.
- The workflow is push-triggered for the active QA branch, but a push-run listing/status endpoint is unavailable through this connector; these two commits' CI execution is NOT VERIFIED. No local repo checkout/build/test environment exists.

### Isolated checks actually executed
- Full fetched workflow YAML was copied to an isolated temporary file and parsed with Python PyYAML: PASS; both jobs and the audit-summary step were present.
- Extracted the exact audit-summary Node script from that parsed workflow and ran it against a synthetic npm-audit JSON fixture: PASS; output included counts, package rows, severity ordering, direct/transitive label, fix status, advisory HTTPS link, and escaped pipe characters.
- These are isolated workflow-script checks, not FRIEND RIDE runtime/Playwright tests. No npm install, audit against live package registry, app build, or repository test suite was executed here.

### Pass 55 disposition
- Audit-artifact access blocker improved: future CI job summaries should make package-level details readable without downloading the artifact, pending a successful CI run and review of its actual summary.
- Dependency vulnerabilities remain unremediated; no lockfile exists. Other Phase 2 blockers remain: official icon/logo visual verification; device PWA install/update/offline and closed-app push; full deployed auth/RLS/SECDEF/Edge-secret audit; isolated QA backend wiring/integration E2E; owner-approved branch protection/required checks.
- Phase 2 remains IN PROGRESS / NOT ACCEPTED; Phases 3–10 remain gated. No runtime, backend, schema, auth, payment, main branch, or deployment changes.


## Pass 56 — Final branch-head reconciliation for this continuation

- Verified documentation commit ce332dda183457c8177845b9353e2de821b62bc7 by fetching its commit metadata and diff; it is the latest commit created in this continuation and is present on the active QA branch.
- Fresh main-vs-QA comparison after this continuation's workflow + documentation commits: QA **92 commits ahead / 1 behind**, diverged. Main-only commit remains 64845496f22487788aedbcf66b74147add3ab9c1; do not merge/cherry-pick without a separately approved reconciliation.
- GitHub connector's workflow-run lookup for workflow commit d6cb8c79 returns no PR-triggered runs; it does not expose the push-run listing. CI status for audit-summary commits remains **UNVERIFIED**, not assumed.
- Additional isolated check: missing npm-audit.json fallback emits a warning to the job summary and exits without throwing; **PASS**. This tests only the helper snippet in isolation.
- No further app/backend/schema/auth/payment changes. Phase 2 remains NOT ACCEPTED; access gaps remain documented.


## Pass 57 — Ahead/behind count correction

- The Pass 56 comparison was made before the two Pass 56 documentation commits. A fresh comparison after those commits reports QA **94 ahead / 1 behind** main (diverged); main-only commit 64845496f22487788aedbcf66b74147add3ab9c1 remains unintegrated. This supersedes the 92-ahead count in the prior note. No merge/cherry-pick.
- Latest commit verified at this checkpoint: d0a0256959234f08dfbb07cb027237efb7fd5512 (Phase-plan Pass 56 update). No CI status for the workflow audit-summary changes is available through the connector.


## Pass 58 — Package-level audit findings and CI summary formatter correction

Freshly inspected Quality Gate push-run jobs/logs, including Run 714 (failed) and Run 715 (success). Run 714's audit-summary Node script failed with a JavaScript SyntaxError (invalid regex flags) before typecheck/unit steps; browser job passed. Run 715 corrected that syntax and completed SUCCESS; npm audit reported **2 critical, 0 high, 1 moderate (3 total)**. The package-level log identifies:
- `tinypool` — critical, transitive, vulnerable range `<=2.1.1`, fix available `5.1.1`; advisories GHSA-5gmw-xhrv-c9v3 and GHSA-85c8-ppgw-ccpr.
- `vitest` — critical, direct, vulnerable range `0.0.95 - 4.1.10`, fix available `5.1.1`; advisory GHSA-82fw-gwwq-j7x9.
- `@vitest/mocker` — moderate, transitive, vulnerable range `<=4.1.11`, fix available `5.1.1`; advisories GHSA-82fw-gwwq-j7x9 and GHSA-qxg6-89mg-rqv8.

No dependency version was changed. Vitest 5 is a major upgrade; with no lockfile and no local checkout/test environment, it is not safe to change or generate a fabricated lockfile. The audit artifact was uploaded, but connector access cannot retrieve/download artifact ZIP bytes; package-level details above came from the CI job log output.

CI formatter follow-up: Pass 58 corrected literal escaped-newline output to actual line breaks and simplified Markdown cell escaping. Commit `de245b7` fixes newline rendering; commit `a996817` improved cell/advisory text escaping; commit `07cf768` removes a wrongly escaped newline regex in favor of character-code normalization. The workflow source was fetched after `07cf768` and the exact corrected line verified. Run 716 (on `de245b7`) typecheck/unit job was success and browser job still running at this evidence snapshot. Run 717 (on `a996817`) was in progress; Run 718 for `07cf768` had not yet been verified. Do not claim these follow-up runs PASS until completed.

Phase 2 remains NOT ACCEPTED. No runtime app, backend, Supabase schema/data, auth, payment, main, or deployment changes.


## Pass 59 — CI formatter correction, failures and latest run status

- Run 716 (`de245b7`) completed SUCCESS: both CI jobs passed. It verified real-newline summary formatting, but its advisory-cell escaping was subsequently improved.
- Runs 717 (`a996817`) and 718 (`07cf768`) failed in the audit-summary Node step with `SyntaxError: Unexpected token '?'` because a stale duplicate ternary expression remained after the partial edit. Browser jobs completed PASS in both; typecheck/build/unit/core steps were skipped after summary-step failure. This failure was identified from actual logs and corrected by commit `62d9df5`, which replaced the whole title expression block.
- Synthetic summary-helper test in this tool runtime (not repository/CI test): 4 checks PASS—real newline output, pipe escaping, bracket escaping, and fixture rows. It used synthetic values and did not execute the workflow script itself.
- Run 719 on `62d9df5`: audit summary step PASS; typecheck, core typecheck, runtime build PASS; unit tests were still in progress at the last check. Browser job was also in progress. The connector's job-list endpoint returned 404 while run status remained in-progress, so final Run 719 conclusion is not verified yet.
- Latest QA branch head at this pass: `62d9df585f89a3e54f2ea084df50b9b6d70f5479`; comparison: 101 ahead / 1 behind main, diverged. Documentation commits add to ahead count; do not reconcile again until fresh comparison.

Phase 2 remains NOT ACCEPTED. No app/runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 60 — Final audit-summary workflow CI acceptance

Freshly verified Quality Gate Run 719 on workflow commit `62d9df5`: overall SUCCESS; both check-runs completed SUCCESS.
- `typecheck-and-unit`: audit capture and summary steps PASS; typecheck PASS; core typecheck PASS; runtime build PASS; Node unit tests **7/7 PASS**; Vitest **5/5 PASS**.
- `browser-e2e`: Playwright **48/48 PASS** (24.8s); Chromium install and local server steps PASS.
- Audit summary now displays real Markdown rows and package/advisory details in CI logs. Vulnerability counts remain **2 critical, 1 moderate, 0 high (3 total)**. Run 719 log confirms tinypool critical transitive, vitest critical direct, @vitest/mocker moderate transitive, all reported fix target 5.1.1.
- Runs 717 and 718 remain recorded as failed formatter iterations; corrected commit 62d9df5 is the verified successful run. Isolated formatter fixture: 4/4 checks PASS (not an app test).

Run 719 is CI workflow evidence only, not production/live Supabase/device test evidence. Phase 2 remains NOT ACCEPTED; dependency remediation + lockfile, visual assets, mobile PWA/offline, background push, complete RLS/SECDEF/Edge secret review, QA backend wiring, and branch protection/required checks remain open. No runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 61 — Lockfile candidate CI path added (2026-11-23)

- Freshly verified the active QA branch head before this change at `a237d317abedd0c3affefe0e2a150608b1b41281`; `package.json` has semver ranges, and neither `package-lock.json` nor `npm-shrinkwrap.json` exists.
- Added workflow-level `permissions: contents: read` to the active `quality.yml`.
- Added an isolated `dependency-lockfile-preview` job: Node 22, `npm install --package-lock-only --ignore-scripts --audit=false`, then `npm audit --json` against the generated candidate, and upload of the candidate lockfile + audit JSON for 7-day review. This job does not execute dependency lifecycle scripts and does not commit or apply a lockfile.
- Workflow source was fetched and checked after commit `15f42bd0af757a9a47296f4f5dbeee74dbd3e52c`; the commit's combined status query returned no check/status entries at observation. CI execution and artifact generation are **not yet verified**. No local YAML parser or npm command was run.
- Fresh main/QA comparison after workflow commit: QA **107 ahead / 1 behind**; diverged. Main-only `64845496f22487788aedbcf66b74147add3ab9c1` remains unmerged.
- This is a lockfile-generation path, not lockfile acceptance. Next step is inspect the generated artifact/audit and review versions, then only commit a real reviewed lockfile and switch workflows to `npm ci`. Critical/moderate advisories remain unresolved.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; Phase 3–10 remain gated. No app runtime, backend, schema, auth, payment, main, or deployment changes.


## Pass 62 — Candidate lockfile review and Vitest security upgrade (2026-11-23)

- Run **720** (`45089144859`, commit `15f42bd0af757a9a47296f4f5dbeee74dbd3e52c`) completed SUCCESS: typecheck/core typecheck/runtime build, Node unit 7/7, Vitest 5/5, Playwright 48/48; lockfile-preview job succeeded. Downloaded and inspected artifact `14780084241` (lockfile v3, 108 package entries, Vitest 3.2.7, tinypool 1.1.1); audit candidate still had 2 critical + 1 moderate. Not committed because known vulnerable graph.
- Updated direct dev dependency `vitest` from `^3.2.4` to exact **5.1.1** in commit `b0383d99a40b59d1f54b20f70d5f2ae90df47341` on QA branch. This is a QA-tool-only major upgrade, not app runtime.
- Run **721** (`45089265731`, commit `b0383d99`) completed SUCCESS: typecheck/core typecheck/build PASS, Node unit 7/7, Vitest 5/5, Playwright 48/48. The candidate lockfile artifact `14780368196` was inspected: lockfile v3 with 74 package entries; Vitest 5.1.1 and nested @vitest/mocker 5.1.1; npm audit candidate totals **0 vulnerabilities** (0 critical/high/moderate/low). Candidate not committed yet.
- Official Vitest release documentation lists 5.1 as actively patched and 4.1 as receiving important fixes; advisories confirmed the prior vulnerable ranges. Upgrade is supported by Node 22 CI tests but the candidate lockfile install still needs verification.
- Added a QA-branch-only `lockfile-acceptance-commit` workflow job in commit `7d28a2ffcc87c06c601c38f5464d894edb232506`: after all jobs pass, it downloads the candidate artifact, requires zero audit findings and package/Vitest version match, runs `npm ci --ignore-scripts` plus all local checks and Playwright, then commits only `package-lock.json` to this QA branch using job-scoped `contents: write`. This is not a production or main-branch write. Run **722** is currently in progress; preview artifact `14780831253` was inspected (lockfile v3, 74 entries, Vitest 5.1.1, audit 0), but locked-install job has not yet appeared/finished at this update.
- No local npm commands or app tests executed. CI evidence above is from actual GitHub Actions logs. Phase 2 remains NOT ACCEPTED until the lockfile is committed and verified via `npm ci`, and the remaining logo/device/security/QA integration/branch-protection gates are addressed. Phases 3–10 remain gated. No runtime/backend/schema/auth/payment/main/deployment changes.


## Pass 63–64 — Reviewed lockfile committed; CI switched to npm ci (2026-11-23)

### Lockfile acceptance
- Run **725** (`45090132081`) completed SUCCESS after three earlier lockfile-commit job failures were diagnosed and fixed. Earlier failures were: run 722 push rejected because documentation commits advanced QA; run 723 rebase refused due untracked candidate lockfile; run 724 rebase refused due generated runtime/build changes. All test jobs in those failed runs passed; only the lockfile commit step failed.
- Run 725's lockfile job verified the candidate audit was 0, installed with `npm ci --ignore-scripts`, passed typecheck/core typecheck/runtime build/Node unit/Vitest checks and Playwright **48/48**, then committed and pushed the candidate lockfile. Remote branch file verified after push.
- Lockfile commit: `2e1e8c43e1401935b5831bdceb1cfe108bc03b7f` (`package-lock.json`, 1,299 lines); blob SHA `9c989313093c1ec366b75194c9dc96fad1abcb63`. Lockfile v3; 74 package entries; Vitest 5.1.1 and @vitest/mocker 5.1.1. Candidate audit total 0.

### Reproducible CI acceptance
- Workflow commit `e698f75781845d387b1f42cc9dd27aa41f86f104` changed both QA install jobs from `npm install` to `npm ci` and removed the one-time lockfile-preview/auto-commit jobs.
- Run **726** (`45090342763`) completed SUCCESS on that workflow commit: typecheck PASS, core typecheck PASS, runtime build PASS, Node unit tests **7/7**, Vitest **5/5**, Playwright **48/48** (17.3s). npm audit artifact `14780717386` downloaded and inspected: **0 total vulnerabilities** (0 critical/high/moderate/low).
- Fresh branch/main comparison after workflow change: QA **120 ahead / 1 behind**, diverged. Main-only commit `64845496f22487788aedbcf66b74147add3ab9c1` remains untouched.
- Dependency/lockfile blocker is now **RESOLVED for the QA CI dev-dependency graph**: exact Vitest 5.1.1 pin, committed lockfile, npm ci in both jobs, zero audit findings, and CI evidence. Do not claim production dependency audit; package.json is QA dev dependencies only.

### Phase 2 remaining acceptance blockers
- Official icon/logo visual inspection and comparison to the owner-approved reference: still pending (binary image review not completed in this run).
- Android/iOS PWA install, update, offline/cache behavior, and background/closed-app notification device verification: pending.
- Complete production RLS, SECDEF grants/functions, Edge Function secret validation, SMS abuse/rate-limit review: pending; previous partial read-only audit is not complete evidence.
- Isolated QA Supabase environment wiring and integration E2E evidence: pending; current app's production project wiring has not been safely replaced/verified.
- Branch protection and required status checks: disabled; configuration needs repository-owner authorization/approval.
- Phase 2 remains **IN PROGRESS / NOT ACCEPTED**; Phase 3–10 gated. Navy Blue + Orange + White scope remains locked. No main merge, live deployment, runtime/backend/schema/auth/payment change.


## Pass 65 — Read-only production/QA RLS, SECURITY DEFINER, and Edge Function review (2026-11-23)

### Table/RLS and grants
- Production: 85/85 public tables have RLS enabled; 135 policies; 23 RLS tables have no policies; 0 `FORCE ROW LEVEL SECURITY`. Read-only `has_table_privilege` checks confirmed all 23 policyless tables have no direct anon/authenticated SELECT/INSERT/UPDATE grants, so they are not client-accessible through table grants. Production anon has no direct table SELECT/INSERT/UPDATE/DELETE grants. Authenticated direct grants exist on 26 SELECT, 21 INSERT, 18 UPDATE, and 7 DELETE tables (policy-controlled).
- QA: 21/21 public tables RLS enabled; 46 policies; 0 policyless tables; 0 FORCE RLS. QA anon has direct SELECT/INSERT/UPDATE/DELETE grants on 18 tables, but a fresh policy-role query found **no anon or PUBLIC policies**; RLS blocks anonymous table access under the current policy set. This is an excessive-grant least-privilege risk, not a confirmed bypass. Authenticated grants on 20 tables are covered by policies.
- Production has two PUBLIC read policies (active shop categories and approved-shop products); current direct anon table grants are absent. Policy expressions were inspected. QA has no PUBLIC/anon policies.

### SECURITY DEFINER inventory
- Production: 102 SECURITY DEFINER functions; 6 anon-executable, 88 authenticated-executable. Every function has an explicit `proconfig` search_path (79 `search_path=""`, 16 `search_path=public`, 4 `public,auth`, 1 `pg_catalog,public`, 1 `pg_catalog,public,row_security=off`, 1 `pg_catalog,public,vault,net`). No function lacked a fixed search_path. QA: 27 SECURITY DEFINER; 1 anon-executable, 25 authenticated-executable; 25 empty search_path and 2 public.
- Read-only function-body review covered admin membership checks, ride accept/start/complete, ride participant detail access, payment-session ownership, SOS participant checks, nearby-driver customer/admin gate and radius, approved partner/service provider ownership, TASKO/Laundry assigned-provider transitions, driver QR ownership/storage size, parcel customer/driver ownership and OTP, partner quote/order/payment, push runtime service-role restriction, and role registration. No missing owner/admin checks was confirmed in the reviewed functions.
- Eight authenticated-executable functions lack an auth.uid()/role/admin check in the body; five are anon-executable. Body review confirmed these are public/approved catalog, store/business info, store payment-options, provider listing, or published-homepage-feedback queries. Data-minimization review remains: authenticated provider listing includes phone, and store payment-options includes UPI/PhonePe/QR path. Owner confirmation of intended visibility is pending.

### Edge Functions (source-only; secret values not inspected)
- Production 13 ACTIVE; 4 have `verify_jwt=false`: `Sms-otp`, `fr-notification-dispatch`, `dynamic-responder`, and `smooth-service` (SMS webhook). Source checks: dispatch requires `FR_NOTIFICATION_DISPATCH_SECRET` header; dynamic-responder reads webhook secret through `fr_get_push_runtime_config` and checks header; smooth-service validates standardwebhooks signature. Delivery-OTP has JWT verification plus session/customer/assigned-driver checks, 60-second issuance cooldown, five attempts and five-minute expiry.
- `Sms-otp` is intentionally public (JWT false), validates Indian phone format, per-phone 60-second cooldown, hashes OTP, 5-minute expiry and five verification attempts. No IP/device-level rate limit was found in source; attempt increment is not an atomic compare-and-update, so concurrent verification attempts need review. Secret presence/configuration was not verified (values never read).
- QA 6 ACTIVE; only `fr-notification-dispatch` has JWT false and it requires the same dispatch secret header. `fr-notification-register-token` has JWT verification and calls `auth.getUser()` before registering token to that user.

### Advisor/blocker reconciliation
- Production advisor still reports 23 RLS-without-policy, 25 authenticated SECDEF, 6 anon SECDEF, and leaked-password protection disabled. The 23 no-policy tables were confirmed not directly granted to anon/authenticated. QA advisor reports no missing RLS policies, 1 anon SECDEF and 25 authenticated SECDEF.
- No backend/schema/auth/payment changes made. Potential review items (not confirmed vulnerabilities): QA anon broad grants despite RLS/no anon policies; production leaked-password protection disabled; OTP lacks IP throttling and concurrent-attempt atomicity; provider phone/payment data visibility; arrival-photo function checks role + assignment but not driver approval status; secret configuration presence not verified. Any remediation requires owner-approved backend/auth/security change, outside this run's locked scope.
- This is a read-only partial source review, not a complete penetration test or full audit of every function/secret. Phase 2 remains NOT ACCEPTED; device/PWA/logo review, QA integration, branch protection, and the listed security approvals remain blockers. Phases 3–10 gated. Main untouched, no deployment.


## Pass 107 — Web Push/FCM integration mismatch (2026-11-23)

Read-only QA source audit confirmed:
- Website `frEnableDeviceAlerts()` creates a browser `PushManager` subscription and upserts `fr_push_subscriptions`; it does not call FCM `getToken()` or `fr-notification-register-token`.
- QA `fr-notification-dispatch` v7 sends FCM via active `fr_notification_tokens` only; the web push subscription table is not its delivery source.
- QA `fr-notification-register-token` v5 requires JWT, uses `auth.getUser()` to bind ownership, accepts `platform=web`, and upserts FCM token rows.
- Separate root service workers exist for generic Web Push (`service-worker.js`) and Firebase background messages (`firebase-messaging-sw.js`), confirming two distinct paths.
- Read-only QA row counts: events=0, FCM tokens=0, web-push subscriptions=0. Delivery cannot be verified in this environment.
- Updated `FCM-WEB-PUSH-SETUP.md` to reflect the current source truth and owner/device/credential integration steps. Added `tests/notification-architecture-audit.test.cjs` as a static audit that passes only while this documented mismatch remains accurately represented.

**Still blocked:** owner-confirmed Firebase web/VAPID config and integration architecture, QA event producer path, authorized secret presence check (values never read), token refresh/account-switch tests, Android device delivery and notification click tests. No backend deployment/schema changes.


## Pass 108 — Fresh grants and CI triage (2026-11-23)

- Fresh QA SQL reconfirmed broad anon privileges on 18 sampled public tables, including TRUNCATE/REFERENCES/TRIGGER, but no anon/PUBLIC policies returned. RLS/policy evidence means this is an excessive-grant risk, not a confirmed row-access bypass; owner-approved privilege remediation is still pending.
- GitHub branch-protection read returned 403 `Resource not accessible by integration`; we cannot verify/update protection from the current GitHub connector. Prior Pass 96 audit found it disabled and required checks empty; owner/admin action required.
- CI #748: typecheck, core typecheck, runtime build succeeded; unit test suite failed 1/14 due the notification test checking setup-doc content from a later commit. Browser E2E job succeeded. Fix commit `91ab41ace0538a5500da21ceacb58fdf001bdbee` removes that timing dependency; #750 queued. #749 (doc commit) in progress at time of record.


## Pass 109 — Notification event producer search (2026-11-23)

- Read-only QA SQL search of public routines for references to `fr_notification_events`/`fr_notification_tokens` returned no matching functions; read-only trigger inventory for `fr_notification_events`, `fr_notification_tokens`, and `fr_push_subscriptions` returned no triggers.
- QA project lists six active Edge Functions; source review of the notification dispatch and token registration functions found no event enqueue/producer path in those functions. Combined with zero queue rows, no notification event producer is evidenced in the QA project. This is an integration gap, not proof no producer exists outside the inspected database/project.
- Query 1 initially failed because it included aggregate `pg_proc` entries (`array_agg`); corrected query limited to function/procedure kinds and returned zero matches. No changes made to DB.
