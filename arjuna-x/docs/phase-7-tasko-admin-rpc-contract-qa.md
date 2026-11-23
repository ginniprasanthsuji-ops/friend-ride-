# Phase 7 — TASKO Admin RPC Contract & QA Plan (R1)

Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Status: design checkpoint only; no SQL executed or migration applied.

## Existing security pattern reviewed
The existing `fr_tasko_admin_verify_payment` migration uses a SECURITY DEFINER function, fixed search_path, authenticated-user check, and `admin_users.user_id=auth.uid()` verification. The frontend currently has direct writes for TASKO assignment, application review, and booking status changes; browser role checks are not a server authorization boundary.

## Proposed RPC contracts (names are proposed; verify absence before implementation)

### 1. `fr_tasko_admin_assign_provider(p_booking_id uuid, p_provider_id uuid, p_quote numeric)`
- Require authenticated Admin via the same verified admin_users identity pattern.
- Lock target booking row (`FOR UPDATE`); require `service_type='tasko'`.
- Require assignment eligibility and a provider application for the TASKO category with status approved and provider identity matching.
- Require quote in ₹150–₹400.
- Set provider, quote, status, updated_at atomically; reject invalid lifecycle/status.
- Return updated booking row.

### 2. `fr_tasko_admin_review_application(p_application_id uuid, p_status text)`
- Require verified Admin.
- Allow only explicitly supported review states (confirm actual enum/workflow before final contract).
- Lock target application; require TASKO category.
- Set status, reviewed_by=auth.uid(), reviewed_at, updated_at atomically.
- Do not permit client-supplied reviewer ID or timestamps.

### 3. `fr_tasko_admin_transition_booking(p_booking_id uuid, p_status text)`
- Require verified Admin.
- Allow only explicitly approved admin transitions; do not merely accept any status from a list.
- Lock booking; require TASKO service type and validate current-to-next state.
- Keep provider/customer transitions (accept/start/complete) under provider RPC, and payment verification under existing payment RPC.
- Return updated row.

## Authorization/lifecycle test matrix

| Test | Expected |
|---|---|
| Anonymous RPC call | Reject |
| Authenticated non-admin | Reject; zero rows changed |
| Admin assign non-TASKO booking | Reject |
| Admin assign unapproved/wrong provider | Reject |
| Admin quote below 150 / above 400 | Reject |
| Admin valid assignment | One eligible row updated |
| Review application outside TASKO category | Reject |
| Review invalid status | Reject |
| Client attempts reviewer ID/timestamps | Not accepted as parameters |
| Admin invalid booking lifecycle transition | Reject |
| Admin valid transition | Only expected row updated |
| Payment verification through existing RPC | Existing boundary retained |
| Concurrent assignment/status attempts | Row locking; only valid serialized transition succeeds |

## Client migration prerequisites
- Confirm the RPC functions are absent/present in the target branch and deployed database; repository search alone does not prove deployment state.
- Keep UI role checks as UX only.
- Change frontend calls only after migration contract is implemented and validated in QA.
- Add tests for RPC invocation payloads and rejection paths using mocked Supabase responses; then authenticated runtime tests in staging.
- Do not narrow table grants until the full direct-write inventory and all affected flows are reconciled.

## Safety boundary
No database access, migration, grant/policy changes, production edits, or main-branch changes were made in this checkpoint. This document is design and test planning only; it is not evidence of runtime security.
