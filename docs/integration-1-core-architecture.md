# Integration 1 — Core Architecture & Audit

**Project:** PROJECT INTEGRATION  
**Sub-project:** Integration 1 — Core Architecture & Integration Framework  
**Repository:** FRIEND RIDE  
**Branch:** `integration/1-core-architecture`  
**Status:** Audit complete; foundation design documented. No production app code changed in this sub-project.

## Goals

- Keep Supabase as the primary backend while staying on the Free plan where practical.
- Add third-party services only behind replaceable provider boundaries.
- Avoid hard-coding provider-specific behavior throughout the app.
- Make provider switching/removal configuration-driven wherever feasible.
- Preserve current features and keep production/main untouched until tests and review pass.
- Prepare future Supabase-upgrade migration SQL and rollback notes.

## Current repository audit (initial)

### Existing stack observed
- Single-page web/PWA application with a large `index.html` containing inline CSS and JavaScript.
- Supabase JS v2 loaded from CDN.
- Supabase URL and publishable/anon key are declared in the frontend. A publishable key is expected to be public; privileged service-role keys must never be put in frontend code.
- Supabase Auth session persistence uses localStorage.
- Existing app uses Supabase RPCs, database queries, storage signed URLs, and realtime-related workflows.
- Leaflet and OpenStreetMap tile layer are loaded for maps.
- PWA manifest exists.
- Service worker `sw.js` supports install/activate, push display, and notification click navigation.
- Current service worker is a notification handler; background push sending still needs a trusted server/Edge Function and subscription registration/management.
- README documents that app-open realtime updates exist and that closed-app/background push is not fully activated by frontend files alone.

### Risks / observations
1. Main frontend is monolithic; changing provider integrations directly inside it increases regression risk.
2. Provider secrets must remain server-side; only public client configuration belongs in browser code.
3. Push notification display and push message delivery are separate: the service worker can display pushes, but a trusted sender and subscription lifecycle are needed.
4. Supabase Free limits and inactivity pause/backup limitations must be monitored; this project will not promise zero-risk production availability on a Free plan.
5. External providers (FCM, maps, payment, email, CDN/cache) cannot all be replaced by SQL alone. SQL can replace database/backend logic, but push delivery, maps, payment rails, email delivery, CDN and analytics remain external capabilities unless the product is redesigned.
6. Provider integrations should not own business-critical records. Supabase should remain the system of record for users, rides, orders, partners, approvals, payments/transactions metadata, and EMI ledger data.
7. Future removal/migration should be supported with adapter interfaces, feature flags, schema migrations, and documented data export/rollback steps.

## Proposed modular architecture

```
FRIEND RIDE UI
  |
  +-- App / Business Logic
  |
  +-- Integration Registry (configuration + feature flags)
       |
       +-- Notification Adapter (browser / FCM / future provider)
       +-- Cache Adapter (none / CDN / Redis)
       +-- Maps Adapter (Leaflet / tile provider / routing provider)
       +-- Email Adapter (provider)
       +-- Storage Adapter (Supabase Storage / future compatible storage)
       +-- Payment Adapter (Cashfree; never store secret keys in client)
       +-- Analytics / Error Adapter (opt-in, minimal data)
  |
  +-- Supabase Core (system of record)
       +-- Auth
       +-- PostgreSQL
       +-- RLS
       +-- RPC / Edge Functions
       +-- Realtime (only where required)
       +-- Storage metadata and secure access
```

## Provider removal / future upgrade strategy

1. Keep provider-specific calls inside adapter files/functions, not scattered across UI handlers.
2. Use configuration/feature flags to switch providers or disable optional integrations.
3. Store durable business data in Supabase/PostgreSQL, not only in third-party caches.
4. For provider migration, export required data, apply versioned SQL migrations, verify row counts/integrity, switch flags, run regression, and retain rollback configuration.
5. Future paid Supabase upgrade can consolidate eligible backend logic into PostgreSQL/RPC/Edge Functions. External services that provide push, maps, payment, email, CDN, or analytics remain external unless a replacement is selected.
6. All SQL migrations must be versioned, idempotent where practical, and accompanied by rollback notes and verification queries.

## Integration 1 scope

- [x] Initial repository audit
- [x] Identify current providers and boundaries
- [x] Identify security and migration risks
- [x] Create isolated working branch
- [x] Document architecture and future removal plan
- [ ] Add provider adapter/config scaffold
- [ ] Wire scaffold to the application (only after isolated tests)
- [ ] Regression tests and review
- [ ] Merge/deploy (not authorized/attempted in this phase)

## Acceptance criteria

- Main branch remains unchanged.
- Existing app behavior is not changed by this documentation-only foundation.
- Provider-specific code can be isolated in later sub-projects.
- No secrets are committed.
- Each integration phase has its own branch, tests, rollback notes, and completion report.

## Phase decision

**Integration 1 is currently at Audit + Architecture Design.** The next implementation step is a non-breaking adapter/config scaffold in this branch, followed by static checks and regression review before any production deployment.
