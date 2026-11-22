# Project Arjuna — QA Status (2026-11-22)

## Scope guard
- Continue on the Project Arjuna QA branch only.
- Do not roll out Dark+Gold UI changes.
- Do not merge to Main or deploy live until every release gate has evidence-backed PASS and the user approves the merge/deploy step.

## Latest QA commit
- Commit: `2c574a659cd2fe757136c1a8d111711674b4cc3e`
- Branch: `project-arjuna/dark-gold-ui-rollout`
- PR: #37
- Automated CI: Quality Gate PASS, FRIEND RIDE Regression PASS, workflow/source regression PASS, TASKO/Laundry regression PASS.
- Browser regression: **52/52 PASS** on the latest commit.
- Typecheck, core typecheck, runtime build, unit/core tests: PASS.
- Evidence: Quality Gate https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45012555281
- Evidence: Regression https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45012550688
- Evidence: Workflow regression https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45012555262
- Evidence: TASKO/Laundry regression https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45012555261
- Playwright artifact: https://github.com/ginniprasanthsu-ops/friend-ride-/actions/runs/45012550688/artifacts/14749529553

## Fix made in this continuation
- Removed fictitious sample restaurant listings from the Food page.
- Replaced with an honest empty state: approved restaurants will appear after partner onboarding and admin approval.
- Added a Playwright regression check that verifies no sample restaurants are displayed.
- Re-run results: **52/52 PASS**.

## QA database environment mismatch — BLOCKER
Read-only inspection of the configured QA Supabase project `pqsangtvietawkfgpgfu` found:
- Only 5 public tables: `admin_users`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`, `rides`.
- `public.profiles` is missing.
- Only 1 public function exists.
- The QA database therefore is not a full mirror of Main/production; browser/static tests cannot certify live backend workflows against it.
- Do not attempt a broad production-schema copy or apply unreviewed migrations as a quick fix.

## Production security audit — blockers, no production changes made
- Security Advisor: 23 RLS-enabled tables without policies (review individually; service-only tables may be intentional).
- 6 SECURITY DEFINER functions executable by anon.
- 88 SECURITY DEFINER functions executable by authenticated; authorization guards must be reviewed per function.
- Leaked-password protection disabled (manual Supabase Auth setting).
- Performance Advisor: 86 RLS initplan warnings, 34 multiple-permissive-policy warnings, 68 unindexed foreign keys, 52 unused-index notices, 2 duplicate-index warnings.
- These are audit findings only; no production grants, policies, functions, indexes, or settings were changed.

## Remaining release gates
- Restore/build a dedicated QA Supabase schema that mirrors the required application tables/functions, then run authenticated integration tests.
- Live SMS/OTP send/verify on real phones.
- Two-device ride lifecycle, GPS and background tracking validation.
- Live/background push delivery verification.
- Cashfree checkout, webhook, refunds/settlement, invoice checks.
- Food ordering trusted server flow, approved partner/menu data and end-to-end order/payment.
- Provider/technician registration, private KYC upload and admin review with real accounts.
- CRM, user management, referrals, rewards and approval backend validation.
- Production SECURITY DEFINER/RLS review and leaked-password protection setting.
- Privacy/account-deletion process and legal review.
- Signed Android AAB, Play Console internal test, policy/data-safety/store listing verification.

## Release status
**NOT RELEASE READY.** Automated CI is green, but QA database mismatch and live-service/security/legal/device gates remain. Main and live deployment remain untouched.
