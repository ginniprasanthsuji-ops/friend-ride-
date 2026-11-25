# Phase 7B — Actual App Session-Flow Test Design

Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
Scope: Read-only source review + test design. No application behavior changed.

## Actual source paths reviewed
- `index.html` `acceptSession(user)`: profile query, fallback profile query, then admin membership lookup; role mismatch and approval gates are applied later in the function.
- `index.html` session restore `frStableSessionRestore`: `getSession()`, profile role query, admin membership query, selected-role persistence, then `acceptSession(user)`; retries occur on errors.
- `index.html` stability layer auth listener: SIGNED_IN sets `currentUser` and starts after-login flow; SIGNED_OUT stops realtime.
- `index.html` `logout()`: local sign-out, clears currentUser/currentProfile, selected role, online flag and UI navigation.
- `index.html` `frRideLoadNotifications()`: concurrent user-filtered notification queries; shared notification state/rendering follows awaited queries.

## Static risk candidates — not runtime proven
- Session restore and `acceptSession` use asynchronous profile/admin checks; reviewed excerpts do not establish generation/identity checks after each await.
- Notification loader performs asynchronous queries and writes shared state; a captured-user/session-generation guard after query completion was not observed in reviewed function.
- Auth-state SIGNED_IN/SIGNED_OUT handling alone does not prove that all in-flight requests are canceled or stale completions discarded.
- Current local-only browser fixture is a minimal SDK stub and does not emulate auth events, query chains, profiles/admin membership or realtime channels.

## Safe browser-test design (future implementation)
1. Keep external-origin interception and local-only preflight intact; assert the blocked-origin list remains empty after each test.
2. Use synthetic IDs only: `fixture-user-a`, `fixture-user-b`; no actual Supabase session, token, phone, OTP, or customer data.
3. Build a dedicated test seam separate from the current SDK stub. Provide controllable deferred responses for profile, admin-membership, notification query and restore requests.
4. Model auth state transitions explicitly: anonymous → A → logout → B; restore A delayed while B signs in; notification A delayed while B notifications complete.
5. Test role gates with synthetic role/membership/approval fixtures, not actual accounts.
6. Avoid real realtime, FCM, storage, GPS, payment, SMS or production endpoints. Test only mocked lifecycle/cleanup.
7. Do not add these specs to CI discovery until the fixture is reviewed for isolation, network boundary and deterministic ordering.

## Required invariants
- After identity/generation changes, old async completions must not set current user/profile/role/dashboard or private notification state.
- A response may update state only when its captured identity and generation still match the active session.
- Logout clears user-scoped state and stops/invalidates listeners; subsequent late results/events are ignored.
- User A and B private state never coexist in a single context.
- Role mismatch, non-admin admin route, and unapproved driver route fail closed.
- External-origin attempts are treated as test failures even though fixture blocks them.

## Prioritized scenario list
- APP-RACE-01: delayed A profile query → logout → resolve A; remain anonymous.
- APP-RACE-02: delayed A notification query → switch to B → B completes → resolve A; B view unchanged.
- APP-RACE-03: delayed restore A → sign in B → resolve A restore; B remains active.
- APP-RACE-04: delayed A admin membership → switch identity; stale result cannot route/authorize.
- APP-RACE-05: role mismatch fixture → fail closed.
- APP-RACE-06: unapproved driver fixture → reject driver dashboard.
- APP-RACE-07: logout invalidates realtime/listener fixture; late event ignored.
- APP-RACE-08: two isolated contexts A/B remain independent.
- APP-RACE-09: invalid restore falls back anonymous.
- APP-RACE-10: no external request attempts.

## Evidence gate
This file is a test-design checkpoint only. No actual app session runtime test, browser test, CI run, live Supabase/Firebase request, SQL, production change, or device test was performed. The synthetic model tests from the previous checkpoint are not proof of the actual app auth/session implementation.

## Status
- Actual source review of the listed functions: completed for static design.
- Browser fixture/spec implementation: pending review.
- Runtime app session isolation: unverified.
- Play Store readiness: BLOCKED.
