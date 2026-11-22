# Project Arjuna — QA Status (2026-11-22)

## Scope guard
- QA branch only.
- No Dark+Gold UI rollout.
- Payment provider/Cashfree testing is explicitly deferred by user and excluded from current release-gate scope; user will add a provider later.
- Do not merge Main or deploy live until remaining release gates have evidence-backed PASS and the user approves.

## Current QA HEAD
- Commit: `9d4dbeee1ef694fe43e8f0e060d331e626dfb591`
- Branch: `project-arjuna/dark-gold-ui-rollout`
- PR: #37 (open; not merged)
- Latest CI on this commit: all verified workflow runs PASS.
  - Quality Gate: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013088107
  - Quality Gate (duplicate trigger): https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013084092
  - Regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013084143
  - Workflow/source regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013088114
  - TASKO/Laundry Integration: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45013088119
- Browser Playwright: 52/52 PASS (latest previously evidenced run).
- TASKO/Laundry Playwright: 4/4 PASS (latest previously evidenced run).
- Typecheck, unit/core tests and runtime build: PASS.

## Latest fixes
- Ride pickup/drop autocomplete, selected address coordinates, GPS and map-pin coordinates are covered by Arjuna regression tests; payload includes selected coordinates.
- Food page no longer displays fictitious demo restaurants; honest empty state after partner onboarding/admin approval; regression guard added.
- Removed stale Dark+Gold UI tests from active Arjuna QA scope.

## QA database mismatch — blocker
Read-only inspection of QA Supabase project `pqsangtvietawkfgpgfu` found only 5 public tables, `profiles` missing, and only 1 public function. QA is not a full schema mirror; static/browser tests do not certify real backend workflows.
- Do not copy production schema broadly or run unreviewed migrations.

## Production security audit — findings only, no production changes
- 23 RLS-enabled tables without policies (review individually; service-only may be intentional).
- 6 SECURITY DEFINER functions executable by anon.
- 88 SECURITY DEFINER functions executable by authenticated; review guards and least privilege.
- Leaked-password protection disabled (manual Auth setting).
- Performance Advisor: 86 RLS initplan warnings, 34 multiple-permissive-policy warnings, 68 unindexed FK notices, 52 unused-index notices, 2 duplicate-index warnings.
- No production functions, grants, policies, indexes or settings changed.

## Remaining in-scope release gates (payment excluded)
1. QA schema parity and authenticated integration tests.
2. Live SMS OTP send/verify on real phones.
3. Two-device ride lifecycle, GPS and background tracking.
4. Live/background push delivery.
5. Food ordering trusted server flow with approved partner/menu data (payment provider integration excluded).
6. Driver/partner/service-provider registration, KYC storage and admin review.
7. CRM, user management, referral/reward approval workflows.
8. Production SECURITY DEFINER/RLS review and leaked-password protection setting.
9. Privacy/account-deletion process, functional verification and legal review.
10. Signed Android AAB, Play Console internal testing and policy checks.

## Progress estimate
- Project Arjuna is approximately 80% complete for current scope (payment-provider work excluded). This is an engineering progress estimate, not a release certification.
- Automated QA is green. Remaining work is primarily QA environment/backend validation, real-device/provider verification, security, legal/privacy and Android release gates.

## Release status
**NOT RELEASE READY.** Main and live deployment remain untouched. Merge/deploy only after all in-scope gates are PASS and user approval.
