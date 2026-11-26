# Phase 13D — Live Location Grants and Notification RPC Audit
Date: 2026-11-26
QA project: pqsangtvietawkfgpgfu

## Read-only checks

### Table grants
Authenticated role has SELECT/INSERT/UPDATE/DELETE grants on ride_live_locations, driver_locations, fr_notification_tokens, and fr_notification_preferences. Effective permissions remain constrained by RLS.
Authenticated has SELECT on fr_notification_events only.
No anon grants surfaced for the inspected tables.

### Live locations
Policies confirmed:
- insert: user_id must be caller and ride must contain caller as customer or assigned driver.
- select: only ride participants.
- update USING: owner and participant on current row.
- update WITH CHECK: only user_id = auth.uid(), lacking participant condition on target ride.
- no DELETE policy was returned, so granted DELETE is blocked by RLS unless another policy is added.

Recommendation: harden UPDATE WITH CHECK to require user_id = auth.uid() AND target ride participant (customer or assigned driver). Static review only; no DB change.

### Driver locations
Authenticated ALL policy restricts driver_id to auth.uid(). WITH CHECK permits online only when profile role=driver and approval_status=approved; offline permitted. Table grants exist but RLS restricts effective rows.

### Notification RPC
- fr_notification_claim_batch(p_claim_token uuid,p_limit integer): SECURITY DEFINER, empty search_path, claims queued or stale-processing rows with FOR UPDATE SKIP LOCKED, bounded limit 1..50, marks processing and token/claimed_at.
- EXECUTE grants listed only postgres and service_role; authenticated/anon not granted.
- fr_create_notification_preferences_for_new_user(): SECURITY DEFINER empty search_path; inserts defaults idempotently on conflict do nothing. EXECUTE only postgres/service_role in current routine grant list; trigger use is not affected by user-facing RPC access.

### Status
Static catalog and grant audit only. No runtime tests or changes applied. Production untouched.
