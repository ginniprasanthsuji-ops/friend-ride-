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
