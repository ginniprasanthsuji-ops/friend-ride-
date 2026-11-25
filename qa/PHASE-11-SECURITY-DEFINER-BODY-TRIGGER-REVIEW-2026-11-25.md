# Phase 11 — SECURITY DEFINER Body and Trigger Review (QA)

Date: 2026-11-25
Project: QA Supabase `pqsangtvietawkfgpgfu`
Method: Read-only catalog inspection. No SQL/schema/privilege changes.

## Functions reviewed

### `fr_create_notification_preferences_for_new_user()`
- SECURITY DEFINER; owner postgres.
- `search_path=public`.
- Body uses explicit `public.fr_notification_preferences` table reference.
- Trigger: `fr_auth_user_notification_preferences`, AFTER INSERT on `auth.users`.
- Trigger is enabled (ordinary enabled state).
- Function inserts preferences for the new user ID, conflict-safe.
- Static observation: object reference is schema-qualified. Public search_path still merits hardening review; no exploit confirmed.

### `qa_guard_profile_privileged_fields()`
- SECURITY DEFINER; owner postgres.
- `search_path=public`.
- BEFORE UPDATE trigger on `public.profiles`, enabled.
- Body uses explicit `public.admin_users` reference and checks auth.uid().
- It permits changes to role/driver_approval_status/partner_approval_status when either user is an admin membership or custom setting `app.friend_ride_role_registration` equals auth.uid() text.
- Static concern: the registration custom-GUC bypass condition needs a complete call-path review. Determine whether the client can set this value directly, whether it is transaction-scoped only by trusted server code, and whether any RPC exposes it. This is a review question, not a confirmed vulnerability.

## Findings
1. Both function bodies explicitly schema-qualify their table references, reducing search-path object-shadowing risk in the reviewed bodies.
2. Both retain `search_path=public`; recommend reviewing/hardening to empty search_path and ensuring all references remain qualified, subject to migration/source review and approval.
3. Registration custom-setting bypass is an authorization-sensitive path; trace registration RPCs and GUC lifecycle before closure.
4. Notification-preferences trigger is attached to `auth.users` AFTER INSERT and is enabled in QA.
5. No runtime negative tests were executed. No production access/change performed.

## Status
Static follow-up recorded. Phase 11 remains open for complete source-migration reconciliation, authorization-negative tests, and approved remediation.
