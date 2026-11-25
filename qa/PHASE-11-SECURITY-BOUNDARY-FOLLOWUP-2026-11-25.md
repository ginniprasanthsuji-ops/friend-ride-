# Phase 11 — Security Boundary Follow-up (Catalog Snapshot)

Date: 2026-11-25
Target: QA Supabase project `pqsangtvietawkfgpgfu`
Scope: Read-only catalog review. No SQL, schema, privilege, or production changes applied.

## 1. SECURITY DEFINER inventory: owner and search_path

Catalog query found 27 public SECURITY DEFINER functions. All observed owners are `postgres`.

- 25 functions have `search_path=""` (empty/locked search path).
- Two functions have `search_path=public`:
  - `fr_create_notification_preferences_for_new_user`
  - `qa_guard_profile_privileged_fields`

Both are currently granted only to `postgres` and `service_role` in the observed QA catalog snapshot. These functions are still flagged for review because the explicit public search path is weaker than the empty search path pattern. Inspect fully-qualified object references and trigger invocation context before proposing remediation.

## 2. Role membership snapshot

Observed role membership includes:
- `authenticator` inherits `anon`, `authenticated`, and `service_role` (no admin option).
- `postgres` has admin-option membership in several roles, including `anon`, `authenticated`, `authenticator`, `service_role`, and platform monitoring/read roles; it is a privileged database owner/admin context.
- Platform roles `supabase_etl_admin`, `supabase_read_only_user`, `supabase_realtime_admin`, and `supabase_storage_admin` have memberships consistent with platform-managed functions/operations in this snapshot.

This is a QA database catalog snapshot only. Role membership semantics and platform-managed roles must not be changed based on this audit document.

## 3. Security status / decisions

- The 25 empty-search-path SECURITY DEFINER functions are a positive static configuration observation; function body authorization remains separately reviewed.
- The two public-search-path functions remain a static review finding, not proof of exploitability.
- Runtime role-negative tests and end-to-end authorization checks remain pending.
- Migration/source-tree reconciliation is still incomplete; no source drift conclusion is made.
- No remediation or privilege changes were applied.
- Production was not queried or modified during this follow-up.

## 4. Next steps

1. Inspect both functions' bodies and every referenced relation/function for qualification and trigger execution context.
2. Reconcile the complete source migration tree against QA migration ledger.
3. Run authorized negative tests in QA only after test identities and safe fixtures are established.
4. Obtain explicit approval before any proposed SQL remediation.
