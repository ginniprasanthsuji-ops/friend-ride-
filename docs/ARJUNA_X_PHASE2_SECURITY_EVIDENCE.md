

## Continuation — QA-only notification claim deployment and transactional runtime checks (2026-11-23)

- Applied additive migration `202611230001_fr_notification_claim_batch.sql` **to FRIEND RIDE QA only**; no production DB change.
- Deployed QA `fr-notification-dispatch` version **8** from branch source blob `01cc1bf5de6c1f10385bd055edf7df1ae9b2250b`. JWT verification remains disabled as before; the existing dispatch-secret header check is retained. No secret was read or changed.
- Read-only catalog verification: claim_token/claimed_at columns, processing CHECK, and claim index present; `service_role` EXECUTE true; `anon` and `authenticated` EXECUTE false. Empty-queue claim RPC returned 0.
- QA transaction test with a temporary synthetic Auth user and notification event: first claim **1**, second claim **0**, stale-lease reclaim **1**, old claim-token finalization **0**, current-token finalization **1**, final state skipped. The transaction was rolled back. Post-rollback verification: synthetic user/event/preferences **0 persisted**, processing rows **0**; QA queue **0 events**, active tokens **0**, Auth users **0**.
- This is sequential claim/lease/token-guard verification, **not** true concurrent transaction testing or FCM delivery. The available Supabase connector cannot invoke Edge Functions; the public endpoint was not reachable through the web-fetch tool, so dispatch HTTP/auth response was not runtime-tested. No test device/token or FCM credentials were available.
- Fresh Security Advisor (2026-11-23 05:32:57 UTC): production 23 RLS/no-policy INFO, 6 anon SECURITY DEFINER WARN, 88 authenticated SECURITY DEFINER WARN, leaked-password protection disabled; QA 1 anon and 25 authenticated SECURITY DEFINER WARN. Production tables remain 85/85 RLS enabled, 0 disabled; QA 21/21 RLS enabled, 0 no-policy. Production no-policy table client grants rechecked at 0 for anon/authenticated CRUD.

Phase 2 remains **BLOCKED / NOT ACCEPTED** pending owner Auth setting, full role-negative SECURITY DEFINER review/risk acceptance, public/internal table ownership confirmation, and real credentials/device-based OTP/GPS/payment/push tests. QA notification migration/function is now deployed and the isolated transactional checks pass; true concurrency and live push remain open. No production change, merge, or live deployment.
