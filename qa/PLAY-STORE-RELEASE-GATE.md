# FRIEND RIDE — Play Store Release Gate

**Audit date:** 2026-11-09  
**Branch audited:** `main`  
**Audited commit:** `11269614f66b5ff21c361675a14d4791b0ce6cfa`  
**Release decision:** **BLOCKED — NOT CERTIFIED FOR PLAY STORE**

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


## 9. Fresh Phase 2 security audit addendum (2026-11-23)

**Decision remains BLOCKED — NOT CERTIFIED.** The current read-only evidence is recorded in [`docs/ARJUNA_X_PHASE2_SECURITY_EVIDENCE.md`](../docs/ARJUNA_X_PHASE2_SECURITY_EVIDENCE.md); reusable catalog queries are in [`qa/phase2-security-audit.sql`](phase2-security-audit.sql).

- Production project: 85 public tables, 85 RLS enabled, 0 disabled, 23 with no policies (INFO); Security Advisor reports 6 anon-executable SECURITY DEFINER, 88 authenticated-executable SECURITY DEFINER, and leaked-password protection disabled (WARN).
- QA project: 21 public tables, all RLS enabled, none without policies; Security Advisor reports 25 authenticated-executable SECURITY DEFINER and 1 anon-executable SECURITY DEFINER. Function-body/catalog review is preliminary and negative role tests are still required.
- QA notification dispatch v7 has JWT verification disabled but checks the dispatch-secret header; it currently selects queued rows without an atomic claim. QA has 0 notification events and 0 active tokens. The register-token function v5 verifies JWT and calls `auth.getUser()`.
- Latest main SHA `64845496f22487788aedbcf66b74147add3ab9c1`: Pages build/deployment run 45039256929 passed. Combined commit status returned no checks. This deployment run is not regression test evidence. Phase 2/3 branch CI is not verified.
- Main `index.html` hardcodes production Supabase configuration; QA E2E isolation is not yet implemented. The FCM opt-in file is present but not loaded from the main entry point.
- No production/QA database mutation, grant change, Auth configuration change, merge, or deployment was performed during this audit.

**Open release blockers:** Auth leaked-password protection; full production RPC authorization review and role-negative tests; owner confirmation for the 23 policy-free RLS tables and intentional public functions; QA-only frontend configuration and safe E2E; atomic notification claim/retry fix; FCM integration plus real device/token tests; real OTP/GPS/payment/ride tests; CI/regression evidence; Android AAB and Play Console gates.


## 10. Phase 2 QA isolation patch (2026-11-23)

A branch-only test isolation patch is now present on `arjuna-x/phase-2-security-closure`: the browser tests inject a test Supabase target, use an offline placeholder by default, block production Supabase requests, and only allow the QA host when the explicit test flag is enabled. Four existing specs use the shared fixture; a new isolation spec has two checks. Regression/Quality push triggers were added for the Phase 2 branch; Regression also has a PR trigger.

Node syntax checks passed for the fixture, isolation test, and changed client-config snippet. **Full Playwright/CI results are still pending**, so this patch is not accepted and the release gate remains blocked. See the Phase 2 security evidence document for details.


## 11. Notification queue claim patch prepared (2026-11-23)

An additive, **unapplied** migration and QA Edge Function patch now use a service-role-only atomic `FOR UPDATE SKIP LOCKED` claim RPC, a 10-minute processing lease, and claim-token-guarded finalization. Static contract test passed 2/2 locally; TypeScript parse diagnostics were 0. Deno/runtime, QA migration/function deployment, concurrency, real push, and rollback tests are still **NOT TESTED**. No database or Edge Function was changed live. Release remains BLOCKED.


## 12. Production RPC/RLS triage (2026-11-23)

