# ARJUNA X Phase 2 — Final Acceptance Evidence (QA Branch)

Date: 2026-11-23
Branch: arjuna-x/phase-2-security-closure
Scope: QA-only; production/main remains untouched.

## Verified automated checks
- FRIEND RIDE workflow regression #412: PASS
- FRIEND RIDE regression #666: PASS
- FRIEND RIDE Quality Gate #870: PASS
- TASKO/Laundry integration regression #365: PASS
- Phase 2 safe-browser isolation checks passed on the reviewed commit.
- CI jobs reported successful: install, typecheck, core typecheck, runtime build, unit tests, core tests, Chromium setup, local app server, Phase 2 safe-browser suite.
- Full browser suite for UI-migration branches was skipped; this is not counted as a pass.

## Security isolation findings
- Playwright QA fixtures default to offline mode and block Supabase requests.
- Explicit QA E2E requires both QA Supabase URL and anon key, plus enable flag.
- QA URL must be HTTPS and a non-production Supabase project.
- The fixture blocks the known production Supabase hostname.
- Automated isolation checks verify test target is not production.

## Remaining release-gate verification (not proven by CI)
1. Live Auth and RLS review against the deployed QA project and role matrix.
2. Admin CRM / approval flows require real database and role testing.
3. Background push is not fully activated by frontend alone; VAPID, persisted subscriptions, and trusted server/Edge Function sender are required.
4. Full UI-migration browser regression suite is skipped in current runs.
5. manifest.json and manifest.webmanifest have differing start_url, scope, and theme/background settings; resolve/verify before release.

## Decision — corrected sequential gate
**Phase 2 is NOT accepted for advancement to Phase 3.** This file records the automated QA checks and isolation evidence only; the earlier phrase “accepted at 95% for development continuation” and deferral of unresolved Phase 2 security blockers to Phase 9/10 is withdrawn because it conflicts with the sprint's sequential gate.

Fresh evidence (2026-11-23): production admin-RPC role-negative coverage is 15/88 authenticated-executable SECURITY DEFINER functions; 73 remain untested. QA coverage is 22/25, with 3 public/approved-data visibility surfaces untested. Leaked-password protection remains disabled, 23 RLS/no-policy internal tables require owner confirmation, and real OTP/GPS/payment/push/device checks are pending. Phase 2 must close these blockers before Phase 3 starts.

No merge or live deployment.


## Fresh continuation — 2026-11-23 12:59 IST

- Production role/ownership test increment: **10/10 PASS** in a rollback-only transaction as authenticated synthetic subject. Five expected role denials: driver parcel-list, partner catalogue, partner market-order list, service-provider request list, nearby-driver list. Five caller-scope tests: customer market orders, parcel requests, service requests, and ride customer/driver details returned zero rows for synthetic subject/nonexistent ride.
- Post-test check: synthetic profile/admin membership/ride/market order/parcel/service request/provider/driver-location counts were all 0. No permanent writes.
- Production SECURITY DEFINER coverage updated from **15/88 to 25/88**; **63 remaining**. QA remains **22/25**; 3 public/approved-data surfaces await visibility acceptance.
- Latest CI on pre-update evidence head `a1aa499e96bb5b37677a03b2601df47cc983d120`: workflow/source `45125814431`, TASKO/Laundry/Admin `45125814474`, Regression `45125814548`, Quality `45125814422` all successful. Full UI migration suite skipped; Phase 3 branch has no CI runs yet.
- Fresh Advisor: production 23 no-policy RLS INFO, 6 anon + 88 authenticated SECURITY DEFINER warnings, leaked-password protection disabled; QA 1 anon + 25 authenticated warnings. Phase 2 remains **NOT ACCEPTED**. No production change, merge or deployment.


## Additional production role/ownership tests — 2026-11-23

- Second rollback-only transaction: **11/11 PASS** across 5 functions (delivery-order access flags for ride/parcel/food/shop 4/4 false; customer-delivery flags 4/4 false; partner QR permission false; Learn/Teach admin check false; customer market-payment details raised expected inactive-window error).
- Combined production SECURITY DEFINER role/ownership evidence: **30/88; 58 remaining**. No synthetic data persisted (post-check 0 in profiles, admin_users, rides, market orders, parcel orders, service requests, service providers, driver locations).
- Current evidence head `c7ddfa65665b0357928d0c9d4d7d505b7841ee7c`: workflow/source regression `45131877959` PASS; Regression `45131878071`, TASKO/Laundry/Admin `45131878062`, Quality Gate `45131878153` were still in progress at last check. Do not mark CI complete until rerun status confirms.
- Phase 2 remains blocked: leaked-password setting, owner visibility/table confirmations, remaining 58 production RPC role/ownership tests, QA push/HTTP/concurrency, real device/credential tests. No production change, merge, or deployment.


