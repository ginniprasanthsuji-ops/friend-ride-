# FRIEND RIDE Project ARJUNA X — Phase 2 Security Closure Audit

**Audit timestamp:** 2026-11-23 (India time; Supabase advisor observations at 04:31 UTC)  
**Work branch:** `arjuna-x/phase-2-security-closure`  
**Base commit:** `64845496f22487788aedbcf66b74147add3ab9c1` (latest main observed at audit start)  
**Status:** **BLOCKED — audit is evidence, not remediation or release acceptance**  
**Scope:** Read-only inspection of GitHub source, Supabase advisors/catalog, and QA Edge Function source. No database, auth setting, function, secret, or production write was performed.

## 1. Production security evidence (read-only)

Production Supabase project `friend-ride` (`fglyplxcczdjtfwobtzh`):

- **85** public tables; **85/85 RLS enabled**, **0** RLS-disabled tables.
- **23** public tables have RLS enabled but no policy (advisor INFO). RLS with no policy is deny-by-default for client roles; confirm these tables are intentionally service-role/internal only before release.
- Advisor findings: **6** anonymous-executable SECURITY DEFINER functions (WARN), **88** authenticated-executable SECURITY DEFINER functions (WARN), and **1** leaked-password-protection setting disabled (WARN).
- Read-only catalog aggregate: 103 public functions; 102 SECURITY DEFINER; 7 functions executable by anon (6 are SECURITY DEFINER); 89 executable by authenticated; 0 SECURITY DEFINER functions with no explicit search_path; 79 set an empty search_path; 74 definitions contain `auth.uid()`; 4 contain an `admin_users` guard; **28 SECURITY DEFINER functions lack both simple markers and require manual classification**. These marker counts are triage only, not proof of authorization.

### Anonymous SECURITY DEFINER functions reviewed by source

The 6 advisor-listed public functions return public-facing data:

- `fr_customer_list_approved_stores_geo`: approved partner store names/categories/addresses/coordinates.
- `fr_customer_list_partner_catalogue`: available catalogue for an approved store.
- `fr_get_platform_business_details`: platform legal name, toll-free number, GSTIN, update timestamp.
- `fr_learn_teach_is_admin`: boolean role check; evaluates against `auth.uid()`.
- `fr_list_approved_partner_stores`: approved store names/categories/addresses.
- `fr_public_homepage_feedback`: only feedback rows with `kind='feedback'`, `show_on_homepage=true`, `status='published'`, limited to 20.

All six use explicit search_path configuration. Most use an empty path; two listing/helper functions use `public` but fully qualify their referenced public tables. **Owner confirmation that these data surfaces are intended public is still required; no grants were changed.**

### Production blocker

Leaked Password Protection is disabled per Supabase Security Advisor. This is an Auth dashboard setting and is not exposed through the available read-only project tools. Owner must enable it and re-run the advisor.

## 2. QA security evidence (read-only)

QA project `FRIEND RIDE QA` (`pqsangtvietawkfgpgfu`, ACTIVE_HEALTHY):

- **21/21** public tables have RLS enabled; **0** disabled and **0** public tables without policies.
- **27** public SECURITY DEFINER functions. All have explicit search_path; **25** use an empty path and **2** use `public`.
- Advisor findings: **25** authenticated-executable SECURITY DEFINER functions and **1** anon-executable SECURITY DEFINER function.
- Source/catalog review: 22 of the 25 authenticated-executable functions contain `auth.uid()` authorization checks; the other 3 are read-only approved provider/store lists or the published homepage-feedback endpoint. This is a source review, **not** role-based runtime testing.
- Feedback RLS: authenticated insert is own-user only and requires new/unpublished/no admin note; read is own or admin; updates are admin-only.
- QA security advisor did not report a leaked-password-protection finding in this run.

No security-definer grants, policies, schema, or Auth settings were changed. The SECURITY DEFINER warnings remain open pending negative role tests and formal risk acceptance where the exposed RPC is intentional.

