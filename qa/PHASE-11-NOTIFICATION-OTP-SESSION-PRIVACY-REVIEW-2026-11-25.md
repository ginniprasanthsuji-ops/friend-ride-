# Phase 11 — Notification Security, OTP/Session & Privacy Review (QA) — 2026-11-25

Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Read-only catalog, policy, privilege and function-source checks. No mutations or delivery tests.

## Notification RLS snapshot
- `fr_app_notifications`: SELECT/UPDATE policies user_id = auth.uid().
- `fr_ride_notifications`: SELECT/UPDATE policies user_id = auth.uid().
- `fr_notification_events`: SELECT own user_id only.
- `fr_notification_preferences`: ALL own user_id.
- `fr_notification_tokens`: ALL own user_id.
- `fr_support_feedback`: own insert/read; admin read/update policies.

Static RLS ownership predicates are present. Runtime tests not performed.

## Effective table privilege concern (high priority)
Authenticated has broad table-level privileges on these notification-related tables, including DELETE, INSERT, UPDATE, TRUNCATE, REFERENCES, TRIGGER, SELECT on:
- fr_app_notifications
- fr_notification_preferences
- fr_notification_tokens
- fr_ride_notifications
- fr_support_feedback

For `fr_notification_events`, authenticated has SELECT only; service_role has full effective table privileges.

RLS does not protect TRUNCATE. Broad DELETE/INSERT/UPDATE grants can also enable unwanted operations within a user's own rows depending on policy and application requirements. Recommend remove unnecessary table privileges, especially TRUNCATE/REFERENCES/TRIGGER and direct DELETE/INSERT where workflow should be RPC-controlled, then grant narrowly required operations. Do not apply without workflow inventory.

## Device token privacy
`fr_notification_tokens` contains token, platform, active flag, user_id, last_seen_at. Own-row policy is present, but broad table privileges remain. Push tokens should be treated as sensitive routing credentials:
- restrict access to only owner and trusted dispatch path;
- validate platform and token format;
- deactivate/revoke tokens on logout or rotation;
- avoid returning raw tokens in UI/logs;
- do not permit cross-user reassignment.

## Notification dispatch RPC
`fr_notification_claim_batch(p_claim_token uuid,p_limit integer)`:
- SECURITY DEFINER, empty search_path
- anon/authenticated EXECUTE denied; service_role EXECUTE allowed
- claim token required
- batch limit clamped to 1..50
- queued rows and stale processing rows (>10 min) eligible
- `FOR UPDATE SKIP LOCKED` observed for concurrent claims
- claim rows marked processing with token and timestamp

Static review only; dispatch behavior, retries, duplicate delivery, token validation, and FCM delivery not tested.

## New-user preferences trigger
`fr_create_notification_preferences_for_new_user()`:
- SECURITY DEFINER
- service_role EXECUTE only in privilege snapshot
- trigger source inserts default preference row on auth.users, conflict-safe
- search_path is set to public (previously tracked as hardening follow-up); references qualified.
Review whether empty search_path is feasible for consistent hardening.

## OTP/session limitations
Database catalog review cannot verify Supabase Auth dashboard configuration or actual OTP delivery/session behavior. These require dashboard settings review and staging/device testing:
- OTP expiry and resend limits
- rate limits / abuse protection
- SMS provider configuration and delivery status
- password/OTP login flow
- refresh-token/session expiry and revocation
- compromised-password protection setting
- account recovery and phone-number change verification
- MFA availability/requirements for admin accounts
- notification delivery on real devices

No actual OTP/SMS or push was sent.

## Privacy and notification content
Ensure notifications do not include sensitive data (Aadhaar/license numbers, exact pickup/drop locations, full payment identifiers). Keep titles/body minimal and use authenticated app navigation for detail retrieval. Verify `action_url` allowlist/route handling and dedupe behavior.

## Status
- Catalog/policy/privilege/function review: performed read-only
- Notification RLS: policies present
- Broad authenticated table privileges: high-priority finding
- OTP/Auth dashboard settings: not inspected
- OTP/push runtime delivery: not tested
- SQL changes: none
- Production: untouched
