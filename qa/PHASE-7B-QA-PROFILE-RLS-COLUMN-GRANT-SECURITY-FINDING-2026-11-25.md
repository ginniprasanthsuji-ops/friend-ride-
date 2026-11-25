# Phase 7B — QA Profile RLS / Column Grant Security Checkpoint
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety

## Scope
Read-only SQL inspection in QA Supabase project only (pqsangtvietawkfgpgfu). Production project was not queried or touched. Also reviewed QA browser spec role guard assertions.

## Important QA finding — profile self-update privileges are too broad (potential role/approval escalation)
Observed QA `profiles` policies:
- `qa_profiles_select_own`: SELECT where id = auth.uid().
- `qa_profiles_update_own`: UPDATE where id = auth.uid(), with-check id = auth.uid(). The policy does not constrain which columns a user may update.
- `qa_profiles_insert_own`: insert own profile with role limited to customer/driver/partner.

Observed column UPDATE privileges granted to authenticated include sensitive fields, specifically:
- `role`
- `driver_approval_status`
- `partner_approval_status`
- plus other identity/KYC and account fields.

This combination is a **high-priority security risk in the QA project**: an authenticated user may be able to change their own role or approval fields via direct API updates, subject to the current policy/grant combination. This was identified by metadata inspection only; no exploit/update was attempted.

## Admin membership table
- `admin_users_self_select` allows authenticated users to select their own membership row only.
- No insert/update policy surfaced in the inspected policy result; this is not a full privilege/grant audit of the table.

## Support feedback RLS evidence
- Insert own feedback constrained to own user_id, status=new, show_on_homepage=false, admin_note null.
- Read own or admin.
- Update policy requires admin_users membership.
These are metadata observations, not execution tests.

## Test coverage limitation
Browser QA tests assert role routing, selected-role matching and frontend Admin guards, but do not attempt malicious direct profile updates or backend RLS enforcement. No authenticated runtime/API test was executed.

## Recommended remediation (NOT applied)
1. Remove authenticated UPDATE privileges for sensitive profile columns (role, driver/partner approval status, admin indicators, KYC/verification fields, account identity fields as appropriate).
2. Restrict self-service profile update to an explicit safe-column allowlist.
3. Route role and approval changes through Admin-authorized RPCs with server-side checks and audit trail.
4. Add negative authenticated tests for self role escalation, driver/partner approval escalation, Admin membership mutation, and cross-user profile writes.
5. Confirm the exact policy/grant fix in QA first, then only consider production after explicit approval.

## Status
- Read-only QA metadata audit completed.
- No attempted exploit; no row updates.
- No code, SQL, schema, grant, configuration, or deployment changes.
- Production untouched.
- Phase 7B progress: **78%**; security audit evidence advanced, but remediation and live tests remain open.
