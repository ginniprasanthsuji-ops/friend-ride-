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
