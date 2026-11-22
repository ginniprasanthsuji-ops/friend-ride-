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