## 3. Notification system evidence

QA Edge Functions as observed:

| Function | Version | JWT verification | Review |
|---|---:|---|---|
| `fr-notification-register-token` | 5 | Enabled | Requires Bearer session, validates with `auth.getUser()`, associates token with verified user |
| `fr-notification-dispatch` | 7 | Disabled | Checks `x-dispatch-secret` against `FR_NOTIFICATION_DISPATCH_SECRET`; requires service/FCM environment; do not expose or log values |

Dispatch source selects up to 50 `queued` events and updates each row after sending. There is **no atomic claim/lock**; overlapping invocations can send duplicate notifications. Current QA snapshot: **0 notification events and 0 active tokens**. The status CHECK allows only queued/sent/failed/skipped, so an atomic claim/retry fix needs a reviewed additive QA migration and tests before deployment.

The frontend opt-in implementation exists in `fcm-web-push.js`, but latest main `index.html` has **no reference to that file or the registration function**. The registration flow therefore is not wired into the current app entry point. Background-worker source exists, but end-to-end push remains unverified.

## 4. QA/prod environment isolation

Latest main `index.html` hardcodes the production Supabase URL and public publishable key and constructs the client directly. It has no QA environment override. This prevents safe authenticated E2E from the app without risking production API calls.

**Required:** add an explicit test-only QA config injection path, fail closed in QA mode if QA project URL/key are absent, and block production Supabase requests in QA browser tests. Do not place service-role keys or other secrets in browser source or GitHub logs. QA publishable key may be public but should be provided through controlled test config.

## 5. CI / test evidence

- Latest main observed: `64845496f22487788aedbcf66b74147add3ab9c1`.
- GitHub Pages build/deployment run **45039256929** completed **success** for that commit. This is a deploy workflow only, not regression acceptance.
- Combined commit status API returned **no status checks** for the latest main SHA.
- Phase 3 work branch `arjuna-x/phase-3-navy-orange-ui` latest observed commit `5beca9df28822de4e1f88b8ff954c7758927b38c`: combined statuses **[]**; branch workflow-run query returned **0**.
- Existing regression workflow push trigger does not include the Phase 2 security branch; Quality workflow pushes only on main and PRs targeting main. No current CI evidence for this Phase 2 branch.
- No local npm/Playwright run in this audit (repository network/clone access was not available earlier; dependencies/browser not established in this run).

## 6. Findings and next safe steps

| Priority | Finding | Closure evidence required |
|---|---|---|
| P0 release gate | Leaked Password Protection disabled (production advisor) | Owner enable in Supabase Auth; fresh advisor PASS |
| P0 release gate | Production 88 authenticated + 6 anon SECURITY DEFINER warnings not fully role-tested | Per-function review, negative tests as anon/customer/driver/partner/non-admin/admin; owner acceptance for intentional public functions |
| P1 | Production 23 RLS-enabled tables without policies | Confirm internal/service-role-only design; test no browser role can read/write; document owner |
| P1 | QA frontend hardcodes production project | QA-only config injection + fail-closed + request-block tests |
| P1 | Notification dispatch lacks atomic event claim | Additive QA migration/function patch; concurrency/retry test; QA deployment and rollback verification |
| P1 | Push opt-in file is not included by index | Wire UI/registration to entry point; QA token registration and closed-app push test |
| P1 | QA active tokens and queue are empty | Owner test account and supported mobile/browser device(s) for real token/delivery |
| P1 | Authenticated E2E credentials/device/OTP unavailable in audit | Owner-provided QA accounts, OTP access and test devices; never record secrets in docs |
| P2 | QA performance advisor: 17 unindexed FK, 40 auth-RLS initplan warnings, 10 unused-index INFO, 5 multiple-permissive-policy WARN | Later performance phase; verify workload before adding/removing indexes or rewriting policies |

## 7. Gate decision

