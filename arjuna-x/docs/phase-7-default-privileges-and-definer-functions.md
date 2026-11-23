# Phase 7 — Default Privileges & SECURITY DEFINER Review (QA catalog-only)

## Findings
- Public-schema default privileges owned by postgres include broad table privileges for anon, authenticated, and service_role: SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER.
- Public-schema default function privileges owned by postgres include EXECUTE for anon, authenticated, and service_role.
- Public-schema default sequence privileges include usage/select/update for anon, authenticated, service_role.
- Catalog shows numerous SECURITY DEFINER workflow/admin functions with EXECUTE granted to authenticated. This is not automatically a vulnerability: body-level authorization must be checked function-by-function.
- Admin list/review and assignment RPCs being executable by authenticated require verified internal admin checks and role-boundary tests.
- Notification preference trigger function and notification claim batch are not executable by authenticated in catalog; positive restriction.
- SECURITY DEFINER function config commonly uses empty search_path (safer against search-path injection if all references are schema-qualified); one trigger function uses search_path=public, so review object qualification and writable-schema assumptions.

## Recommendations — proposal only
1. Reconcile default privileges for public schema. New tables/functions should not inherit blanket anon/authenticated grants. Use explicit grants per object and role, after app compatibility review.
2. Review ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public proposal only after confirming migrations create objects as postgres and the exact intended default access.
3. SECURITY DEFINER RPCs: maintain explicit auth.uid() checks, admin membership checks, state/ownership validation, input validation, and schema-qualified object references. Document each function's expected caller and authorization.
4. Create a function authorization matrix (RPC | caller role | checks | data touched | test).
5. For admin RPCs, negative tests: non-admin authenticated caller receives denial; admin allowed; anonymous denied. Never run destructive negative tests on production.
6. Keep all changes on QA branch; no SQL applied, no main merge, no deploy.

## Caveat
Catalog-level EXECUTE/default ACL checks are static evidence. Function body review and controlled fake-account runtime tests are still required.