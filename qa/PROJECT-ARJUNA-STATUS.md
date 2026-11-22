# Project Arjuna — QA Status (2026-11-22)

## Scope
- QA branch only; no Dark+Gold UI rollout.
- Payment Provider/Cashfree integration explicitly deferred by user and excluded from this gate.
- Do not merge Main or deploy live without evidence-backed PASS and user approval.

## Latest QA commit and CI
- QA HEAD: `11c6e405d95e448d95c645d442ad52a7201527ba` (status-document commit; this status refresh will follow).
- PR #37 open, not merged.
- CI on this commit: Quality Gate, Regression, Workflow/source Regression, TASKO/Laundry Integration all PASS.
  - Quality Gate: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013289176
  - Quality Gate (second trigger): https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013284428
  - Regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013284416
  - Workflow/source regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013289177
  - TASKO/Laundry integration: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013289152
- Previously evidenced browser Playwright: 52/52 PASS; TASKO/Laundry 4/4 PASS; typecheck, core tests/build PASS.

## Implemented QA fixes
- Ride pickup/drop autocomplete and selected address/coordinate validation; GPS/map-pin coordinate persistence covered by regression.
- Duplicate ride submit guard and success/error status.
- Food page demo restaurant listings removed; honest empty-state plus regression guard.
- Removed stale Dark+Gold UI test scope; allow OSM map tile requests in runtime diagnostics test.
- Restored production Supabase config reference on QA branch (no secrets).
- Registration privacy-policy link, corrected privacy contact and account deletion request page (manual process; not automated).

## QA database parity — BLOCKER (read-only audit)
QA Supabase project `pqsangtvietawkfgpgfu`:
- Public tables: 5 — `admin_users`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`, `rides`.
- Public functions: 1 — `fr_create_notification_preferences_for_new_user`.
- Static frontend direct `.from()` references: 15 tables; 13 are absent from QA, including `profiles`, `driver_locations`, `fr_app_notifications`, `fr_driver_documents`, `fr_emergency_contacts`, `fr_push_subscriptions`, `fr_ride_notifications`, `fr_ride_sos`, `fr_service_bookings`, `fr_service_provider_applications`, `fr_support_feedback`, `ride_live_locations` and additional referenced tables.
- Frontend invokes 57 RPC names; QA currently has only 1 public function. Static browser mocks cannot verify authenticated DB workflows.
- Do not copy production schema wholesale or apply unreviewed migrations. Create a reviewed minimal QA schema and test role boundaries before applying.

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
- Automated CI green; backend environment parity and external/device/security/legal/store gates remain.

## Release
**NOT RELEASE READY.** Main untouched and live deployment not performed.