**Phase 2 is not closed. Release remains BLOCKED.** No production changes, merge, deployment, grant revocation, secret inspection, or destructive migration occurred. This document and `qa/phase2-security-audit.sql` are read-only evidence artifacts. Next run should address the QA/prod isolation patch and the notification queue claim design only after source review and safe tests; Auth dashboard configuration and real-device/credential tasks require the owner.


## Continuation — QA isolation patch (2026-11-23)

**Implemented on this work branch; not merged and not yet CI-accepted.**

- Added a test-only Supabase config injection path in `index.html`. Normal production runtime still uses the existing production URL/key; Playwright test mode cannot select that production URL and falls back to `https://qa-offline.invalid` when no QA config is supplied.
- Added `qa/fixtures.cjs`: all Playwright page tests are now offline by default and block Supabase requests. If QA URL + public anon key are supplied, the browser client is configured to that non-production project; requests remain blocked unless the explicit `FRIEND_RIDE_QA_E2E_ENABLED=true` switch is also set. Production host is never allowed by the fixture.
- Converted the four existing Playwright spec files to the shared fixture and added `qa/phase2-isolation.spec.cjs` (2 assertions) to verify test mode and non-production target.
- Added Phase 2 branch push triggers to Regression and Quality workflows; Regression also runs for pull requests targeting main.
- **Local validation:** `node --check` passed for the shared fixture, isolation spec, and the changed app-config snippet. This is syntax-only, not full inline-script validation or Playwright execution.
- **Not yet verified:** GitHub Actions status/run, full browser regression, QA authenticated integration, any QA database mutation. No Supabase request was allowed from the test harness in this run.

This patch reduces the risk of QA browser tests hitting production, but it does not yet prove safe authenticated E2E. The main branch is unchanged; the patch is on `arjuna-x/phase-2-security-closure` pending CI review.


## Continuation — notification queue claim patch prepared (2026-11-23)

- Added an **unapplied** additive migration `supabase/migrations/202611230001_fr_notification_claim_batch.sql`: claim_token/claimed_at columns, processing status, partial claim index, `FOR UPDATE SKIP LOCKED` claim RPC, and service-role-only execute grant.
- Added QA dispatch source `supabase/functions/fr-notification-dispatch/index.ts`: obtains OAuth before claiming, claims up to 50, filters final status updates by the claim token, clears the lease on finalization, and reclaims processing events older than 10 minutes. The shared-secret check remains; JWT verification remains disabled.
- Added read-only post-deployment verification SQL and a static unit contract test.
- **Local checks:** the static contract test ran **2/2 PASS**; TypeScript parser diagnostics **0** (parse only; Deno type/runtime checks not run).
- **Not applied/deployed:** migration not executed on QA, Edge Function not deployed, no queue rows or tokens were created. Concurrency/runtime delivery and rollback verification remain pending. A send-success followed by DB-finalization failure can still lead to at-least-once retry/duplicate delivery after the 10-minute lease; this is documented as a residual risk.

This is a reviewed work-branch patch, not Phase 2 acceptance. QA deployment requires migration/function compatibility validation and a controlled synthetic QA event/token; production remains untouched.


## Continuation — production RPC/RLS triage (2026-11-23)