## Production RPC coverage and static triage — 2026-11-23

- `is_friend_ride_admin()` returned false for synthetic authenticated non-admin (rollback/read-only): PASS. Combined production function role/ownership coverage is **38/88; 50 remaining**.
- Static triage of the remaining 50: 41 caller/ownership markers, 1 admin-guard marker (`fr_cancel_ride`), and 8 public/approved-list functions with no simple auth marker. These markers are triage only; source review/owner visibility acceptance remains required.
- Latest CI at head `97211bdbf744b5c51f21ad5009c1846501f2b451`: workflow/source regression `45131985938` PASS; Regression `45131985922`, TASKO/Laundry/Admin `45131985913`, Quality Gate `45131986043` in progress. Full Phase 3 UI suite remains untested on its branch.
- Phase 2 is still NOT ACCEPTED; owner settings/visibility/table acceptance, 50 remaining function checks, push/HTTP/device/credential gates remain pending.


## Latest Phase 2 continuation — 2026-11-23

- Three further production tests passed in rollback-only authenticated transaction: customer parcel-delivery OTP RPC returned expected no-parcel denial (no OTP issued); free-referral check returned false; ride-payment-state returned `not_started`. Read-only preconditions showed no synthetic parcel/referral/subscription/payment rows; post-check found zero synthetic data in 11 table groups.
- Production verified role/ownership function coverage: **41/88; 47 remaining**. Remaining-function marker triage: 38 caller/ownership markers, 1 admin-guard (`fr_cancel_ride`), 8 public/approved-data surfaces requiring owner acceptance.
- Latest full CI before this documentation update, head `428934eec3d41482fb43a4162ebe3c78d3cdc4c9`: source/workflow `45132193156`, TASKO/Laundry/Admin `45132193130`, Regression `45132193047`, Quality Gate `45132193105` all completed success. Phase 2 UI migration suite skipped. Exact latest test totals not available from job metadata; previous log evidence is 47/47 safe browser, 9/9 Node, 5/5 core.
- Phase 2 still NOT ACCEPTED; owner settings/visibility/table acceptance, 47 remaining RPC tests, QA push/concurrency, and physical device/credential integration remain blockers.


## Continuation — fresh read-only checks and CI (2026-11-23 13:55 IST)
- Four new rollback-only authenticated role-scope checks passed: is_approved_driver false; my_driver_subscription none/inactive; get_ride_payment_details_v1(dummy ride) empty; get_ride_customer_details(dummy ride) empty. Post-test synthetic profile/admin/subscription/dummy ride counts were 0.
- Production verified authenticated SECURITY DEFINER role/ownership evidence now 45/88; 43 remain. This is test coverage only, not security acceptance.
- Current Phase 2 head 7243a8007c16739c298324378c2d3338885647a8: Quality Gate 9/9 Node, 5/5 core, 47/47 safe browser plus typechecks/build PASS; Regression 47/47 PASS; TASKO/Laundry/Admin 4/4 PASS; source/workflow regression 25 inline checks + learn-teach syntax PASS. Full UI migration suite skipped.
- Phase 2 NOT ACCEPTED: leaked-password setting, public/internal visibility owner confirmations, remaining 43 RPC checks/reviews, QA notification HTTP/auth/concurrency/live FCM, and real OTP/GPS/payment/push device/account checks remain open. No production mutation, merge, or deployment.


## Continuation — eight production role-denial checks (2026-11-23)
- Eight rollback-only production checks PASS: driver start/complete/parcel accept/ride-payment confirm denied for synthetic non-approved driver; parcel-payment confirm false on dummy parcel; Laundry/TASKO transition no assigned booking; service-provider update denied for synthetic non-provider. Pre/post checks: synthetic profile/admin/subscriptions and dummy ride/parcel/booking/request/payment rows all 0.
- Verified production authenticated SECURITY DEFINER role/ownership coverage now 53/88; 35 remain. This is evidence coverage, not security acceptance.
- CI for code commit 7243a8007c16739c298324378c2d3338885647a8 was verified PASS; docs-only commits after it have no push-run evidence available through the current GitHub run-list wrapper, so newest doc head CI is pending verification.
- Phase 2 NOT ACCEPTED: owner/Auth, privacy/table acceptance, remaining 35 RPC review/tests, QA push HTTP/auth/concurrency/live delivery, and real OTP/GPS/payment/device checks remain open. No production mutation, merge, or deployment.
