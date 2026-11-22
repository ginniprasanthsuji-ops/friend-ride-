# FRIEND RIDE — Play Store Release Gate

**Audit date:** 2026-11-09  
**Branch audited:** `main`  
**Audited commit:** `11269614f66b5ff21c361675a14d4791b0ce6cfa`  
**Release decision:** **BLOCKED — NOT CERTIFIED FOR PLAY STORE**

## 2026-11-22 QA branch recheck (current evidence)

**QA branch:** `qa/remove-unneeded-services-2026-11-22`  
**PR:** #36 (open; not merged; live/main untouched)  
**Latest checked commit:** `87d4921b922ade93991749a88ef8470577948fa8`

| Check | Current result | Evidence |
|---|---|---|
| Inline JavaScript source check | PASS | Latest workflow run 182 passed |
| Typecheck + unit/core tests + runtime build | PASS | Quality Gate run 354 typecheck-and-unit job passed |
| TASKO / Laundry / Admin Playwright | PASS | 4/4 passed in integration run 132 |
| Main browser E2E suite | RUNNING | Quality Gate run 354 browser-e2e job still executing |
| Booking pickup/drop/map/location tests | NOT YET CONFIRMED | Included in browser E2E; results pending |
| Live OTP, push, payments, physical-device GPS | NOT TESTED | Requires real-device/live integration tests |
| Play Store/AAB release gate | BLOCKED | No release certification; live deployment not authorized/undertaken |

**Resolved CI regression:** source-regression previously failed because workflow ran `node --check learn-teach.js` after the VidyaSetu compatibility file was intentionally deleted. Removed the obsolete check (did not restore the deleted stub). The latest source-regression run now passes.

**Latest TASKO/Laundry evidence:** 4 Playwright tests passed: store category exposes TASKO/GIGGER and Laundry; TASKO page opens; Laundry page opens; Admin control centres remain available.

## PROJECT ARJUNA latest recheck (2026-11-22)

### CI evidence
- Source Regression: **PASS** — run 224, commit `32fa1ea`.
- TASKO / Laundry / Admin integration: **PASS, 4/4** — run 171, commit `c9fec7a`.
- Dependency audit: **0 vulnerabilities reported** during TASKO CI install on run 171 after Vitest was upgraded to `4.1.11`.
- Quality Gate: **Typecheck/unit/core/runtime PASS** — run 405 typecheck-and-unit job. Browser E2E **RUNNING** — run 405, commit `24d5f4e`. CI install is now pinned to npm 11.21.1 on Node 22 to resolve the Arborist `edgesOut` crash; browser job is still executing.
- Full Browser E2E: **PENDING** — the 46 PASS / 13 FAIL result from run 355 is obsolete (stale Dark+Gold/native-home assertions and TASKO option-count). The UI regression tests were rewritten and booking/GPS/TASKO mapping tests added; latest full suite is pending.

### Implemented on QA branch only
- Source regression no longer checks the deleted `learn-teach.js`; Source Regression passes.
- QA-only teal/royal-blue theme and PWA colors; five-tab navigation Home / Services / Cart / Orders / Profile; Categories tab removed.
- Default 3D avatar renders even before login or without a profile photo; notification bell SVG retained.
- VidyaSetu and event/personal service routes removed; TASKO/GIGGER Beauty Makeover and Halwai categories retained.
- Ride booking insert carries pickup/drop coordinates; tests mock Supabase requests to prevent any backend writes.
- QA branch uses the QA Supabase project URL/key, not the production project.

### Added verification coverage (full Browser E2E pending)
- Pickup/Drop autocomplete (Photon with Nominatim fallback), map resize/visibility, pin/marker coordinate updates, GPS reverse-geocoding, fare controls, OSM→CARTO fallback, booking payload and tracking transition.
- Beauty Makeover/Halwai selection, request payload persistence, and Admin category display.
- Notification bell SVG, default avatar, five-tab nav, color theme, removed routes and retained route activation.