- The 23 production tables with RLS enabled and no policies were rechecked: direct `anon` and `authenticated` privileges for SELECT, INSERT, UPDATE, and DELETE are **0/23** for each operation. These tables are therefore not directly accessible to client roles; confirm the intended internal/service-role-only ownership with the owner.
- Eight exposed admin RPC bodies were reviewed: `admin_list_driver_applications`, `admin_list_driver_documents`, `admin_review_driver`, `admin_set_driver_status`, `fr_admin_assign_service_provider`, `fr_admin_list_partner_applications`, `fr_admin_list_service_requests`, and `fr_admin_review_partner`. All call `public.is_friend_ride_admin()`; that helper checks `admin_users.user_id=(select auth.uid())`. Runtime negative tests as non-admin remain unrun.
- Service-only helper review: `fr_get_push_runtime_config` checks `auth.role()='service_role'` and has no anon/authenticated EXECUTE; `fr_notification_hourly_enqueue`, `fr_process_market_payment_timeouts`, `fr_process_partner_order_timeouts`, `fr_start_partner_order_routing`, and `cleanup_expired_friend_ride_rides` have no anon/authenticated EXECUTE. Several use a service-role or admin guard internally. Trigger functions are not client-executable.
- Public/approved-list RPCs are read-only, but owner acceptance remains: store coordinates/address, approved catalogue, platform GSTIN/toll-free details, approved provider phone/service area, payment-option details for approved stores, and published homepage feedback are exposed through intended listing RPCs. `fr_customer_store_payment_options` is authenticated-only; the other public surfaces are the six advisor-listed anon functions.
- The marker-less 28-function set is partially classified, not fully accepted. The 88 authenticated SECURITY DEFINER warnings remain open until every function is reviewed and role-negative tests are recorded. The fixed-ID `is_admin()` helper requires owner identity confirmation.


## Continuation — FCM helper isolation and local static tests (2026-11-23)

- The dormant `fcm-web-push.js` helper now uses the same test-only QA/offline Supabase injection as the main app. Production default remains unchanged. The file is still **not loaded from `index.html`**, so notifications are not integrated yet.
- Local mirrored-source checks: **5/5 PASS** (2 notification claim contract assertions + 3 QA config/fixture isolation assertions). Node syntax checks previously passed for the fixture, isolation spec and main app config snippet. The exact GitHub branch unit suite and browser tests are now pending CI on the latest head; no QA API request, token, event or secret was used.
- The production 23 no-policy RLS tables have 0 direct anon/authenticated SELECT/INSERT/UPDATE/DELETE grants. Eight admin RPCs were reviewed and call `is_friend_ride_admin()`; its helper checks the caller against `admin_users`. Service-only helper grants and trigger functions were triaged. The public/approved-list RPC outputs and all 88 authenticated SECURITY DEFINER warnings still need owner acceptance and runtime negative tests.


## Continuation — QA migration syntax/rollback verification (2026-11-23)

- The proposed notification claim migration was executed inside an explicit QA `BEGIN … ROLLBACK` transaction to validate PostgreSQL syntax. The query returned successfully.
- Post-rollback catalog check: `claim_token` column **false**, claim function **false**; QA schema remains unchanged.
- Added a guarded QA rollback script `qa/phase2-notification-claim-rollback.sql`; it refuses rollback if any notification event is in `processing` and removes only the additive claim artifacts.
- No migration was applied, no Edge Function deployed, no queue/token rows created, and no secrets accessed.


## Continuation — production non-empty search_path and authorization review (2026-11-23)

- Production SECURITY DEFINER search_path configurations: 79 empty; 16 `public`; 4 `public, auth`; 1 `pg_catalog, public`; 1 `pg_catalog, public, auth` with `row_security=off`; 1 `pg_catalog, public, vault, net`. No function had an unset search_path.
- Static catalog triage of all 16 `search_path=public` functions found no likely unqualified relation references after stripping explicitly qualified names. This is a heuristic, not proof; function-body review is still required.
- Six additional authenticated functions were reviewed: `fr_can_access_delivery_order` verifies customer/driver ownership across ride/parcel/food/shop; `fr_can_read_partner_payment_qr` checks authenticated customer, pending payment, and expiry (row_security=off); Laundry/TASKO provider transitions require the assigned provider and validate state transitions; TASKO admin payment verification checks `admin_users`; TASKO payment submission requires the booking customer and valid reference. All are authenticated-only, with no anon EXECUTE.
- The 28 marker-less functions are now partially classified into admin-helper-protected RPCs, read-only approved/public listing functions, service-only maintenance/notification functions, and trigger functions. Remaining function-by-function role tests are still open.


## Continuation — guarded rollback syntax test (2026-11-23)

