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