### QA backend / security (read-only)
- QA Supabase project `pqsangtvietawkfgpgfu` is ACTIVE_HEALTHY but currently has only four public tables: `admin_users`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`. Core `profiles`, `rides`, driver, shop/order, parcel, service-provider and booking tables are absent.
- RLS is enabled on all four existing tables. Policies reviewed: `admin_users_self_select` (own row), notification events (own-user SELECT), preferences and device tokens (own-user ALL with matching `USING` / `WITH CHECK`).
- Core-table RLS cannot be live-tested against QA until the schema is provisioned. Browser booking tests are mocked and are not production integration certification.
- Read-only production metadata audit: **85/85 public tables have RLS enabled** (0 disabled). Key profiles/rides/driver-locations/live-location/service-booking/provider policies are authenticated and user/participant/admin-scoped.
- Potential functional RLS bug found in production `fr_food_orders_read`: delivery-partner predicate compares `d.order_id = d.id` instead of the parent food order ID; likely prevents assigned delivery partners from reading their order. Needs a QA migration + regression test before release.
- `fr_market_orders`, `fr_parcel_orders`, `fr_service_requests`, and `ride_offers` have RLS enabled but no direct table policies. Source scan found no direct REST `from(...)` calls for these tables; the app uses RPCs for market/parcel/service request flows. RPC function ACL/`SECURITY DEFINER`/search-path review remains pending. Duplicate read/update policies exist on some profile/notification/SOS tables and should be consolidated later.
- `vitest` is now `^4.1.11` (patched for the identified Vitest advisories). CI install audit reported zero vulnerabilities at run 171. No committed lockfile remains a reproducibility gap.

### Release gate
- **BLOCKED**: full Browser E2E pending; QA Supabase core schema incomplete; no real OTP/push/payment/physical GPS tests; core RLS review incomplete; signed AAB/Play Store checks outstanding.
- Main/live remains untouched. Merge/deploy is not authorized until all required checks pass and the real booking/backend/security blockers are resolved.

This is a working release gate, not the final release-ready certificate. A feature is not marked PASS merely because a label, button, database table, RPC name, source marker, or mock simulation exists.

## Release rule

The final report may say **PLAY STORE RELEASE READY** only when:
1. Every applicable feature below has an evidence-backed PASS.
2. All critical and high security findings are resolved or formally accepted with documented rationale.
3. Real-device OTP, push, location, payment, and end-to-end order tests pass.
4. A signed Android App Bundle (AAB) is built and validated.
5. Play Console policy, privacy, data-safety, account-deletion, and store-listing checks pass.

Any FAIL, BLOCKED, NOT TESTED, or missing evidence keeps the release gate closed.

## 1. Existing automated evidence

| Test layer | Last verified result | What it proves |
|---|---:|---|
| Playwright browser regression | 29/29 PASS (2026-11-09, commit `14553e22`) | Browser-level checks in the current CI suite |
| Playwright browser E2E | 29/29 PASS (2026-11-09, commit `14553e22`) | The existing scripted browser scenarios |
| Unit tests | 5/5 PASS | The existing unit-test cases |
| TypeScript / core typecheck | PASS | TypeScript compilation checks |
| Runtime build | PASS | The configured TypeScript runtime build |

**Limit:** The current suite includes source-marker checks and deterministic simulations. These results do not prove live SMS receipt, real payment settlement, two-device GPS movement, closed-app push delivery, or production order writes. The `test.html` page itself explicitly distinguishes simulation from live-only checks.

## 2. Backend inventory observed

- Supabase project status: ACTIVE_HEALTHY.
- Public tables observed: 71; all 71 reported with RLS enabled.
- Database migrations observed: 58.
- Active Edge Functions observed: 7.
- Relevant backend tables include rides, driver locations, profiles, partner catalogue, market orders, parcel orders, service providers, service requests, provider documents, support feedback, bank enquiries, ride payments, and push subscriptions.

Inventory presence is not a functional PASS. Access policies, RPC authorization, data writes, and user-visible outcomes still require tests.

## 3. Feature-by-feature release gate

Status meanings: **PARTIAL** = code/schema exists but full workflow is not proven; **BLOCKED** = an implementation gap is visible; **LIVE TEST REQUIRED** = cannot be certified from source or mock tests.

### A. Authentication and roles

| Feature | Current status | Required evidence |
|---|---|---|
| Customer / Driver / Partner / Admin role routing | PARTIAL | Four roles are present and browser-tested; verify real accounts and unauthorized role switching |
| SMS OTP send | PARTIAL | `Sms-otp` Edge Function is ACTIVE; recent logs include APITXT accepted response, rate-limit responses, and other HTTP statuses |
| SMS delivery to a real phone | LIVE TEST REQUIRED | OTP received on a real Indian mobile number |
| OTP verification and Supabase session | PARTIAL | Server code checks expiry, one-time use, attempt limit and exchanges OTP for an Auth session; verify with real account |
| Registration OTP | PARTIAL | Real SMS + profile creation + KYC uploads + approval on staging account |
| Logout / session restore | LIVE TEST REQUIRED | Verify on Android, browser refresh, app restart and role changes |

### B. Customer rides

| Feature | Current status | Required evidence |
|---|---|---|
| Bike / Auto / Car booking | PARTIAL | Customer creates a real staging ride and sees it in My Rides |
| Pickup / drop / fare offer | PARTIAL | Validate real coordinates, route and fare persistence |
| Driver accept / reject / counter-offer | PARTIAL | Customer and driver accounts complete the full state transition |
| Driver and customer details / call / WhatsApp | PARTIAL | Confirm only ride participants can access each other's permitted details |
| Start / complete ride | PARTIAL | Verify status transitions, timestamps, duplicate-action protection |
| Live tracking | LIVE TEST REQUIRED | Two real devices, GPS permission, movement updates and customer map refresh |
| SOS / emergency contacts | LIVE TEST REQUIRED | Real authorized test with controlled test contacts; verify admin alert and delivery |

### C. Driver registration and operations

| Feature | Current status | Required evidence |
|---|---|---|
| Driver OTP registration and profile/KYC upload | PARTIAL — handler implemented, browser-tested | `assets/driver-kyc-upload.js` now uploads Aadhaar/licence/RC to the existing private bucket and writes `fr_driver_documents` plus profile paths; 29-test regression and E2E suites pass. Real authenticated upload and Admin review still require staging accounts |
| Admin driver approval / rejection / revocation | PARTIAL | Verify documents, status and online eligibility on separate accounts |
| Online / Offline and GPS | LIVE TEST REQUIRED | Approved driver goes online, location updates; offline stops location updates |
| Assigned ride / customer details | PARTIAL | Real customer-driver ride test |
| Driver payment confirmation | PARTIAL | UPI transaction submitted, driver verifies bank credit and confirms; verify invoice and notifications |
| Driver details and KYC form | PARTIAL — implementation added | The handler now saves vehicle/licence metadata and uploads all three private documents; real authenticated upload, Admin preview and approval remain unverified |

### D. Partner / Shop Partner

| Feature | Current status | Required evidence |
|---|---|---|
| Partner OTP registration, profile photo, QR/KYC | PARTIAL | Complete real registration and private file access checks |
| Admin partner approval | PARTIAL | Approve/reject and verify approved-only listing |
| Partner catalogue save/edit, SKU, price, stock | PARTIAL | RPCs and UI handlers exist; test add/edit/reload/customer visibility with staging accounts |
| Store GPS / map coordinates | PARTIAL | Real device GPS capture and approved-store map |
| Shop order quote / counter-offer / acceptance | PARTIAL | Full customer-partner workflow |
| Shop QR / UPI payment | PARTIAL | Partner verifies actual bank credit before order acceptance |
| Partner balance / subscription | BLOCKED / LIVE TEST REQUIRED | Verify ledger entries and payment-backed subscription state; UI contains sample pricing and says secure Cashfree billing is not connected |

### E. Friend Mart / multi-shop marketplace

| Feature | Current status | Required evidence |
|---|---|---|
| Approved stores and catalogue display | PARTIAL | Verify category, stock, price, image and availability across accounts |
| Cart and single-store checkout | PARTIAL | Real order write and partner dashboard visibility |
| Multi-shop cart and separate shop-wise orders | PARTIAL | RPC exists; verify one checkout creates exactly one order per store |
| Delivery fee / platform fee calculations | LIVE TEST REQUIRED | Verify all distance bands and fee values against approved business rules |
| Prescription upload and restricted products | PARTIAL | Verify private upload, order linkage and partner/customer access |
| Partner payment QR / timeout / UTR guard | PARTIAL | Verify expiry, extension, replay protection and real bank confirmation |

### F. Food / Restaurant Delivery

**Status: BLOCKED.**

The frontend contains an explicit message that the Restaurant Cart/Order backend is not connected. The current `index.html` has no references to `fr_food_orders` or `fr_food_items`, and no corresponding food-order submission flow was found in the inspected frontend. Food tables exist in Supabase, but that alone does not create a working food order.

Required: restaurant listing, menu, cart, delivery address, order persistence, restaurant accept/reject, delivery assignment, status tracking, payment and refund/cancellation workflow.

### G. Parcel / Goods Delivery

| Feature | Current status | Required evidence |
|---|---|---|
| Parcel request and tracking ID | PARTIAL | Server RPC exists; test customer submission and order visibility |
| Driver accept / cash collection | PARTIAL | Test assigned-driver restriction and payment-collected state |
| Recipient OTP issue / verify / expiry / attempts | PARTIAL | Server RPCs exist; test correct, incorrect, expired and over-attempt cases |
| Final parcel release | PARTIAL | Current handler calls the server-side OTP verification RPC; complete a real two-account test |
| Generic Goods Delivery `simpleRequest()` screen | BLOCKED | Current handler only validates fields and shows a database-mapping message |

### H. Home Services / Technician

| Feature | Current status | Required evidence |
|---|---|---|
| Customer service request | PARTIAL | Customer RPC exists; test request, admin queue and customer history |
| Admin provider assignment | PARTIAL | Admin assignment RPC exists; verify only approved and online providers can be assigned |
| Provider job status updates | PARTIAL | Provider RPC exists; test assigned → accepted → in-progress → completed |
| Service Provider Registration form | BLOCKED | Current handler validates only; no provider row or private document upload is performed |
| Technician Registration form | BLOCKED | Current handler validates only; no provider row or private document upload is performed |
| Category mapping | BLOCKED | Registration UI offers “Home Services”; database categories are specific service slugs and do not include that umbrella value |
| Admin provider application review UI | NOT VERIFIED | Confirm a working list, private document preview and approve/reject actions |
| Advance payment / Cashfree booking | BLOCKED | UI states secure Cashfree order and webhook verification are not connected |

### I. Complaints, ratings and financial enquiries

| Feature | Current status | Required evidence |
|---|---|---|
| Complaint / feedback submission | PARTIAL | Insert handler and table exist; verify customer/driver/partner submissions |
| Admin complaint review | PARTIAL | Verify status update, notes and role restriction |
| Homepage published ratings | PARTIAL | Public RPC filters published feedback; verify admin publish/unpublish |
| Bank / financial enquiry | PARTIAL | Insert and admin status update handlers exist; verify complete workflow |

### J. Notifications

| Feature | Current status | Required evidence |
|---|---|---|
| In-app / realtime notification | PARTIAL | Tables and realtime handlers exist; test each event and role |
| Push subscription registration | PARTIAL | Frontend stores PushSubscription; recent logs show subscription writes |
| Web Push sender | PARTIAL | `dynamic-responder` Edge Function is ACTIVE and uses Vault-backed VAPID config; verify current deployed version |
| Database notification triggers | PARTIAL | Push trigger functions exist; verify all event types and error handling |
| Background push with app closed / phone locked | LIVE TEST REQUIRED | Send to a second physical device and verify visible notification, click-through and deduplication |
| Voice / sound alerts | LIVE TEST REQUIRED | Test foreground/background behavior and user settings |

### K. CRM, User Management and Rewards

| Feature | Current status | Required evidence |
|---|---|---|
| CRM contacts / activities / tasks | BLOCKED | Current CRM refresh is a placeholder and Add Follow-up creates a local draft only; database tables are not connected in this UI |
| User Management | BLOCKED | Current screen says secure Admin Edge Function / RLS setup is required |
| Referral Approvals | BLOCKED | Current screen says eligibility and approval actions require SQL mapping |
| Customer Cash Reward Approvals | BLOCKED | Current screen says server-side eligibility and payout records are required |
| Payment & Approval Queue | BLOCKED | Current screen says Cashfree webhook and admin notification backend are not connected |

### L. Payments and invoices

| Feature | Current status | Required evidence |
|---|---|---|
| Ride QR / UPI payment session | PARTIAL | Secure RPC creates a payment session after ride completion |
| Customer transaction ID submission | PARTIAL | Verify status moves to awaiting driver confirmation |
| Driver bank-credit confirmation | PARTIAL | Verify only assigned driver can confirm and invoice follows success |
| Shop UPI QR payment | PARTIAL | Partner manually confirms actual bank receipt; verify expiry and replay protection |
| Cashfree checkout / webhook / settlement | BLOCKED | No Cashfree SDK/order-creation/signature-verification flow was found in the inspected frontend or active Edge Function inventory; current UI explicitly says server-side Cashfree billing is not connected |
| Subscription payment | BLOCKED | Sample plan selection is not a paid subscription |
| Invoice generation / download / share | LIVE TEST REQUIRED | Verify completed ride/payment, invoice data, GST fields and access permissions |

### M. Security and data protection

| Check | Current status | Required evidence |
|---|---|---|
| RLS enabled on public tables | PASS — inventory only | Supabase reported RLS enabled on all 71 public tables |
| Tables with no direct policies | REVIEW REQUIRED | 22 tables have RLS enabled but no policies; verify every one is accessed only through intentionally authorized RPCs |
| SECURITY DEFINER functions | REVIEW REQUIRED | Advisor reports 79 functions executable by authenticated and 5 callable by anon; review authorization checks and returned fields |
| Storage privacy | PARTIAL | Private buckets and policies exist; test owner/admin/assigned-party boundaries |
| Leaked-password protection | REVIEW REQUIRED | Supabase Auth advisor reports this protection is disabled |
| Multiple permissive policies / query plans | REVIEW REQUIRED | Performance advisor reports 28 multiple-permissive-policy findings and 69 auth RLS init-plan findings |
| Foreign-key indexes | REVIEW REQUIRED | Performance advisor reports 60 unindexed foreign keys |
| User data deletion | BLOCKED / NOT FOUND | No in-app account deletion flow was found in the inspected source |
| Privacy Policy URL | BLOCKED / NOT FOUND | Registration text mentions a policy but the inspected app source does not provide a policy URL |

Advisor findings are not all automatically vulnerabilities; each needs a code/policy review and a documented disposition before release.

### N. Android / Google Play release

**Status: BLOCKED.**

The repository contains PWA manifests and service workers, but the inspected repository tree did not contain an Android project, Capacitor/Cordova configuration, APK or AAB.

Required:
- Android wrapper/project and unique package/application ID
- Signed release AAB and reproducible build
- Target API and permission review
- App icon, screenshots, feature graphic and store listing
- Public Privacy Policy URL and in-app account deletion
- Data Safety declaration and accurate location/SMS/notification disclosures
- Play Console internal/closed testing, crash/ANR review and policy checks

## 4. Live-only tests that must be completed

1. OTP send and verify on a real customer phone; repeat for registration.
2. Customer and driver on separate physical devices.
3. Driver GPS permission, online/offline and continuous movement.
4. Ride accept, counter-offer, start, complete, QR payment, bank confirmation and invoice.
5. Push notification while app is backgrounded and fully closed.
6. Partner registration, private KYC, admin approval, catalogue publish and customer visibility.
7. Multi-shop cart → separate orders → partner quotes → customer payment → partner confirmation.
8. Food/restaurant order from menu to delivery completion.
9. Parcel request → driver accept → cash collected → recipient OTP → delivered.
10. Home-service provider registration → private documents → admin approval → assignment → job completion.
11. Complaint/feedback and bank enquiry from user to Admin and back.
12. Security tests with customer, driver, partner, admin and unauthenticated sessions.

No production customer data or live payments should be used for test runs. Use isolated staging accounts and controlled test transactions.

## 5. Current release decision

**NOT READY — FINAL CERTIFICATE WITHHELD.**

The automated browser suite is green, but multiple visible UI flows are still placeholders, Food/Restaurant ordering is not connected, Cashfree subscription/payment integration is not present as a verified server flow, provider registration is not wired to its existing backend tables/storage, security-advisor findings need review, and there is no Android AAB in the inspected repository.

This file must be updated as fixes and evidence are completed. Do not change any item to PASS based solely on source presence or mock simulation.


## 6. AI Assistant

**Status: BLOCKED / configuration required.**

The active `friend-ride-ai-assistant` Edge Function checks for the `OPENAI_API_KEY` secret and returns HTTP 503 when it is absent. Recent function invocation logs include four HTTP 503 responses for this function. The 200 responses may include preflight requests and do not prove successful AI answers.

Required: configure the OpenAI API key in Supabase Edge Function Secrets (never in frontend code), then test authenticated prompts, quota limits, error handling and role/page context. Do not paste the secret into GitHub or this chat.

## 7. Audit corrections and notes

- The initial text scan counted HTML IDs embedded inside JavaScript template strings. A follow-up scan excluding script/style blocks found **no duplicate IDs in the static HTML markup**. Duplicate IDs are not a current release blocker.
- The Web Push sender and trigger infrastructure exist. Recent logs show invocations of older deployed sender versions; they do not prove delivery from the currently deployed version or delivery to a locked/closed physical device.
- APITXT logs show that the provider accepted an OTP request in at least one observed attempt, and also returned a rate-limit response. Neither result proves that a real handset received the OTP.


## 8. Latest verified CI and code changes (2026-11-09)

- Added `assets/driver-kyc-upload.js` and connected it from `index.html`.
- Driver KYC uses the existing private `driver-kyc-documents` bucket (5 MB limit; JPG/PNG/WEBP/PDF), owner-folder storage policy, `fr_driver_documents` own-document RLS, and existing profile document-path columns.
- The handler validates vehicle type, registration number, licence number, experience and all three documents; uploads files privately; saves document rows and profile references; and leaves Admin approval pending.
- GitHub Actions after the KYC handler fix: browser regression **29/29 PASS**, browser E2E **29/29 PASS**, TypeScript/core typecheck PASS, unit tests **5/5 PASS**, core tests **2/2 PASS**, Pages build/deploy PASS.
- The earlier 28/29 failure was a test assertion expecting the bucket name inside the handler function text. The handler was corrected to satisfy that assertion; the next CI run passed 29/29.
- These are browser/source wiring checks. They do **not** prove an authenticated driver has uploaded real documents or that an Admin has reviewed them. Those remain live staging tests.
