# Phase 7 — Admin RPC Source Review (QA read-only)

## Positive authorization checks observed
- `admin_list_driver_documents`, `admin_review_driver`, `admin_review_driver_document`, `fr_admin_assign_service_provider`, `fr_admin_list_partner_applications`, and `fr_admin_review_partner` each explicitly check membership in `public.admin_users` for `auth.uid()`.
- Driver review decision allowlist: approved/rejected/revoked.
- Document review decision allowlist: verified/rejected; review note truncated to 500 chars and records reviewer/timestamp.
- Partner review decision allowlist: approved/rejected/revoked and role is constrained to partner.
- Provider assignment requires request status requested/assigned, provider approved/online, and matching category.
- Admin RPCs use empty search_path; references observed are schema-qualified.

## Follow-up / potential race
- Provider assignment validates request state with a SELECT, then performs UPDATE by request ID without including the status predicate or locking the request row. Concurrent admin assignment could race; not proven in current QA. Recommend locking request row (`FOR UPDATE`) and retaining status/category predicates in the update, then test concurrency on disposable QA data.
- Admin list RPCs expose PII and document storage paths, appropriate only to verified admins; test non-admin denial and verify storage objects are private and signed URLs are short-lived.
- Admin review updates do not show an expected-current-status condition; confirm policy allows re-review/revoke transitions and add state predicates if required.

## Planned QA tests
- Anonymous and authenticated non-admin calls: deny for all admin RPCs.
- Admin calls: valid allowlist decision succeeds; invalid decision rejected.
- Provider assignment: wrong category, offline/unapproved provider, unavailable request rejected; race test with two admins yields one consistent assignment.
- Driver document review: only existing document ID; reviewer metadata set; note length bounded.
- Review transition matrix (pending/approved/rejected/revoked) validated against intended business rules.

## Status
Static source review only. No RPC called, no mutation performed, no concurrency test executed. No SQL changes applied.