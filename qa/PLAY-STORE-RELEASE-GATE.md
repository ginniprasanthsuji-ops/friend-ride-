

## 21. QA notification claim deployment and transactional verification (2026-11-23)

QA-only additive migration `202611230001_fr_notification_claim_batch.sql` was applied; the QA `fr-notification-dispatch` Edge Function is now **version 8** (JWT verification setting remains false; the dispatch-secret header check remains). Read-only checks verified claim columns/status/index, service-role EXECUTE, and no anon/authenticated EXECUTE. The claim RPC returned 0 with an empty queue.

A temporary QA transaction tested first claim=1, second claim=0, stale lease reclaim=1, old token finalization=0, current token finalization=1, then rolled back. Post-rollback checks show no test user/event/preferences, no processing rows, no queue events, no active tokens, and no Auth users. This is sequential transactional validation, not concurrent locking or real FCM delivery. Edge Function invocation/auth responses could not be tested with the available connector. No production DB/function change.

Fresh Security Advisor remains: production 23 no-policy RLS tables (0 client CRUD grants), 6 anon + 88 authenticated SECURITY DEFINER warnings, leaked-password protection disabled; QA 1 anon + 25 authenticated SECURITY DEFINER warnings. Phase 2 remains blocked by Auth owner action, full role-negative review/risk acceptance, owner confirmation of intended public/internal data, and OTP/GPS/payment/push device/credential tests. Release remains **BLOCKED**.
