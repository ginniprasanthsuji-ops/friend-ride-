# Project Arjuna — QA Status (2026-11-22)

## Scope guard
- QA branch only.
- No Dark+Gold UI rollout.
- Do not merge Main or deploy live until release gates have evidence-backed PASS and the user approves.

## Current QA HEAD
- Commit: `6f769fd376e189ec42a3a7c6183433f595d9bb1e`
- Branch: `project-arjuna/dark-gold-ui-rollout`
- PR: #37
- Quality Gate and Regression: PASS.
- Browser Playwright: **52/52 PASS** on current head.
- TASKO/Laundry Playwright: **4/4 PASS**.
- Workflow/source regression: PASS.
- Unit/core/typecheck/build steps: PASS.
- Evidence:
  - Quality Gate: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45012746857
  - Regression: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45012741339
  - Workflow/source regression: https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45012746864
  - TASKO/Laundry: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45012746891

## Latest code fix
- Food page no longer displays fictitious demo restaurant listings.
- Empty-state message explains that restaurants appear after partner onboarding/admin approval.
- Added Playwright regression guard against fake restaurant data.
- Latest browser run confirms 52/52 pass.

## QA database mismatch — BLOCKER
Read-only inspection of QA Supabase project `pqsangtvietawkfgpgfu` found only 5 public tables, `profiles` missing, and only 1 public function. QA is not a full schema mirror of production; browser/static tests do not certify real backend workflows.
- Do not copy production schema broadly or run unreviewed migrations.

## Production security audit findings — no production changes made
- 23 RLS-enabled tables without policies (review each; service-only may be intentional).
- 6 SECURITY DEFINER functions executable by anon.
- 88 SECURITY DEFINER functions executable by authenticated; review guards and least privilege.
- Leaked-password protection disabled (manual Supabase Auth setting).
- Performance Advisor: 86 RLS initplan warnings, 34 multiple-permissive-policy warnings, 68 unindexed FK notices, 52 unused-index notices, 2 duplicate-index warnings.
- Audit findings only; no production functions/grants/policies/indexes/settings were changed.

## Remaining release gates
1. QA Supabase schema parity and authenticated integration tests.
2. Live SMS OTP send/verify on real phones.
3. Two-device ride lifecycle, GPS and background tracking.
4. Live/background push delivery.
5. Cashfree checkout, webhooks, refunds/settlement, invoices.
6. Food ordering trusted server flow with approved partner/menu and payment.
7. Driver/partner/service-provider registration, KYC storage, admin review.
8. CRM, user management, referral/reward approvals.
9. Production SECURITY DEFINER/RLS review; enable leaked-password protection.
10. Privacy/account deletion legal review and functional verification.
11. Signed Android AAB and Play Console internal testing/policy checks.

## Release status
**NOT RELEASE READY.** Automated QA is green. Backend schema mismatch, security, real-device/provider, legal and Android store gates remain. Main and live deployment are untouched.
