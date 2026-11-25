# Phase 12 — Effective Privilege Confirmation & Remediation Gate

**QA project:** pqsangtvietawkfgpgfu  
**Branch:** phase-12-implementation-plan  
**Inspection:** catalog ACL + has_table_privilege; read-only only.

## Confirmed effective privileges
The ACL snapshot explicitly lists `authenticated=arwdDxtm` on these tables (PostgreSQL ACL letters: SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER):
- `profiles`
- `rides`
- `driver_locations`
- `fr_service_bookings`
- `fr_service_requests`
- `fr_support_feedback`
- `admin_users`

`fr_notification_events` ACL snapshot: authenticated SELECT only; service_role and postgres have broader rights.

Effective `has_table_privilege` checks also reported authenticated true for all listed privilege types on the first seven tables above, and false for write privileges on notification events. The ACL output confirms these are direct table grants, not merely inferred from policies.

## Risk statement
RLS can restrict row-level SELECT/INSERT/UPDATE/DELETE access where applicable. However, table-level `TRUNCATE` is not controlled by RLS. Authenticated role's TRUNCATE privilege is therefore a serious privilege-minimization issue for these tables. Also, broad DELETE/UPDATE/INSERT grants mean the database relies on RLS and trigger safeguards to constrain those operations.

No destructive operation was attempted. This audit did not validate whether the Supabase API exposes every operation under runtime JWTs, but the database catalog/effective privilege evidence confirms the grants exist.

## Remediation proposal — NOT EXECUTED
Prepare reviewed SQL migration to:
1. Revoke `TRUNCATE`, `REFERENCES`, and `TRIGGER` from authenticated on the affected tables unless explicitly needed.
2. Revoke table-wide `DELETE` where product workflow does not require it; keep deletion only through narrowly scoped approved RPCs if needed.
3. Replace broad grants with explicit minimum required SELECT/INSERT/UPDATE grants, and column-level grants where possible.
4. Preserve RLS policies and necessary RPC workflows; don't break customer/driver/provider/admin functions.
5. For `admin_users`, remove authenticated direct INSERT/UPDATE/DELETE/TRUNCATE and use trusted admin management path.
6. Re-run ACL checks, policy review, and role-separated regression tests after migration.

## Required approval and QA
- This report is on the Phase 12 branch only.
- **No SQL migration or privilege change executed.**
- Runtime tests NOT RUN; no PASS claims.
- Before changes: confirm target is QA project, review complete migration SQL, and approve explicit apply.
