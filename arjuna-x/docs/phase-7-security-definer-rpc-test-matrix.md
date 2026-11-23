# Phase 7 — SECURITY DEFINER RPC authorization test matrix (planned)

Catalog evidence: 28 SECURITY DEFINER public functions in QA. Most have authenticated EXECUTE; notification claim batch and preference trigger function are restricted to postgres/service_role. Homepage feedback RPC is anon/authenticated callable and is expected to enforce published-only filtering and input limits.

## Test cases (do not execute until disposable fake accounts/data approved)

| Function group | Caller | Expected authorization / checks |
|---|---|---|
| Admin driver list/review/document review | anonymous | Deny / no data disclosure |
| Admin driver list/review/document review | authenticated non-admin | Deny / no sensitive data or mutation |
| Admin driver list/review/document review | verified admin | Allow only intended admin operation; decision allowlist |
| Admin partner list/review/assign | non-admin | Deny |
| Admin partner list/review/assign | verified admin | Allow bounded action; verify ownership/state constraints |
| Ride accept/start/complete/counter-offer | customer/non-driver | Deny |
| Ride accept/start/complete/counter-offer | approved driver not assigned / wrong state | Deny |
| Ride accept/start/complete/counter-offer | eligible assigned driver | Allow valid transition only |
| Ride detail RPCs | unrelated user | Deny or return no row; no PII leakage |
| Service request create/list/provider update | wrong role/ownership | Deny or no unauthorized records |
| TASKO/Laundry transitions | provider not assigned / invalid state | Deny; state unchanged |
| Driver/partner registration | logged-out / mismatched profile | Deny; role/state unchanged |
| Nearby driver/store geo listing | customer | enforce radius, approved/online filters, location precision minimization |
| Public homepage feedback | anonymous | allow only public/published content and bounded inputs |
| Notification claim batch | authenticated | EXECUTE must remain unavailable |
| Notification preferences trigger | authenticated | EXECUTE must remain unavailable |

## Security posture notes
- Catalog shows 28 SECURITY DEFINER functions.
- Most function configs use empty search_path; verify every body schema-qualifies objects and avoids dynamic SQL hazards.
- Two functions show search_path=public: profile guard and notification preference trigger. Catalog shows authenticated EXECUTE is not granted to these two, but trigger behavior and schema qualification still need source review.
- This is a planned test matrix, not runtime test evidence. QA currently has no usable profiles/rides/service test records; no test accounts created and no RPC mutations run.