The QA rollback script was also tested in an explicit rollback transaction (internal BEGIN/COMMIT converted to outer BEGIN/ROLLBACK). It executed successfully. Post-rollback verification again confirmed claim columns/function are absent. This validates SQL syntax and guard on the current empty QA queue; it does not test rollback after a deployed claim migration or processing rows.


## Continuation — first CI browser failure and scope correction (2026-11-23)

### Exact first-run CI results (head `ff45be49dafe3b99f12f0ea89ee06584a6e9eb63`)

- `source-regression`: **PASS** — inline JS check and `learn-teach.js` syntax.
- `typecheck-and-unit`: **PASS** — typecheck, core typecheck, runtime build, **9/9 Node unit tests**, **5/5 core tests**.
- TASKO/Laundry/Admin Playwright workflow: **PASS, 4/4 tests**.
- Main browser regression and Quality browser E2E: **FAIL, 49 passed / 10 failed each**. All 10 failures are in `qa/dark-gold-route-regression.spec.js` (missing `#sendLoginOtpButton` and Dark+Gold UI selectors). This Phase 2 branch is based on main, where the Phase 3 Dark+Gold UI migration is not present; this was a branch/test-scope mismatch, not an isolation-test failure.

### Scope fix on the Phase 2 branch

- Added `npm run test:phase2` to run `friend-ride.spec.cjs`, TASKO/Laundry regression specs, and `phase2-isolation.spec.cjs` only.
- Updated Regression and Quality workflows: main and Phase 2 branches use the Phase 2 baseline suite; full Dark+Gold UI regression remains on UI-migration branches.
- This is not test suppression: the Dark+Gold spec remains in the full `npm test` suite and will be exercised on the Phase 3 UI branch. Rerun CI on the new head is pending.


## Continuation — expanded production function classification and v7 rollback source (2026-11-23)

- The 8 authenticated-executable SECURITY DEFINER functions with no simple `auth.uid()`/`admin_users`/`is_friend_ride_admin()` marker are read-only: approved provider list (phone/service area), approved store list, public geo listing, approved catalogue, authenticated store payment options (UPI/PhonePe/QR path), public platform business details (legal name/toll-free/GSTIN), public approved-store list, and published homepage feedback. Owner must confirm these fields are intentionally visible. All six anon-advisor functions are read-only; the admin-check helper returns only a boolean.
- 15 functions call `is_friend_ride_admin()`; 8 admin RPCs reviewed explicitly, plus cancellation/routing/admin helpers. Eight functions call `is_approved_driver()`. The 28 marker-less set is now classified into read-only lists/payment details, admin-helper functions, service-only maintenance/notification functions, and triggers; the 72 authenticated-executable functions with `auth.uid()` still need full role-negative tests.
- The current QA dispatch Edge Function v7 source is preserved at `qa/rollback/fr-notification-dispatch-v7.ts` for rollback. Current QA metadata: version 7, ACTIVE, verify_jwt=false; source SHA `e5c43e09b4738dac2f66f0199d7bacc79c8ea44fd558c633b71de6d1e0b1a7dc`. No secret values were inspected.
- Latest Phase 2 branch head `b79988712275489d7e6a324664dee10b841534ac` has no combined status entries; PR-filtered workflow-run retrieval returned no runs for this head. The new branch-scoped CI rerun is therefore **not verified yet**.


## Continuation — scoped Phase 2 CI PASS (2026-11-23)

Verified CI head `28fc0d7bcdde973b980613a7982a38d1cb72ee77` (scope-fix code/workflow commit):

- `source-regression`: **PASS**.
- `quality/typecheck-and-unit`: **PASS** — 9/9 Node unit tests, 5/5 core tests; typecheck/core typecheck/runtime build passed.
- `quality/browser-e2e` using `test:phase2`: **PASS, 49/49**.
- `friend-ride-regression/browser-regression` using `test:phase2`: **PASS, 49/49**.
- TASKO/Laundry/Admin Playwright: **PASS, 4/4**.

