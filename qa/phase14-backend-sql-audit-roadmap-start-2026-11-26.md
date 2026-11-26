# FRIEND RIDE — Phase 14 Start: Backend SQL Audit & Implementation Roadmap

**Date:** 2026-11-26  
**QA branch:** `qa/phase8-13-data-integrity-2026-11-24`  
**Phase 13 handover:** Static review/report consolidation complete; frozen progress baseline 80.5% retained.  
**Phase 14:** Started — backend SQL evidence audit and migration planning.

## Objective
Map the existing frontend feature call-sites to the deployed/checked-in Supabase SQL evidence before writing additive migrations. Avoid duplicate objects and preserve existing app functionality.

## Initial evidence
- Existing release-gate report inventories a historical backend snapshot: 71 public tables with RLS reported enabled, 58 migrations, and 7 active Edge Functions. This inventory is dated and must be revalidated before being treated as current.
- The release gate explicitly marks many feature workflows PARTIAL/BLOCKED/LIVE TEST REQUIRED; inventory alone does not certify RPC authorization, data writes, or outcomes.
- Static source reports from Phase 13 identified key RPC call-sites where SQL definitions were not found during targeted source searches. Search failure does not prove that deployed SQL is absent.
- Phase 13 reports reviewed include driver KYC, ride participant contact RPCs, ride acceptance/admin review/nearby-driver call-sites, parcel OTP, partner market-order status, catalogue, provider/TASKO, financial enquiries, complaints, SMS test UI, CRM, notifications and realtime.

## Phase 14 priority order (proposed)
### P0 — Security / authorization foundation
1. Reconfirm current schema, migration history, table RLS, policies, grants, and storage bucket policies using read-only inventory SQL.
2. Validate authenticated role identity/role authorization server-side for Admin and partner/driver/customer RPCs.
3. Verify participant/owner scoping for rides, orders, documents, enquiries, and photos.

### P1 — Critical atomic workflows
4. Ride acceptance: single-winner/atomic assignment, eligible driver, ride state, race protection.
5. Admin driver/partner approval: server-side Admin check, valid transitions, audit records.
6. Partner order: ownership, allowed transitions, quote/counter-quote, stock and duplicate action protection.
7. Parcel: acceptance and delivery OTP attempt/expiry/one-time verification.

### P2 — Persisted business workflows
8. Service provider/TASKO booking and assigned-provider state transitions.
9. Catalogue/photo ownership and customer visibility; inventory/stock integrity.
10. Payment records, confirmation, subscription/ledger/referral eligibility and rewards (only where existing feature scope supports them; never invent balances).

### P3 — Operations and release
11. Notifications/realtime/push authorization and read-state persistence.
12. CRM follow-up persistence (current source review describes placeholder/draft behavior).
13. Complaints/feedback Admin workflow, financial enquiry permissions, read-only regression checks, release-gate evidence.

## Deliverables plan
- Read-only SQL inventory first.
- Function/table/RLS mapping matrix from frontend RPC names to SQL definitions and deployed evidence.
- Gap register: verified existing, missing in source, unknown deployed, security concern, and runtime test required.
- Additive migration scripts only after the target schema is confirmed; migrations reviewed before execution.
- SQL QA scripts must remain read-only unless a separately approved staging test explicitly requires writes.

## Restrictions / evidence status
- No migration executed in this Phase 14 start.
- No production data or schema changed.
- No deployment.
- No live staging workflow test performed in this pass.
- No claim of Play Store readiness.

## Phase status
**Phase 14 STARTED.** First task: current SQL/backend inventory and RPC mapping. Phase 14 progress is not yet assigned a percentage; this commit is the initial roadmap/evidence baseline, not implementation completion.

**Release remains BLOCKED pending security, runtime, device, payment, and store evidence.**
