# Phase 7 — Least Privilege Draft & Security Regression Matrix

**QA project:** pqsangtvietawkfgpgfu  
**Status:** Draft/proposal only. No SQL executed.

## Design rule
Do not apply a blanket grant/revoke to the 12 reviewed tables until every client callsite and external module is verified. The frontend direct-write inventory may omit dynamic table names or module writes. Preserve current app behavior by staging changes in a QA-only migration, run regression tests, then seek approval.

## Proposed SQL skeleton (DO NOT EXECUTE)
```sql
-- Phase 7 draft: privilege tightening. This is intentionally not an executable
-- complete migration until each table's approved column list and RPC replacements
-- have been signed off.
-- First inspect current privileges and dependencies; backup/rollback plan required.
-- Example target only:
-- REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE public.<table>
--   FROM authenticated;
-- Then for tables with verified direct-write requirements:
--   REVOKE INSERT, UPDATE, DELETE ON TABLE public.<table> FROM authenticated;
--   GRANT INSERT (<verified columns>) ON TABLE public.<table> TO authenticated;
--   GRANT UPDATE (<verified columns>) ON TABLE public.<table> TO authenticated;
--   (Use RPCs for protected transitions, admin-only fields, and cross-row checks.)
-- Avoid broad DELETE grants unless a reviewed client workflow demonstrably needs it.
-- Review PUBLIC/anon, inherited roles, default privileges, sequences, SECURITY DEFINER,
-- and storage policies separately.
```

## Table-level recommendations (pending client callsite & schema complete validation)
- profiles: self-profile read; narrow insert/update columns; role/approval/admin and KYC status/path fields through RPC or storage-authorized flow.
- fr_driver_documents: user pending insert only with owner/path validation; admin review fields RPC/admin path. Avoid direct UPDATE unless limited to immutable owner/type/path fields.
- rides: customer creation only; state/assignment/fare transitions RPC-controlled.
- driver_locations: driver UID only; limited location/online columns; validate coordinate bounds and approved-driver status.
- ride_live_locations: participant + active lifecycle; UID ownership, coordinate range; consider RPC/short-lived tracking.
- fr_emergency_contacts: own UID; contact name/phone/priority only; phone format and priority allowlist.
- fr_ride_sos: prefer RPC requiring active ride and caller participation; bound message and coordinate validation.
- fr_push_subscriptions: endpoint ownership, UID, limited upsert/deactivation fields; never allow cross-user endpoint reassignment.
- fr_service_provider_applications: own pending insert; Admin status/review fields via dedicated RPC; application content immutable after submission or tightly constrained.
- fr_service_bookings: customer pending insert only; assignment, quote, status, actual/final amounts, payment verification fields via Admin/provider RPCs.
- fr_bank_enquiries: customer own insert; Admin status/note updates via RPC; prevent user-set status/admin note.
- fr_support_feedback: customer own insert; Admin status/publication via moderation RPC; ensure homepage display consent and content review.

## Regression matrix — tests must run with distinct accounts
| ID | Scenario | Expected |
|---|---|---|
| RLS-01 | Anonymous SELECT on private table | Denied/no sensitive rows |
| RLS-02 | User A reads User B profile/contact/KYC | Denied |
| RLS-03 | User A writes row with user_id/owner_id=User B | Denied |
| RLS-04 | User A changes role/approval/admin flags | Denied |
| RLS-05 | User A sets KYC verification status/reviewer fields | Denied |
| RLS-06 | Unapproved driver goes online | Denied |
| RLS-07 | Driver changes another driver's location | Denied |
| RLS-08 | Nonparticipant inserts SOS for ride | Denied |
| RLS-09 | Participant sends SOS for active ride | Allowed; valid coordinates |
| RLS-10 | User A changes push endpoint belonging to User B | Denied |
| RLS-11 | Customer inserts booking with assigned provider/status/payment verified | Denied |
| RLS-12 | Provider/admin status transition skips required state | Denied |
| RLS-13 | Non-admin updates application review/status fields | Denied |
| RLS-14 | Non-admin publishes feedback to homepage | Denied |
| RLS-15 | Customer sets bank enquiry admin_note/status | Denied |
| RLS-16 | Authenticated user attempts TRUNCATE | Privilege denied |
| RLS-17 | Authenticated user attempts TRIGGER/REFERENCES privilege use | Denied |
| RLS-18 | Approved legitimate client workflows | Pass with exact fields |
| RLS-19 | SECURITY DEFINER RPC unauthorized caller/UID | Denied |
| RLS-20 | Storage object path under another UID | Denied |
| RLS-21 | Rollback/restore grants and app compatibility smoke test | Successful controlled rollback |

## Approval and release gates
1. Complete static write inventory across HTML/JS modules and dynamic table operations.
2. Verify exact columns and required grants against all flows.
3. Prepare executable migration plus rollback script and diff review.
4. Run tests against QA only using test accounts; avoid production users/data.
5. Verify no privilege escalation, no regression to login/ride/booking/KYC/push flows.
6. Explicit approval before SQL execution.
7. Keep production untouched; no main merge/deployment in this phase.

## Audit limitation
Catalog checks are read-only. Runtime authorization tests were not run. Current grant catalog shows authenticated broad privileges on reviewed tables, while RLS policies restrict rows but do not protect TRUNCATE. Some policy/callsite review remains incomplete.