Read-only follow-up found **0/23** client-role direct SELECT/INSERT/UPDATE/DELETE grants on the RLS-enabled/no-policy production tables. Eight exposed admin RPCs all call `is_friend_ride_admin()`, which checks the caller against `admin_users`. Service-only functions were identified and reviewed for role grants. Public approved-list/feedback functions remain owner-acceptance items; the 88 authenticated SECURITY DEFINER warnings and full role-negative testing remain open. This reduces the no-policy-table access risk but does not close Phase 2 or the release gate.


## 13. FCM helper isolation and static tests (2026-11-23)

The dormant `fcm-web-push.js` helper now honors test-only QA/offline Supabase injection (not yet loaded by the main app). Local mirrored-source checks **5/5 PASS** for the notification claim and QA isolation contracts. Latest branch CI still pending; no QA API request, token, event, secret, database write, or Edge deployment. Production no-policy table grants were rechecked as 0/23 for anon/authenticated SELECT/INSERT/UPDATE/DELETE; eight admin RPCs use the admin membership helper. Release remains blocked by Auth setting, full RPC review/negative tests, notification runtime deployment/tests, and device/live checks.


## 14. QA migration syntax and rollback check (2026-11-23)

The proposed notification claim migration passed a PostgreSQL syntax test inside an explicit QA `BEGIN … ROLLBACK` transaction. Post-rollback catalog checks confirmed no claim column/function persisted. A guarded QA rollback script was added (refuses if events are processing). **No QA migration or Edge Function deployment has been applied.** Release remains BLOCKED.


## 15. Production search_path and function authorization triage (2026-11-23)

All 102 SECURITY DEFINER functions have explicit search_path (79 empty, 16 public, 4 public/auth, and 3 other pg_catalog/public variants). A static relation-reference scan of the 16 public-path functions found no likely unqualified table references. Six additional authenticated-only delivery/payment/Laundry/TASKO functions were reviewed and their ownership/admin/state guards were confirmed. These are source/catalog reviews, not role-negative tests; the 88 authenticated warnings remain open.


## 16. Guarded rollback syntax test (2026-11-23)

QA rollback script passed a syntax/execution test inside explicit BEGIN/ROLLBACK; catalog check confirmed no claim columns/function persisted. The test ran against the current empty queue only, not after a deployed migration. No QA schema change was left behind.


## 17. CI scope correction (2026-11-23)

First browser run on Phase 2 head `ff45be49`: source-regression PASS; quality typecheck/unit PASS (9 Node unit, 5 core tests); TASKO/Laundry/Admin Playwright PASS 4/4; main browser regression and quality browser E2E FAIL 49/59, with all 10 failures in the Phase 3 Dark+Gold UI spec (expected selectors absent on main-based Phase 2 branch). Added `npm run test:phase2` and branch-scoped workflow steps for main/Phase 2; the full UI suite remains on UI migration branches. Rerun pending. Release remains BLOCKED.


## 18. Expanded RPC classification and QA dispatch rollback source (2026-11-23)

Eight authenticated-executable SECURITY DEFINER functions without simple auth markers were reviewed as read-only approved/public lists/payment-option details; six anon functions are read-only. Fifteen functions call the admin-membership helper, eight use the approved-driver helper, and service-only/trigger functions were classified. The full 72 auth.uid()-guarded functions still need role-negative tests. QA dispatch v7 rollback source is preserved in the branch. Latest head has no visible CI status/run evidence; scoped rerun remains unverified.


## 19. Scoped Phase 2 CI PASS (2026-11-23)

On code/workflow commit `28fc0d7bcdde973b980613a7982a38d1cb72ee77`: source-regression PASS; quality typecheck/unit PASS (9 Node unit + 5 core tests); quality browser suite PASS 49/49; FRIEND RIDE regression PASS 49/49; TASKO/Laundry/Admin Playwright PASS 4/4. The full Dark+Gold UI suite is deferred to Phase 3. Latest docs/rollback-source-only head has no visible combined statuses; the code/workflow scope-fix commit is verified. Release remains BLOCKED.
