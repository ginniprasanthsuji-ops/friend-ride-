# Phase 7B — Playwright Structure Inspection & Minimal Test Proposal
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
Reviewed source commit: ac47fcd3766aad43525506dfa68a7378ec412eb7

## Files inspected
- `qa/friend-ride.spec.cjs`
- `playwright.config.cjs`
- `package.json`

## Harness configuration
- Playwright CommonJS tests using `test` and `expect`.
- `testDir: ./qa`; timeout 45 seconds; retry 1.
- HTML report configured; traces retained on failure.
- Base URL defaults to deployed GitHub Pages app, override via `FRIEND_RIDE_BASE_URL`.
- Package scripts include Playwright, Node unit tests, TypeScript checks, Vitest, but no dedicated auth/session fixture script was evident from these inspected files.

## Existing relevant test coverage (static test code review)
- Role launcher and role-to-dashboard routing.
- Requested role check before OTP login and role-aware registration fields.
- Diagnostics visibility restrictions.
- QA test page simulated checks and live-only distinctions.
- Support/feedback, GPS/map, bank enquiry, notification handlers.
- Registration/KYC fields, private photo storage path checks.
- Ride/customer/driver details and dashboard feature wiring.
- TASKO and laundry UI/role guard wiring.
- Many tests assert DOM, exposed handlers, and source-string wiring; they do not establish real authenticated backend session isolation.

## Phase 7B session-isolation gaps in inspected spec
No dedicated test was found for the following scenarios:
1. User A logs in, then logs out; User B logs in without page reload; A's identity/data must not remain.
2. User A request is pending when logout/session switch occurs; its result must not update User B's UI.
3. Parallel mocked A/B request outputs remain isolated.
4. Reload after User B login restores only B's session and role.
5. Logout cleanup clears role/session-specific UI and local state.
6. Invalid/expired auth session falls back to unauthenticated launcher without leaking prior profile.
7. Error/diagnostic outputs redact secrets and private tokens.
8. Cancel/timeout/retry behavior for session-bound requests.
9. Telugu/mixed-language output safety and role/session context separation.

## Safe proposed QA approach (not implemented)
- Add deterministic test-only mocks/fixtures; do not use production accounts or production backend writes.
- Use two synthetic profiles (A and B) and controllable deferred promises for pending-request tests.
- Verify UI identity/role markers, local storage cleanup, and response ownership.
- Keep runtime tests distinct from source-string/static checks.
- For backend authentication behavior, use an isolated QA project and test identities only; no production reference.
- Do not assert actual OTP/SMS delivery, push delivery, GPS, or payment from browser mocks.

## Evidence status
- This was a static review of the test structure only.
- No tests were executed in this checkpoint.
- No app source, SQL, test code, secrets, or production configuration were modified.
- Proposed tests remain pending explicit implementation approval.
