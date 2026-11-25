# FRIEND RIDE Phase 13 — Continuation evidence (2026-11-26 04:18 IST)

## Frozen handover
- Planning / Checklist: **88%** (unchanged)
- Overall Audit estimate: **12%** (unchanged)
- Progress graph: **frozen**
- Production / Main: **untouched**

## Access verified
- GitHub QA branch `arjuna-x/phase-13-feature-audit`: read/write source access.
- Dedicated Supabase `FRIEND RIDE QA` project `pqsangtvietawkfgpgfu`: `ACTIVE_HEALTHY`.
- Current public tables: 39; **all 39 owned by postgres**.

## Security work applied to QA only
A read-only privilege inventory found client TRUNCATE/MAINTAIN grants:
- Before fix: TRUNCATE granted on 54 role-table privilege entries across 37 public tables (anon: 17, authenticated: 37).
- Applied migration `phase13_revoke_client_truncate_maintain_existing_qa`: revoked TRUNCATE and MAINTAIN on all current public tables from anon/authenticated.
- Applied migration `phase13_revoke_future_client_truncate_maintain_postgres_qa`: revoked TRUNCATE and MAINTAIN from postgres-owned public-table default privileges.
- Re-run inventory: **0 current client TRUNCATE grants; 0 current client MAINTAIN grants; 0 postgres default client TRUNCATE/MAINTAIN grants**.
- Created a temporary `phase13_qa_acl_probe` table, verified it inherited zero anon/authenticated TRUNCATE/MAINTAIN grants, and dropped it.
- All current public tables are postgres-owned; no data rows were deleted or changed by the privilege revocation.

## Remaining default-ACL limitation
- Supabase-managed `supabase_admin` default privileges still include TRUNCATE and MAINTAIN for anon/authenticated (**4 privilege entries**).
- Attempt to change that owner-role default ACL failed with permission denied. No change was made to that ACL.
- The current 39 public tables are postgres-owned, so this unresolved ACL affects only future tables created under `supabase_admin`, not the current inventory.

## Security/RLS/Admin findings after fix
- RLS enabled: 39/39; FORCE RLS: 0.
- Admin users: 0; two admin-review RPC guards and one profile privileged-field trigger found. Admin runtime tests remain blocked without a QA admin account.
- Shared Ride: approved-driver create guard missing; customer-role booking guard missing; confirm/contact/cancel RPCs missing; 4 direct-write policies remain; 20 client DML privilege entries remain (RLS policy behavior not runtime-tested).
- Shared Ride hardening SQL remains a draft and is not applied.

## Module inventory (read-only QA audit)
- Core Ride lifecycle RPCs present: 7.
- Payment/QR RPCs missing: 6.
- Catalogue/cart/order tables: none; required RPCs missing: 11.
- Home-service tables: 5; Tasko payment RPCs missing: 2.
- Referral tables: 5; referral RPCs present: 7.
- Flash Sale tables: 2; reservation/cancel RPCs present: 2.
- ERS/RRS road-ride tables: 4; RPCs present: 8.
- Maximum applied QA migration version returned by audit: `20261125225012`.

## Tests/checks executed
- Updated read-only audit SQL executed against dedicated QA database; returned 0 current client TRUNCATE/MAINTAIN grants and 0 postgres default grants, with 4 supabase_admin default entries unresolved.
- Static checks against fetched QA-branch source/artifacts: **12/12 passed**.
- `node --check` on the added static regression test: **passed**.
- Node `--test` suite and Playwright/browser tests: **not executed** (no local checkout/dependencies or QA website URL).
- Latest GitHub commit status and workflow-runs queries returned empty lists.

## QA branch artifacts/commits
- Audit SQL updated: `d2592a165cbaabccc7970327b9ba32fb6ce8b6fa`.
- Shared Ride hardening draft updated: `70878d84fb897eaaa024acdab00fefc9749fd20d`.
- Applied QA SQL evidence file: `9a047e265ed7338273927157e61ac30d83146394`.
- Static test file added: `ffd9294cf74fbabd08e152c83030310ffa905048`.
- Test regex correction commits: `c1fef9733f787d891b79e00ed9bf8cf70bfc1ee2`, `93ef5c854c75563fb03256325c9033a14eff95cd`, and `101bcb0932d996777a6aa8e2dba374e868ada37c`.
- Branch head verified: `101bcb0932d996777a6aa8e2dba374e868ada37c`.

## Release
**BLOCKED** — full runtime regression, admin-role runtime checks, payment/QR backend, catalogue/order backend, Shared Ride authorization integration, and supabase_admin default ACL review remain unresolved. QA-only security revocation applied; production/main untouched.
