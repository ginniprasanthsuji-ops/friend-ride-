# Phase 12 QA — admin_users Table Access Review
Date: 2026-11-25
Project: QA Supabase pqsangtvietawkfgpgfu only. Production untouched.
Scope: Read-only table metadata, privileges, and RLS policies.

## Table
- Columns: user_id UUID NOT NULL, created_at timestamptz NOT NULL.
- Owner: postgres.
- RLS enabled: true.
- FORCE RLS: false.
- No non-internal triggers observed.

## Policy
Only observed policy:
- admin_users_self_select
- Role authenticated
- SELECT only
- Condition user_id = auth.uid()

No INSERT, UPDATE, or DELETE policies observed.

## Table grants
Authenticated role has table privileges including SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER. RLS is enabled and there are no authenticated write policies. Thus the metadata indicates authenticated write operations are blocked by RLS, despite broad table grants; this was not runtime tested.

Service_role and postgres have table privileges (expected privileged roles; service credentials must remain server-side).

## Admin self-escalation status
No authenticated write policy or trigger was observed that permits self-inserting/updating/deleting admin membership. This is a metadata-based conclusion, not runtime proof. Admin membership management path and service-role exposure still require review.

## Pending
1. Runtime negative tests for authenticated INSERT/UPDATE/DELETE/TRUNCATE.
2. Review admin membership bootstrap/manage process and server-side credentials.
3. Check table owner/privileged bypass boundary and service_role exposure.
4. Do not change production or make schema changes without explicit approval.
