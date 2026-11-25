# FRIEND RIDE Phase 7B — Release Evidence Matrix

Updated: 2026-11-25
Branch: `arjuna-x/phase-7-ai-intelligence-safety`

## Evidence rules
- `AUTHORED`: test or checklist exists in source; not executed.
- `UNVERIFIED`: execution or real environment evidence is missing.
- `PASS`: use only after the run is completed and evidence is retained.
- `BLOCKED`: a release gate remains unmet.
- Synthetic QA must use fixture identities only; never add production credentials, OTP, personal phone numbers, or live user data to fixtures.

## Current evidence

| Gate | Status | Evidence / next action |
|---|---|---|
| Synthetic session model | AUTHORED / UNVERIFIED | `tests/session-switch-model.test.cjs`; execute in CI |
| Synthetic SessionFlowHarness | AUTHORED / UNVERIFIED | `tests/session-flow-harness.test.cjs` (12 cases); execute in CI |
| Source security/isolation contracts | AUTHORED / UNVERIFIED | `qa/phase-11-security-isolation-contract.test.mjs`; run and capture output |
| Local browser regression | UNVERIFIED | Run Playwright against localhost-only base URL; retain report |
| Actual app A→logout→B runtime | BLOCKED / UNVERIFIED | Add SDK-mocked app-level test; do not use live accounts |
| Async profile/admin response race in app | BLOCKED / UNVERIFIED | Test identity switch while profile/admin requests are pending |
| Notification ownership and realtime cleanup | UNVERIFIED | Mock app query/realtime lifecycle; verify stale account events rejected |
| Supabase RLS and RPC authorization | UNVERIFIED | Inspect policies/RPC grants and run SQL test fixtures in isolated project |
| KYC/profile photo storage access | UNVERIFIED | Confirm buckets, object path ownership, and role-specific policies |
| OTP and push on real devices | UNVERIFIED | Staging device evidence required; no browser-only pass claims |
| GPS/live tracking | UNVERIFIED | Device and permission-flow testing required |
| Order workflows | UNVERIFIED | Partner catalogue → customer view → cart → order → fulfillment workflow |
| Payment, settlement, subscription | UNVERIFIED | Test provider sandbox and webhook/ledger reconciliation evidence |
| Play Store release package | BLOCKED | Build/signing, Play Console, privacy/Data Safety, account deletion, device matrix pending |

## CI evidence capture checklist
1. Run the source-contract command.
2. Run `npm run test:unit`.
3. Run `npm install` and Playwright browser install in CI.
4. Run `npm test` with `FRIEND_RIDE_BASE_URL=http://127.0.0.1:4173/`.
5. Capture workflow run URL, commit SHA, timestamp, job status, test summary and failure artifacts.
6. Never convert authored test counts into pass counts without execution output.

## Release decision
**BLOCKED — no runtime, backend, device, or Play Store evidence is recorded here.**
This matrix is a tracking artifact, not a test report or release approval.


## CI reporting update (2026-11-25)
- GitHub Actions now writes a QA evidence summary with commit SHA, branch, run URL, and links the reader to preceding test-step outcomes and artifacts.
- This reporting step is authored but has not been execution-verified here.


## Runtime bridge authored (2026-11-25)
- Added `qa/phase-7b-session-runtime-bridge.spec.cjs` to run two synthetic session-race scenarios within the local Playwright suite while also booting the local app page.
- Playwright discovery config includes this new bridge spec.
- Scope: local app boot and dashboard route mapping are checked, while stale-session and notification races run against the synthetic harness. It does **not** test the app's real auth SDK/session handlers. Execution is not verified in this conversation.

- Bridge strengthened to assert the local app's four role-to-dashboard mappings (customer/driver/partner/admin). Commit `ed0373b9`.


## Session listener lifecycle coverage update (2026-11-25)
- Synthetic harness now clears listener registrations on identity switch.
- Added cases for listener cleanup on A→B and pending notification invalidation on logout.
- Session-flow harness test count is now 14 authored scenarios. Execution remains unverified.

## Contract alignment update (2026-11-25)
- Updated the Playwright discovery contract for the newly added Phase 7B bridge spec.
- Added a contract test asserting bridge fixture isolation, dashboard role mapping checks, stale profile/notification scenario presence, and exactly two bridge tests.
- No workflow execution result is available from the queried commit; test status remains AUTHORED / UNVERIFIED.
