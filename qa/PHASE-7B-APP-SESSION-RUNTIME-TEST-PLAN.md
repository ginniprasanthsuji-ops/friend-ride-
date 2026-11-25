# Phase 7B — Actual App Session Runtime Test Plan

Updated: 2026-11-25
Branch: `arjuna-x/phase-7-ai-intelligence-safety`

## Purpose
Close the gap between mock session harness coverage and app-level session/auth behavior. This plan must use a local-only app build with a mocked auth/profile/admin/notification SDK. No production endpoint, real account, real phone number, token, or OTP is permitted.

## Test fixture design
- Fixture identities: `fixture-user-a`, `fixture-user-b`
- Mock roles: customer, partner, driver, admin
- Mock driver approval: pending and approved
- Mock admin membership: false/true
- Mock API calls: deferred promises, controllable failure, fixture-scoped response rows
- Network guard: block every origin except localhost during tests; assert no external request attempts.
- Test isolation: separate browser contexts and clean mock state per test.

## Required runtime scenarios
1. A sign-in/profile request begins; switch to B; A's late profile must not set role/dashboard.
2. A notification request begins; switch to B; A's late rows must not render or overwrite B's rows.
3. A admin-membership request begins; switch to B; stale admin result must not elevate B.
4. Logout while profile, admin, notifications, and realtime events are pending; all stale completions are ignored.
5. Invalid restore path must show anonymous/customer-safe entry and clear private data.
6. Unknown role and admin-without-membership must fail closed.
7. Driver pending approval must not reach driver dashboard; approved fixture must be accepted.
8. Account switch must clear old realtime subscriptions and prevent old callbacks.
9. Loader error must reset/retain safe state and show a non-sensitive user-facing fallback.
10. Parallel contexts with A and B must not share private notifications, role, profile, or dashboard state.

## Assertions for every applicable case
- Visible dashboard/role matches active fixture identity.
- Private rows are owned by active fixture identity.
- No stale response changes UI after identity generation changes.
- Logout leaves no active identity/role/private rows/subscriptions.
- Browser request log contains only localhost URLs.
- Error output contains no credentials or personal information.

## Exit criteria
- Runtime tests are actually executed and pass in CI.
- Failure artifacts include trace/screenshots only for synthetic fixtures.
- CI summary records run URL, commit SHA, execution timestamp, counts, and status.
- Backend policy and device testing remain separate gates; passing browser tests alone does not approve release.

## Current status
PLAN ONLY — no actual-app runtime implementation or execution evidence is recorded in this document.
