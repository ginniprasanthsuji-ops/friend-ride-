# Phase 11 — Admin RPC EXECUTE Grants Audit (QA, read-only)

**Project:** QA Supabase `pqsangtvietawkfgpgfu`  
**Audit mode:** Catalog/source static review only. No RPC calls that mutate state were executed. No production queries or changes were made.

## Scope
Reviewed public functions with admin-related names or source references to `public.admin_users`, excluding aggregates, and inspected effective EXECUTE privileges for `anon`, `authenticated`, and `service_role`, SECURITY DEFINER status, function configuration, and source excerpts.

## Results
| Function | SECURITY DEFINER | anon EXECUTE | authenticated EXECUTE | service_role EXECUTE | Source membership check |
|---|---:|---:|---:|---:|---|
| `admin_list_driver_applications()` | Yes | No | Yes | Yes | `admin_users` membership |
| `admin_list_driver_documents()` | Yes | No | Yes | Yes | `admin_users` membership |
| `admin_review_driver(uuid,text)` | Yes | No | Yes | Yes | `admin_users` membership |
| `admin_review_driver_document(uuid,text,text)` | Yes | No | Yes | Yes | `admin_users` membership |
| `fr_admin_assign_service_provider(uuid,uuid)` | Yes | No | Yes | Yes | `admin_users` membership |
| `fr_admin_list_partner_applications()` | Yes | No | Yes | Yes | `admin_users` membership |
| `fr_admin_review_partner(uuid,text)` | Yes | No | Yes | Yes | `admin_users` membership |

All seven inspected functions have empty search_path configuration (`SET search_path TO ''`) and fully qualified object references in the source excerpt. Each source body checks membership in `public.admin_users` against `auth.uid()` before returning sensitive application data or performing admin actions.

## Assessment
- **Positive:** no anonymous EXECUTE privilege found on these seven functions in the QA snapshot.
- **Positive:** function bodies have explicit admin-membership guards in the inspected source.
- **Positive:** SECURITY DEFINER functions use an empty search_path in the inspected catalog configuration.
- **Still unverified:** runtime denial for non-admin authenticated users, successful admin actions, and edge cases/transaction effects. Source/catalog review is not a live authorization test.
- **Related unresolved finding:** authenticated TRUNCATE privilege on `public.admin_users` from the prior ACL audit. TRUNCATE is not controlled by RLS. Do not assume membership-table protections are closed until effective grants are remediated/validated and runtime checks are completed.

## Recommended validation gate (not executed)
1. Revoke unnecessary direct table privileges from `authenticated` on `admin_users` (including TRUNCATE), subject to reviewing app dependencies and approved change window.
2. Run controlled negative tests with a non-admin JWT against each admin RPC and confirm rejection; run positive tests only using a designated QA admin.
3. Verify grants after remediation and ensure no broad default EXECUTE grants reappear.
4. Review remaining admin-related functions, including those not captured by name/source filter, and reconcile source vs deployed QA migration state.

## Status
Static catalog review recorded. **No SQL changes, RPC calls, runtime tests, or production changes were performed.** Phase 11 remains open until findings are remediated (with approval) and tests provide evidence.
