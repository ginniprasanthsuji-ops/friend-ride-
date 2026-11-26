# FRIEND RIDE — Live Deployment Risk & SQL Readiness Audit (Read-only)

**Date:** 2026-11-26  
**Branch audited:** `qa/phase8-13-data-integrity-2026-11-24`  
**No SQL mutations, deployments, or production changes performed.**

## Supabase projects confirmed
- Production: `friend-ride`, ref `fglyplxcczdjtfwobtzh`, ACTIVE_HEALTHY, Postgres 17.11, region ap-northeast-2.
- Separate QA project: `FRIEND RIDE QA`, ref `pqsangtvietawkfgpgfu`, ACTIVE_HEALTHY, Postgres 17.12, region ap-south-1.

## Database inventory comparison
| | Production | QA |
|---|---:|---:|
| Public tables | 95 | 39 |
| Recorded migrations | 111 | 54 |
| Tables with RLS disabled in inventory | 0 | 0 |

**Important schema drift:** QA has substantially fewer tables/migrations than production. Do not apply QA migrations wholesale to production and do not assume QA is a faithful production clone. Both table inventories show RLS enabled; this does not prove policies are safe.

## Production security advisor (read-only)
- RLS enabled/no policy informational findings: 25 tables.
- SECURITY DEFINER RPC callable by anon warning: 5.
- SECURITY DEFINER RPC callable by authenticated warning: 99.
- Auth leaked-password protection warning: 1.

These are advisor findings and require function/policy context review; they are not automatically exploitable, but must be triaged before broad release. Production performance advisor also reports multiple-permissive-policy warnings (35), auth/RLS initplan warnings (96), unindexed FK warnings (80), unused-index informational warnings (53), and duplicate-index warnings (2).

## QA security/performance advisor
- SECURITY DEFINER RPC callable by anon warning: 1.
- SECURITY DEFINER RPC callable by authenticated warning: 47.
- Multiple-permissive-policy warnings: 9.
- RLS auth/initplan performance warnings: 48.
- Unindexed foreign-key informational findings: 32.
- Unused-index informational findings: 18.
- Duplicate-index warnings: 2.

## Critical deployment observation
The QA branch `index.html` currently hardcodes the **production Supabase URL** (`fglyplxcczdjtfwobtzh`) and its public publishable key. It does not point at the separate QA Supabase project.

Therefore, deploying the current QA branch as a live web app without changing its environment configuration would make that app talk to the production database. This is the primary immediate risk. A public publishable key is expected in browser apps; it is not a secret. The danger is the app using production backend while testing or applying unverified changes.

## Selected critical RPC source review (QA project)
- `accept_ride`: requires authenticated approved driver, blocks existing active ride, updates only requested/unassigned ride; atomic conditional update protects single assignment.
- `admin_review_driver`: checks `admin_users`, validates decision, updates driver approval; turns driver offline for non-approved decisions.
- `fr_admin_review_partner`: checks `admin_users`, validates decision, updates partner approval status.
- `fr_customer_list_nearby_drivers`: requires signed-in customer/Admin, validates coordinates and max 15 km radius, filters approved/online/fresh locations.
- `fr_admin_assign_service_provider`: Admin-only, verifies category match and approved/online provider before assignment.
- `fr_customer_referral_reward_credit`: authenticated Admin-only; locks referral row; requires approval/eligibility and ₹50 configured reward; idempotent ledger conflict handling.
These source bodies are useful evidence but do not replace separate-role runtime tests.

## Risk decision
- **Deploy current QA branch to a public/live URL as-is: HIGH RISK / NOT RECOMMENDED**, because the branch points to production Supabase.
- **Run unreviewed or bulk SQL against production: HIGH RISK / NOT RECOMMENDED**, due schema drift and advisor findings.
- **Preview app with a QA-only Supabase configuration: LOWER RISK**, provided the build is verified to use QA project URL/key, QA accounts/test data only, and no production credentials; preview should be tested before public release.
- **Production migration:** only after exact migration is reviewed, backup/rollback plan and target-schema validation, staging tests, and user approval.

## Safe next steps
1. Keep production schema unchanged.
2. Prepare an isolated QA frontend build/config that points only to `pqsangtvietawkfgpgfu` and verify its URL/key before publishing preview.
3. Reconcile QA/prod schema drift and create a migration-by-migration comparison.
4. Prioritize advisor findings, particularly RPC role checks and RLS policies.
5. Test real QA accounts/workflows; only then consider production deployment.

## Actions taken in this audit
- Read-only Supabase project discovery, table/migration inventory, security/performance advisors, policy/function inventory, and selected function body inspection.
- SQL writes: 0.
- Production migrations applied: 0.
- Deployments: 0.
- Production changes: 0.

**Recommendation:** Do not deploy the current branch live yet. First isolate the frontend to the QA project. This is achievable with a controlled preview and avoids testing against production data.
