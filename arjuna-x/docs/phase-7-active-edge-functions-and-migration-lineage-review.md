# Phase 7 — Active Edge Functions & Migration Lineage Review

Date: 2026-11-23. Target QA project `pqsangtvietawkfgpgfu`.

## Read-only QA inventory
- Supabase Edge Functions inventory: 6 active functions.
  - `create-zoom-meeting` — active, verify_jwt=true, version 8.
  - `confirm-zoom-session` — active, verify_jwt=true, version 5.
  - `create-external-classroom-session` — active, verify_jwt=true, version 5 (manual HTTP/HTTPS link workflow).
  - `get-zoom-classroom-link` — active, verify_jwt=true, version 6.
  - `fr-notification-register-token` — active, verify_jwt=true, version 5.
  - `fr-notification-dispatch` — active, verify_jwt=false, version 8.
- `fr-notification-dispatch` source verifies a dispatch secret via `x-dispatch-secret` before proceeding; source uses Google OAuth/Firebase Messaging endpoints and FCM private-key environment secrets. Secret values were not inspected.
- Zoom functions are active and source calls Zoom OAuth/API. This conflicts with current user-approved restriction against external Zoom/API integration. Treat as policy mismatch; do not disable/deploy without approval.
- `create-external-classroom-session` allows teacher-supplied HTTP/HTTPS links, no Zoom API. User must distinguish manual external link vs forbidden automated external integration.

## Migration history reconciliation
- Supabase project migration list returned 26 migration entries.
- Read-only `supabase_migrations.schema_migrations` count returned 26 rows, matching the MCP migration list.
- `storage.migrations` contains 81 rows, which is Storage subsystem migration history and is NOT the app/project migration count.
- This explains prior apparent count mismatch when storage migrations were compared with app migration history. Historical docs mention larger migration count; lineage/environment reconciliation remains incomplete.

## Safety/next actions
- No Edge Function source changes, deactivation, deployment or secret access.
- No SQL DDL, data mutation, Storage changes.
- Next: inspect active external integration references/feature flags, propose reversible de-scope plan for Zoom and FCM external delivery (without touching current notification UX), and identify tests before changes.
- QA only; production untouched, no merge/deploy.