The full Dark+Gold UI suite remains deferred to the Phase 3 UI branch. Latest branch head `ddfc...` only adds documentation and the preserved QA v7 rollback source after the passing CI head; those latest documentation/backup-only changes have no combined status entries. Phase 2 scoped code/workflow CI is verified on `28fc...`.


## Continuation — fresh advisor snapshot and CI-run re-verification (2026-11-23)

**Fresh Supabase Security Advisor snapshot:** observed at 2026-11-23T04:57:18Z (read-only; no changes made).

- Production `friend-ride`: 23 RLS-enabled/no-policy INFO; 6 anon-executable SECURITY DEFINER WARN; 88 authenticated-executable SECURITY DEFINER WARN; 1 leaked-password-protection WARN (still disabled).
- QA `FRIEND RIDE QA`: 1 anon-executable SECURITY DEFINER WARN; 25 authenticated-executable SECURITY DEFINER WARN. No advisor findings in this snapshot were remediated by this run.
- Both Supabase projects reported `ACTIVE_HEALTHY`.

**CI re-verification for scoped Phase 2 code/workflow commit `28fc0d7bcdde973b980613a7982a38d1cb72ee77` (GitHub Actions runs queried by commit SHA):**

| Workflow / run | Result | Verified job summary |
|---|---|---|
| FRIEND RIDE workflow regression / `45114175251` | PASS | `source-regression`; inline JS and `learn-teach.js` syntax checks passed |
| FRIEND RIDE Quality Gate / `45114175357` | PASS | `browser-e2e` Phase 2/main safe suite passed; full UI-migration suite skipped by branch scope; typecheck/unit job passed (`test:unit`, `test:core`, typechecks, runtime build) |
| TASKO Laundry Main Integration Regression / `45114175263` | PASS | TASKO/Laundry/Admin Playwright job passed |
| FRIEND RIDE Regression / `45114175328` | PASS | Phase 2/main safe browser suite passed; full UI-migration suite skipped by branch scope |

The previously recorded exact suite totals remain: 49/49 safe browser tests, 9/9 Node unit tests, 5/5 core tests, and 4/4 TASKO/Laundry/Admin Playwright tests. **These passes apply to commit `28fc0d7...`, not to later docs/rollback-only branch commits.** Combined status API remains empty; workflow-run and job records above are the evidence. No merge, deployment, database write, Auth change, secret access, or production action occurred. Phase 2 remains blocked by the open security review and owner/device/credential tasks listed above.


## Continuation — latest-head Phase 2 CI verification (2026-11-23)

**Verified branch head:** `97ea3fd40758eb6a0ce0337ccfa08ce826da320d` (PR #39, draft, base `main`). This head's GitHub Actions runs completed successfully:

| Workflow / run | Verified result |
|---|---|
| FRIEND RIDE workflow regression / `45114870952` | PASS — inline JavaScript and `learn-teach.js` syntax checks |
| FRIEND RIDE Quality Gate / `45114871004` | PASS — typecheck, core typecheck, runtime build, 9/9 Node unit tests, 5/5 Vitest core tests, and Phase 2 browser suite 47/47 |
| TASKO Laundry Main Integration Regression / `45114870960` | PASS — 4/4 TASKO/Laundry/Admin Playwright tests |
| FRIEND RIDE Regression / `45114871023` | PASS — Phase 2 safe browser suite 47/47 |

Both browser workflows skipped the full UI-migration/Dark+Gold route regression by branch scope. This is an explicit skip, not acceptance of Phase 3 UI coverage. CI installed dependencies and Chromium successfully; the earlier local install-timeout report does not apply to these hosted CI runs.

PR #39 remains **open and draft**. No merge, production deployment, Supabase schema/auth mutation, or credential/device testing occurred. Phase 2 remains blocked by the production leaked-password-protection owner action; SECURITY DEFINER function role-negative tests/owner risk acceptance; confirmation of 23 internal no-policy tables; notification claim migration/function QA deployment and concurrency/delivery tests; FCM entry-point wiring; and real OTP/GPS/payment/push checks requiring owner credentials and supported device(s).
