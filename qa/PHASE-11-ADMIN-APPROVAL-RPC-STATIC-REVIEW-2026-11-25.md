# Phase 11 — Admin Approval RPC Authorization Review (QA static catalog, 2026-11-25)

Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Read-only catalog/function-source review. No mutations/tests.

## RPC EXECUTE snapshot
All reviewed RPCs below: anon EXECUTE=false; authenticated=true; service_role=true; SECURITY DEFINER=true; search_path empty.

- `admin_list_driver_applications()`
- `admin_list_driver_documents()`
- `admin_review_driver(uuid,text)`
- `admin_review_driver_document(uuid,text,text)`
- `fr_admin_assign_service_provider(uuid,uuid)`
- `fr_admin_list_partner_applications()`
- `fr_admin_review_partner(uuid,text)`

## Authorization source
All seven functions check membership in `public.admin_users` against `auth.uid()` before their protected operation. Static source supports consistent admin-membership checks. Runtime denial testing has not been performed.

## Source-level safeguards observed
- Driver review decisions constrained to approved/rejected/revoked.
- Partner review decisions constrained to approved/rejected/revoked.
- Driver document decisions constrained to verified/rejected.
- Service-provider assignment requires request status requested/assigned and provider category match, approved status, online availability.
- Driver rejection/revocation sets driver's online location state to false.
- Document review stores reviewer UID and timestamp.
- Admin application-list RPCs return personal/identity/payment details; data access is admin-gated in source, but least-privilege field minimization remains a review item.

## Follow-up risks / review questions
1. Admin driver/partner status review functions update profile status but do not visibly write an approval audit-history row in the reviewed source; verify existing audit logging elsewhere before concluding.
2. `fr_admin_assign_service_provider` reads request state and provider state then updates request without visible row locking in the function source; concurrency/assignment-race test needed.
3. Admin list functions return sensitive driver/partner fields; review whether each field is operationally necessary and whether admin UI needs masked values.
4. Authenticated EXECUTE grant is expected only because function body gates via admin membership; runtime negative test with a non-admin account is pending.
5. Service-role EXECUTE is present; keep service-role credentials server-side only.

## Test gate
No negative/positive tests run. No test account used. No SQL changes. Production untouched.

## Next safe action
Prepare a reviewed approval-audit and assignment-concurrency test plan. Any mutation tests require explicit approval and a disposable QA account.
