# Phase 7 Checkpoint — Notifications

- Read-only review of notification SECURITY DEFINER RPC privileges and bodies, notification table RLS policies, and active cron enqueue job.
- Service-role-only queue claim RPC: token required, batch capped at 50, SKIP LOCKED, stale processing reclaim.
- New-user preference trigger function service-role-only execute.
- User-owned notification events/preferences/device tokens/push subscriptions policy predicates catalog-reviewed.
- Ride notification own-row UPDATE policy identified; column-grant review needed because UPDATE may be overly broad.
- Hourly enqueue cron active and idempotent; quiet-hours calculations use UTC, timezone semantics need confirmation.
- Push delivery is not proven by enqueue or cron success.

Progress estimate: 88% (engineering estimate, not runtime verification).

Still pending: final remaining RPC/ACL inventory, finalize least-privilege proposal, runtime fake-account authorization tests, RLS/API/storage regressions, release gate. No SQL or data changes; no production changes; no merge/deploy.