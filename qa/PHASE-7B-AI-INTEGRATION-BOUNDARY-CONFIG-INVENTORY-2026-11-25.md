# Phase 7B — AI Integration Boundary & Configuration Inventory
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
QA Supabase project: pqsangtvietawkfgpgfu (production project not queried)

## Findings
- GitHub release-gate documentation describes `friend-ride-ai-assistant` as requiring the `OPENAI_API_KEY` Edge Function secret and returning HTTP 503 if absent. It records prior 503 invocations, but those log claims were not independently revalidated in this checkpoint.
- Read-only QA Supabase Edge Function inventory currently returned six ACTIVE functions: fr-notification-dispatch, confirm-zoom-session, create-external-classroom-session, create-zoom-meeting, fr-notification-register-token, and get-zoom-classroom-link.
- `friend-ride-ai-assistant` was not present in that returned QA Edge Function inventory. This is a mismatch between the repository release-gate note and the current QA project function inventory.
- No secret values were queried or exposed.

## Safety boundary recommendation
- AI should be invoked only through an authenticated server-side Edge Function (JWT verification or explicit equivalent authentication inside function).
- OPENAI_API_KEY must remain in Supabase Edge Function Secrets; never frontend, GitHub files, test fixtures, logs or chat.
- Function should enforce role/context allowlist, request size/quota, timeout, cancellation where supported, safe error response, and redact secrets/private data from logs.
- Do not add a direct browser-to-provider call or grant AI broader database/RPC permissions than the current user role requires.

## Verification / blockers
- Function existence in QA: NOT FOUND in current inventory.
- Runtime AI request test: NOT RUN.
- Session isolation, Telugu intent safety, cancellation, timeout/fallback, redaction, output isolation: NOT TESTED.
- Secret presence: NOT inspected; no secret values accessed.
- Code, SQL, configuration changes: 0.
- Production: untouched.
- Phase 7B progress remains 75%; source/config inventory does not count as implementation or runtime test completion.

## Next checkpoint
Resolve the QA/repository mismatch: confirm whether `friend-ride-ai-assistant` is intended to be deployed to QA, inspect its source through the repository/approved QA project, then prepare a test plan. Deployment or secret configuration requires explicit user approval.