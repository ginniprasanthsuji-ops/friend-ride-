# Phase 11 — Profile Column Privileges & Trigger Bypass Risk (QA)

Date: 2026-11-25
Project: QA Supabase `pqsangtvietawkfgpgfu`
Read-only catalog review. No changes applied.

## Confirmed catalog findings

### Table-level effective privileges
Role `authenticated` has effective SELECT, INSERT, UPDATE, DELETE, and TRUNCATE on `public.profiles`.

### Column-level privileges
Catalog shows authenticated has INSERT, UPDATE, SELECT, and REFERENCES privileges across profile columns, including sensitive fields:
- `role`
- `driver_approval_status`
- `partner_approval_status`
- `driver_aadhaar_number`
- `driver_license_number`
- `driving_license_number`
- document/photo paths
- business and payout-related fields

### RLS
Own-profile UPDATE policy constrains row identity to `id=auth.uid()` for USING and WITH CHECK. It does not by itself restrict which columns the authenticated role may update.

## Combined high-priority risk
Previously reviewed trigger `qa_guard_profile_privileged_fields` permits changes to role and approval fields when `app.friend_ride_role_registration` equals the current UID, or when the UID is an admin. Registration SECURITY DEFINER RPC sets this GUC transaction-locally before its intended update.

Because authenticated has broad UPDATE privileges on the profiles table and sensitive columns, the remaining critical runtime question is whether a client can set the same application-defined GUC in its own authenticated transaction/session and then perform direct own-row updates. If yes, this would permit bypass of the intended trigger authorization boundary. This is **high-risk and not yet runtime-confirmed**.

## Additional table-privilege concern
Authenticated has table-level TRUNCATE privilege on profiles. TRUNCATE is not row-filtered by RLS. Whether the client API exposes a viable TRUNCATE path must be checked; the privilege itself is a serious least-privilege misconfiguration.

## Recommended remediation direction (not applied)
- Revoke broad table privileges from authenticated; grant only required table and column privileges.
- Keep role/approval fields writable only through trusted admin/registration RPCs.
- Replace custom-GUC bypass with a stronger trusted mechanism (e.g. private server-only guard or separate protected role path); do not assume a client-set custom GUC is trusted.
- Remove TRUNCATE/REFERENCES/TRIGGER privileges from client roles.
- Re-test using a fresh QA user with direct SQL/API attempts and record evidence.
- Apply changes only after approval and migration/source review.

## Status
Static privileges are confirmed from catalog. Direct exploit test not performed. No QA or production changes.
