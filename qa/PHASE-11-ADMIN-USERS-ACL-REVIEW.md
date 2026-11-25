# Phase 11 — admin_users Membership Protection Review

**QA project:** pqsangtvietawkfgpgfu  
**Review:** read-only catalog inspection  
**Schema/data changes:** NONE

## Confirmed catalog facts
- `public.admin_users` has RLS enabled; FORCE RLS is not enabled.
- One policy exists: `admin_users_self_select`, SELECT for authenticated where `user_id = auth.uid()`.
- No INSERT/UPDATE/DELETE policies were returned for `admin_users`.
- Effective authenticated direct table privileges were confirmed: SELECT, INSERT, UPDATE, DELETE, TRUNCATE (also REFERENCES and TRIGGER).
- These grants are not grantable by authenticated, but the privileges themselves are present.
- `service_role` has full table privileges; expected service-role capability must be protected server-side.

## Security interpretation
- SELECT is row-filtered to the user's own membership record by RLS.
- Direct INSERT/UPDATE/DELETE may be blocked by RLS because no matching policies were found, but this needs runtime role-negative testing.
- **TRUNCATE is not governed by RLS.** The authenticated role has effective TRUNCATE privilege on `admin_users`, making this a critical least-privilege grant issue to remediate. No TRUNCATE test was executed.
- No evidence here establishes that authenticated users can self-promote through INSERT, but the broad privilege grant is unnecessary and must be removed/verified.

## Remediation proposal (NOT APPLIED)
1. Revoke direct write and truncate privileges from `authenticated` on `public.admin_users` (and ensure no inherited grant restores them).
2. Keep self-select only if admin dashboard bootstrap requires it.
3. Use a trusted server-side/admin-only mechanism for membership changes; do not add client-facing write policies.
4. Verify table ACL, RLS policy list, and effective privileges after remediation.
5. Run negative tests with synthetic authenticated non-admin, admin, and anonymous sessions.

Draft SQL for owner review:
```sql
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.admin_users FROM authenticated;
```
This is a proposed remediation only. It was **not executed**.

## Acceptance tests
- Non-admin cannot insert self or another UUID into admin_users.
- Non-admin cannot update/delete memberships.
- Authenticated role has no TRUNCATE privilege.
- Admin membership remains readable only under approved policy.
- Service-role/admin membership maintenance is controlled and audited.
- All admin RPCs deny non-admin sessions.

**Status: HIGH-PRIORITY REMEDIATION REQUIRED; no schema change made in this review.**
