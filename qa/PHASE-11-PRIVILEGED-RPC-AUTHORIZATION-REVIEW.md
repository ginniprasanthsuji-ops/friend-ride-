# Phase 11 — Privileged RPC Authorization Review (Continuation)

**QA project:** pqsangtvietawkfgpgfu  
**Branch:** phase-12-implementation-plan  
**Review:** source-static + read-only QA catalog  
**Changes applied:** NONE

## Findings

### F11-AUTH-01 — Admin authority source is inconsistent across reviewed source
- Several reviewed admin RPCs use `public.admin_users` membership via `auth.uid()`, e.g. `admin_list_driver_applications`, `admin_list_driver_documents`, `admin_review_driver`, `admin_review_driver_document`, `fr_admin_assign_service_provider`, `fr_admin_list_partner_applications`, `fr_admin_review_partner`, and the TASKO admin payment verification function.
- A separate migration defines `fr_learn_teach_is_admin()` as a SECURITY DEFINER helper checking `profiles.role='admin'`, and uses it in Learn & Teach RLS policies.
- This is a **source-level authority inconsistency**. The Learn & Teach migration helper is not present in the current inspected QA catalog (function query returned no rows), so deployment/runtime exposure is not confirmed.
- Risk: admin eligibility may differ between feature modules if profile role and `admin_users` membership are not synchronized and intentionally equivalent.

### F11-AUTH-02 — Current QA catalog does not contain the Learn & Teach admin helper
- Read-only QA query for `public.fr_learn_teach_is_admin` returned no rows.
- Do not infer that the migration has been applied to QA; source code and database state differ.
- Required: migration deployment status and policy/function inventory must be reconciled before live testing.

### F11-AUTH-03 — Prior production hard-coded admin mismatch remains historical only
- Prior audit reported a production `is_admin()` hard-coded identity mismatch.
- Current QA snapshot previously returned no `public.is_admin` or `public.is_friend_ride_admin` rows.
- Production has not been queried/modified in this continuation; historical issue requires safe read-only revalidation.

## Reviewed safeguards in source
- Admin RPCs reviewed above generally check `auth.uid()` membership in `public.admin_users` and reject when absent.
- SECURITY DEFINER routines inspected in QA use empty search_path for many reviewed admin RPCs, reducing object-shadowing risk.
- These static observations are not runtime proof and do not replace execute-ACL review, role-negative tests, or end-to-end admin UI authorization tests.

## Required follow-up
1. Choose one canonical admin authority: preferably membership in `admin_users`, unless an explicit synchronized role policy is approved.
2. Inventory every admin helper/policy/RPC in source migrations and current QA catalog; identify name/overload differences.
3. Verify `admin_users` table write grants and RLS; confirm only trusted admin/service process can grant membership.
4. Review all SECURITY DEFINER function EXECUTE grants and bodies, including the Learn & Teach helper.
5. Test non-admin and anonymous calls against each privileged RPC using synthetic accounts.
6. Reconcile source migrations with QA deployment state.
7. Revalidate production historical `is_admin()` finding read-only only; do not apply changes without approval.

**Result:** Static review identified an admin-authority consistency issue in source and a source-vs-QA deployment mismatch. No runtime privilege test was performed; no SQL was executed to change schema or data.
