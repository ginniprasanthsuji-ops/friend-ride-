# Integration 1 — Core Architecture & Audit

**Project:** PROJECT INTEGRATION  
**Sub-project:** Integration 1 — Core Architecture & Integration Framework  
**Repository:** FRIEND RIDE  
**Branch:** `integration/1-core-architecture`  
**Status:** Audit and scaffold in progress. Production app code remains unchanged.

## Goals

- Keep Supabase as the primary backend while staying on the Free plan where practical.
- Add third-party services only behind replaceable provider boundaries.
- Avoid hard-coding provider-specific behavior throughout the app.
- Make provider switching/removal configuration-driven wherever feasible.
- Preserve current features and keep production/main untouched until tests and review pass.
- Prepare future Supabase-upgrade migration SQL and rollback notes.
- **Play Store safety priority:** integration work must not prevent Android release/AAB generation. Build feasibility is an early checkpoint, not a final-only check.

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
8. Release build and Play Store compatibility are mandatory gates. If an integration creates a blocker to Android project generation, signed AAB build, installation, or release compatibility, stop that integration phase and resolve/rollback the blocker before continuing.

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

## Files added on the isolated branch

- `integration-config.js`: public-safe config scaffold and provider/feature flags; currently not runtime-wired.
- `integrations/provider-contract.js`: generic provider contract helper scaffold.
- `integrations/notifications/notification-provider.js`: non-operational notification provider interface scaffold.
- `integrations/cache/cache-provider.js`: non-operational cache interface scaffold; no cache enabled.
- `docs/integration-1-core-architecture.md`: audit, architecture, migration plan, and checkpoints.

These scaffolds intentionally have no runtime side effects and do not change current app behavior.

## Integration 1 scope

- [x] Initial repository audit
- [x] Identify current providers and boundaries
- [x] Identify security and migration risks
- [x] Create isolated working branch
- [x] Document architecture and future removal plan
- [x] Add provider adapter/config scaffold
- [x] Add isolated notification and cache interface scaffolds\n- [x] Add Node unit tests for config/contracts/scaffold behavior (4 tests passed locally)
- [ ] Runtime wiring (blocked pending Android/AAB baseline feasibility checkpoint)
- [ ] Static checks and regression tests
- [x] Android project/AAB feasibility audit (no native Android project/build configuration found in repository)
- [ ] Signed release AAB build + install verification
- [ ] Merge/deploy (not authorized/attempted)

## Android/AAB feasibility checkpoint — initial audit\n\nRepository checks on the integration branch found:\n- \`package.json\` has test/typecheck scripts but no Android build script or app build script.\n- No \`android/` project, Gradle wrapper, Gradle build files, Capacitor configuration, Cordova configuration, or Android build workflow was found at the checked repository paths.\n- Current README describes a static frontend/PWA and push limitations.\n- Therefore, **an AAB cannot currently be generated directly from this repository as-is**. This is a missing Android packaging/build setup, not a demonstrated integration-caused failure.\n- Runtime integration wiring is paused until a safe Android packaging baseline (likely a Capacitor wrapper, subject to verification) is created and an AAB feasibility test is performed. No signing credentials or package IDs are assumed.\n\n## Capacitor Android packaging baseline plan\n\nThe current static frontend can potentially be wrapped with Capacitor, but this is not yet proven for this repository. The official Capacitor setup requires a package manifest, a web-assets directory (configured as \`webDir\`) with \`index.html\`, Capacitor dependencies/config, Android platform generation, and Android Studio/SDK. Current app is a static/PWA root-file structure, so first create a controlled staging web-assets directory without changing main/live, validate routing/auth/service worker behavior inside Android WebView, then generate the native Android project and attempt a debug build before any signed release AAB. Keep keystore/signing secrets out of Git.\n\nCheckpoint sequence: (1) staging copy of web assets and Capacitor config, (2) Android platform generation in isolated branch, (3) debug APK build/install smoke test, (4) signed AAB feasibility (signing credentials supplied/created securely by owner), (5) regression and release compatibility. If any step breaks existing core flows, stop and fix before further integrations.\n\n## Mandatory Play Store safety gate

Before major runtime integration changes:
1. Verify current web/PWA behavior and Android wrapper/build setup.
2. Determine and test a baseline Android project/build route to generate an AAB without integration changes.
3. Record build toolchain, package ID, signing requirements, and blockers (do not invent signing credentials).
4. Re-check AAB generation after integration changes.
5. If integration causes build or Play Store compatibility blockers, halt further integration and fix/rollback that phase.
6. Do not merge to main or deploy until signed AAB build, install/launch, and regression checks pass.

## Acceptance criteria

- Main branch remains unchanged.
- Existing app behavior is not changed by scaffolds.
- Provider-specific code can be isolated in later sub-projects.
- No secrets are committed.
- AAB/release path remains feasible and is tested early.
- Each integration phase has its own branch, tests, rollback notes, and completion report.

## Phase decision

**Integration 1 is in progress: Audit + Architecture Design + Config + Adapter Interface Scaffolds.** New scaffold files are isolated and not wired into runtime. The initial Android/AAB audit found no native Android build setup in the repository, so runtime wiring is paused while the Android packaging baseline is planned and feasibility-tested. Main/live remains unchanged.
