# Project Arjuna — QA Status (2026-11-22)

## Scope
- QA branch only; no Dark+Gold UI rollout.
- Payment Provider/Cashfree integration explicitly deferred by user and excluded from this gate.
- Do not merge Main or deploy live without evidence-backed PASS and user approval.

## Latest QA commit and CI
- QA HEAD before this status refresh: `a320bb2320e64b8bd83ac8829df323ac9f59c043`.
- PR #37 open, not merged.
- Latest commit CI is confirmed **all PASS**:
  - Quality Gate: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013632475
  - Quality Gate (second trigger): https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013629981
  - Regression: https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45013629987
  - Workflow/source regression: https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45013632471
  - TASKO/Laundry integration: https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45013632476
- Previously evidenced browser Playwright: 52/52 PASS; TASKO/Laundry 4/4 PASS; typecheck, core tests/build PASS.

## Implemented QA fixes
- Ride pickup/drop autocomplete and selected address/coordinate validation; GPS/map-pin coordinate persistence covered by regression.
- Duplicate ride submit guard and success/error status.
- Food page demo restaurant listings removed; honest empty-state plus regression guard.
- Removed stale Dark+Gold UI test scope; allow OSM map tile requests in runtime diagnostics test.
- Restored production Supabase config reference on QA branch (no secrets).
- Registration privacy-policy link, corrected privacy contact and account deletion request page (manual process; not automated).

## QA database parity — BLOCKER (read-only verified)
QA Supabase project `pqsangtvietawkfgpgfu`:
- Public tables: 5 — `admin_users`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`, `rides`.
- Public functions: 1 — `fr_create_notification_preferences_for_new_user`.
- Frontend direct `.from()` inventory: 15 tables; 13 missing from QA. QA is materially behind production schema.
- Frontend RPC inventory: 57 names; QA currently exposes only 1 public function. Static browser mocks cannot certify authenticated backend workflows.
- Production metadata confirms many corresponding tables/functions exist, but production schema is **not** copied to QA. No production data was read and no production schema/security changes were made.
- Next: prepare a reviewed, dependency-ordered QA-only schema/migration plan with ownership/RLS/grants/storage policy tests. Do not wholesale copy production or apply unreviewed migrations.

## Security audit — findings only
Production read-only audit previously found 23 RLS-enabled tables without policies, 6 SECURITY DEFINER functions callable by anon, 88 SECURITY DEFINER functions callable by authenticated, leaked-password protection disabled, plus performance warnings. No production changes made.
A fresh read-only definition check confirmed several anon-executable SECURITY DEFINER RPCs appear intentionally public (approved-store listings, approved catalogue, published homepage feedback). `fr_get_platform_business_details()` also exposes legal name, toll-free number, GSTIN and timestamp; confirm fields are intended public and least-privilege ACLs before release. No grants/functions/settings changed.

## Remaining in-scope gates (payment excluded)
1. QA schema parity + authenticated integration tests (major blocker).
2. Live SMS OTP on real phones.
3. Two-device ride lifecycle, GPS/background tracking.
4. Live/background push delivery.
5. Food trusted server flow and approved partner/menu data (payment provider excluded).
6. Driver/partner/service-provider KYC upload and admin review.
7. CRM/user/referral/reward approval workflows.
8. Security review of SECURITY DEFINER/RLS; leaked-password protection.
9. Account-deletion operational process and legal/privacy review.
10. Signed Android AAB, Play Console internal testing and store-policy checks.

## Progress
- Approximate engineering progress: 80% for current scope (payment excluded). This is not release certification.
- Latest CI on commit `a320bb23`: Quality Gate, Regression, Workflow/source Regression, and TASKO/Laundry Integration all PASS.
- Backend environment parity and external/device/security/legal/store gates remain.

## Release
**NOT RELEASE READY.** Main untouched and live deployment not performed.
