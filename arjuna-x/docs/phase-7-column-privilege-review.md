# Phase 7 — Column Privilege Review (QA Read-only)

## Evidence
- Catalog shows authenticated has table-wide INSERT/UPDATE/SELECT/DELETE plus REFERENCES/TRIGGER/TRUNCATE on admin_users, profiles, and most public tables.
- Column privileges also reflect broad INSERT/UPDATE/SELECT grants across profiles, including sensitive KYC/document path and approval-related fields. Column-level grants are not currently restrictive enough to provide least privilege.
- `admin_users` has only self-row SELECT RLS policy, but broad grants are present for authenticated. Direct client mutation must be denied explicitly by privilege revokes and verified with role tests.
- All public table owners in catalog are postgres. This is consistent with Supabase managed database ownership but does not reduce client-role grant risk.

## Recommended approach (proposal; not applied)
1. Remove authenticated TRUNCATE/TRIGGER/REFERENCES grants from all public tables.
2. For admin_users, revoke authenticated INSERT/UPDATE/DELETE/TRUNCATE; keep only SELECT needed by own-row policy if app relies on membership self-read.
3. For profiles, avoid blanket INSERT/UPDATE on privileged fields. Use column allowlist grants for ordinary self-editable profile fields; sensitive role/approval/KYC fields should be RPC-only or protected by a robust server-side authorization mechanism.
4. Re-check the role-registration GUC guard: do not treat a caller-settable custom setting as authorization. Replace with trusted server-side mechanism, e.g. a narrowly scoped SECURITY DEFINER function that validates caller and updates only approved fields, or use explicit admin checks.
5. Check API/UI call sites before revoking fields. Current QA data counts are zero, so test using fake accounts in disposable QA.
6. Build grant allowlist per table/function and regression test customer, pending driver, approved driver, partner, admin, and anonymous roles.

## Release-blocking risk
Authenticated TRUNCATE grants on core tables (especially admin_users, profiles, rides, and KYC-related tables) are potential destructive privilege exposure. Runtime exploitability was not tested; no destructive command executed.
