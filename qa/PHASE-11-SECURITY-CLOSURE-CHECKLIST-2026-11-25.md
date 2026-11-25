# Phase 11 — Security Closure Checklist: Admin Approval, Audit Trail, Concurrency, Data Minimization

Date: 2026-11-25
Target: QA Supabase `pqsangtvietawkfgpgfu`
Status: Read-only review; checklist only. No SQL changes, no runtime tests.

## 1. Audit history discovery
Catalog lookup for public base tables whose names include audit/review/approval/admin found only `admin_users`. This is a limited name-based check and does not prove audit logging is absent elsewhere (e.g. other naming, platform logs, triggers, external systems).

Observed in reviewed source:
- Driver document review writes `reviewed_by` and `reviewed_at` on the document record.
- Driver and partner approval functions update profile status.
- No explicit approval-history table write was visible in the reviewed function bodies.

Closure check: inspect all triggers and other audit/logging paths; if no durable history exists, design an append-only approval event table with actor UID, subject UID, old/new status, decision, timestamp, and reason; restrict writes to trusted RPC path and reads to authorized admin.

## 2. Assignment concurrency
`fr_admin_assign_service_provider(p_request_id,p_provider_id)` checks request status (requested/assigned), provider category, approval and online availability, then updates assignment. Function source does not visibly lock request/provider rows.

Risks to test in isolated QA:
- Two admins/providers assigning the same request concurrently.
- Request status changes between check and update.
- Provider status/availability changes concurrently.
- Duplicate assignment event/notification.

Closure design: use transaction-safe locking or conditional UPDATE with expected-state predicates; require exactly one affected row; add idempotency and uniqueness constraints only after schema/workflow review. Do not implement blindly.

## 3. Sensitive admin data minimization
Driver application RPC returns contact and identity/vehicle fields; document list returns document path and review metadata. Partner application list returns phone, address, GSTIN, payment identifiers/phone, QR path and approval status.

Review questions:
- Does admin UI need every field at list stage?
- Can list views mask identifiers and reveal full details only on detail/review screen?
- Are storage paths signed/private and short-lived?
- Are admin exports/downloads logged?
- Are admin accounts protected by strong authentication/MFA outside SQL?

## 4. Authorization baseline
Catalog snapshot showed reviewed approval RPCs:
- anon EXECUTE denied
- authenticated EXECUTE allowed
- service_role EXECUTE allowed
- SECURITY DEFINER
- empty search_path
- source checks `public.admin_users` membership against `auth.uid()`

This is a source-level baseline only; runtime non-admin denial and admin positive tests remain pending.

## 5. Security closure gates
- [ ] Profile role/approval direct-update privileges remediated and catalog-verified.
- [ ] Client-set GUC authorization dependency removed or made non-forgeable through trusted architecture.
- [ ] Direct TRUNCATE/DELETE privilege removed where not required.
- [ ] Admin approval history path verified/implemented.
- [ ] Assignment concurrency protections reviewed and test plan approved.
- [ ] Admin list sensitive fields minimized/masked.
- [ ] Storage private access and path ownership verified.
- [ ] Non-admin negative tests passed on disposable QA account.
- [ ] Legitimate registration and admin approval positive tests passed.
- [ ] Regression checks for customer/driver/partner/admin dashboards.
- [ ] Production impact/release plan reviewed before any production change.

## 6. Execution status
- Read-only catalog/source review: performed
- SQL changes: none
- Runtime tests: none
- Test accounts: none used
- Production: untouched
- Next action: continue static boundary review; mutation tests require explicit approval and disposable QA account.
