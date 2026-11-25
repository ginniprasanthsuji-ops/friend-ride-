# Phase 13C — Admin Membership Table ACL/RLS Review

Date: 2026-11-26
QA Supabase project: `pqsangtvietawkfgpgfu`
Catalog-only review.

## Table shape
`public.admin_users` contains:
- `user_id` UUID
- `created_at` timestamp with time zone

RLS is enabled; FORCE ROW LEVEL SECURITY is false.

## Policy observed
Only policy returned:
- `admin_users_self_select`: SELECT where `user_id = auth.uid()`

## Grants observed
Authenticated role has table-level grants for SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER and TRUNCATE.
Service_role and postgres also have grants.

## Risk / review finding
The broad authenticated table grants are wider than the only observed RLS policy (self SELECT). RLS normally blocks write operations when no matching policy exists, but broad table grants increase the importance of confirming there are no additional policies, bypass routes, SECURITY DEFINER functions, or privileged app/API paths that allow membership mutation. This is a high-priority negative test: authenticated non-admin users must not insert themselves into admin_users, update another membership, delete memberships, or truncate the table.

## Required runtime negative tests
1. Non-admin authenticated user INSERT membership for self — must deny.
2. Non-admin INSERT membership for another UID — must deny.
3. UPDATE membership (self/other) — must deny.
4. DELETE membership — must deny.
5. TRUNCATE attempt — must deny at privilege/policy layer.
6. Ordinary user SELECT — only self membership row; no other admin identities.
7. Admin identity creation/removal through approved admin-only process; verify server-side authorization and audit log.
8. Test SECURITY DEFINER/function routes for admin membership changes.

No runtime tests executed; no data was queried from admin_users itself, only schema, grants, policies and RLS flags. No writes, migrations, deployment, or production/main access.
