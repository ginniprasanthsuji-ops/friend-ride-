# Phase 7 — Admin Membership Security Checkpoint

## Read-only QA catalog findings

- `public.admin_users` has one RLS policy: `admin_users_self_select`, SELECT only, with predicate `user_id = auth.uid()`.
- Despite that SELECT-only policy, catalog privilege metadata shows `authenticated` has DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE table privileges on `admin_users`.
- RLS policy metadata is not proof of runtime behavior for every command, and TRUNCATE does not use row-level policies. Treat the authenticated TRUNCATE grant on this table as a potentially critical risk.
- Admin membership mutation should never be client-direct. Prefer tightly scoped admin-validated RPC or server-side service role, and ensure authenticated has no direct INSERT/UPDATE/DELETE/TRUNCATE on `admin_users`.
- Admin list/review functions inspected so far use SECURITY DEFINER and explicit `admin_users` membership checks. This is positive, but not a substitute for role-based runtime tests.
- The profile guard function is SECURITY DEFINER, search_path public, and bypasses privileged-field protection when the dynamic GUC `app.friend_ride_role_registration` equals the caller UUID. That dynamic GUC can potentially be user-settable; exploitability remains unconfirmed. No bypass test was executed.

## Required QA test matrix (fake accounts only)

| Actor | Expected behavior |
|---|---|
| Anonymous | No admin membership or privileged profile access; privileged RPCs denied |
| Customer | Can read own admin membership row only if present; cannot insert/update/delete/truncate admin_users |
| Pending driver | Cannot approve self, change role/approval status, or access admin RPCs |
| Approved driver | Can use permitted driver workflow; cannot mutate admin membership or other profiles |
| Partner | Cannot change approval/role; cannot access admin RPCs |
| Admin | Admin RPCs allowed; membership changes only through reviewed server/admin path |

## Safe next steps
1. Review table-by-table grants and RLS together; do not assume RLS compensates for TRUNCATE grants.
2. Prepare explicit revoke proposal for authenticated on admin_users (direct DML and TRUNCATE), plus trigger/reference privileges across public tables.
3. Use a disposable QA database and fake users to test expected denials before applying any migration.
4. Review profile guard custom-GUC bypass via controlled test only after explicit approval.

**No SQL mutation, data change, exploit test, production action, merge, or deployment was performed.**
