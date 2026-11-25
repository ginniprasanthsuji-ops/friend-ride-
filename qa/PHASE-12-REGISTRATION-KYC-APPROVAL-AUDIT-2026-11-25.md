# Phase 12 — Registration, KYC & Approval Workflow Audit (2026-11-25)

QA branch/source search and QA release-gate docs reviewed. QA Supabase only; production untouched. No SQL changes.

## Static findings
- Driver KYC upload source exists and validates vehicle type, vehicle registration, and driving licence number; stores document paths and indicates application remains pending Admin verification.
- QA Playwright source includes a test for Customer, Driver and Partner forms showing role-specific fields when switching roles. Test execution status is not verified.
- Native home registration test source expects Customer, Driver, Partner entry points.
- TASKO/service-provider registration QA checklist describes registration via service-provider application table and private KYC storage, Admin review, assignment and restricted status RPCs.
- Release gate has an older/other-scope finding marking Service Provider and Technician registration handlers as validation-only and BLOCKED (no provider row or private upload). This conflicts with the TASKO provider checklist/source findings and must be reconciled against the exact current-head app/branch.
- Driver registration approval gating is described in BLUEPRINT: only verified/approved drivers may receive/accept eligible rides.
- Partner registration, private KYC, Admin approval, catalogue publish and customer visibility are explicitly release-gate tests, not verified live.

## Risk / discrepancy
Registration implementations and documentation appear to differ across service-provider flows. Determine current branch/commit and each role-specific handler before calling provider registration complete.

## Runtime test checklist (not executed)
1. Customer registration field isolation and save.
2. Driver required-field validation, profile photo, documents, pending status.
3. Partner registration, photo, KYC uploads, pending status.
4. Home-service provider/technician registration writes correct application record and uploads private docs.
5. Admin approve/reject/review; verify status changes and audit history.
6. Pending/rejected drivers cannot go online or accept rides.
7. Pending/rejected partners cannot publish catalogue or receive orders.
8. Approved partner catalogue becomes visible to customer.
9. Approved provider can receive only eligible assigned work.
10. Unauthorized role cannot review, approve, or view private KYC.
11. Document upload failure rolls back/cleans partial uploads and preserves retry ability.
12. Registration role switching does not leak/retain wrong role fields.

## Status
Static source/document audit: checkpoint completed.
Runtime validation: not run.
SQL changes: 0.
Production: untouched.
