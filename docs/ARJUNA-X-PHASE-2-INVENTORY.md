# ARJUNA X — Phase 2 Repository & Assets Inventory

**Project:** ARJUNA X (internal codename) / FRIEND RIDE (app brand)  
**Phase:** 2 — Repository & Assets Inventory  
**Branch:** `arjuna-x/phase-2-repository-assets-inventory`  
**Source branch:** `arjuna-x/phase-1-scope-lock`  
**Inventory date:** 2026-11-22  
**Repository:** `ginniprasanthsuji-ops/friend-ride-`

## Scope and safety
This is a source-tree/config/documentation inventory only. No app runtime code, Supabase schema/data, auth, payment, main branch, or live deployment was changed. Findings describe file/config presence, not feature completion or runtime proof.

## Repository snapshot
- Recursive tracked-tree inventory returned **74 paths**.
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

**Brand lock:** Official logo reference is the user-uploaded image; brand palette Navy Blue + Orange + White. The existing teal/royal-blue UI design document is legacy/conflicting guidance and must not override the locked ARJUNA X brand direction.

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

### Playwright configuration (observed)
- `testDir: ./qa`
- Timeout 45s; retries 1; list + HTML reporters.
- Default `baseURL` points to GitHub Pages production unless `FRIEND_RIDE_BASE_URL` is supplied.
- Headless Chromium; trace retained on failure.
- **Safety finding:** For Phase 2/QA, set `FRIEND_RIDE_BASE_URL` explicitly to a local/isolated test server. Never run mutation-oriented tests against production by accidentally using the default.

### Existing specs/files (observed)
- `qa/friend-ride.spec.cjs` — broad browser regression suite.
- `qa/tasko-laundry.spec.cjs`, `qa/tasko-laundry-main-regression.spec.js`, `tests/tasko-laundry-main-regression.spec.js`.
- `qa/dark-gold-route-regression.spec.js` and `qa/dark-gold-migration-checklist.md` — legacy theme-specific QA artifacts; not authoritative for the new Navy/Orange/White scope.
- `tests/learn-teach-marketplace.spec.js`.
- `tests/ride-contact.test.cjs`.
- `tests/unit/result.test.ts`, `tests/unit/validation.test.ts`.
- `qa/read-only-regression.sql` — SQL QA file; must be reviewed before use and remain read-only.
- `test.html` exists as a QA/demo page; inspect its mode/behavior before using.

## CI/workflow inventory
| Workflow | Trigger observed | Main concern |
|---|---|---|
| `quality.yml` | push main; PR main | typecheck, unit/core tests, runtime build, Playwright |
| `friend-ride-regression.yml` | push main and legacy dark-gold branch; manual; scheduled | local server and Playwright; trigger branch list is legacy/incomplete |
| `friend-ride-workflow-regression.yml` | push to old integration branch; PR main | inline JS and Learn/Teach syntax/source checks |
| `tasko-laundry-main-regression.yml` | push old integration branch; PR main with paths | targeted TASKO/Laundry/Admin Playwright |

**CI gap candidates:** trigger branch names are not aligned with the ARJUNA X branch; test suite names/coverage and safety controls need consolidation later. No workflows were executed in Phase 2, so no CI result is claimed.

## Notifications / PWA inventory
Observed files: `fcm-web-push.js`, `firebase-messaging-sw.js`, `fr-notification-fallback.js`, `service-worker.js`, `sw.js`, setup doc and two manifests.
- Multiple service-worker files create registration/version/scope duplication risk; actual registrations and precedence still need source-level audit.
- FCM setup document states web config placeholders and token-registration verification are required; background push not considered ready based on file presence.
- Need inventory registration sites, permission UX, token/subscription storage/cleanup, server dispatch path, fallback polling/realtime, deep links, Telugu voice capability and device-state matrix in dedicated notification audit.
- PWA manifest duplication and path/scope differences require reconciliation.

## Integration/config inventory
- Supabase integration and migrations documented; exact current runtime configuration/contract inventory requires full source access.
- Google Maps/Places is a requirement, but baseline document says current autocomplete uses Photon/OSM; secure Google Places setup and migration remain future work.
- SMS/APITXT, payment/Cashfree, maps, Firebase push, Zoom, finance/travel/health external links need integration-by-integration contract audit.
- Secrets must remain in environment/secret storage; no credentials copied into docs.

## Conflicts / legacy artifacts
1. Existing `docs/ui/fresh-teal-royal-blue-design.md` says Teal + Royal Blue; ARJUNA X locked branding is Navy + Orange + White. Treat teal doc as legacy and do not apply.
2. Theme-specific dark/gold tests/checklist are legacy and must not drive UI decisions.
3. Two manifests and multiple service-worker candidates exist.
4. Playwright default URL is production; local/isolated target must be explicit.
5. Root SPA source too large for full route/screen inventory from this connector pass; Phase 2 is not yet fully complete.


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
- [ ] Confirm one authoritative manifest for both GitHub Pages and custom domain.
- [ ] Align/remove legacy manifest safely after usage/hosting checks.
- [ ] Visually inspect 192/512 icons and confirm official FRIEND RIDE logo, safe-zone and colors.
- [ ] Installability, standalone launch, update behavior, offline behavior and service-worker scopes require isolated browser/device verification.


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

### Phase 2 acceptance gate — open items ranked
1. Binary icon pack integration and visual validation: existing icon binaries still not inspected; generated draft pack not committed. Manifest changes remain blocked until binary assets are actually in the branch.
2. Runtime route/navigation/role verification: source page-ID reconciliation (55 actual IDs, 58 QA IDs, 3 stale) is not runtime coverage. Need browser run against local isolated server and role-specific sessions.
3. PWA/worker runtime proof: determine active registration/scope, installability, worker update behavior and device-state notification matrix; source registration alone is insufficient.
4. Backend authorization/integration evidence: deployed RPC/Edge Function contracts and RLS/auth behavior not verified; do not change schema/auth/payment to close this inventory item.
5. CI alignment: current workflow trigger definitions do not explicitly include active ARJUNA X branch; workflow run evidence unavailable here.
6. Legacy theme QA: stale Dark+Gold assertions must be carefully replaced by locked Navy/Orange/White checks while retaining route/function checks; do not delete or weaken tests wholesale.

### Safe next actions
- Continue targeted source extraction and document exact integration placeholders/handlers.
- Prepare branch-safe CI trigger alignment only after fetching and reviewing full workflow files and confirming triggers do not run live mutation tests.
- Once binary-capable repo access and isolated execution are available, install the draft icon pack, update manifest purpose/theme fields, run installability and regression checks, and record evidence.

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
