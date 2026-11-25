# Phase 7B — Session Isolation Risk Register & Acceptance Criteria
Date: 2026-11-25
Reviewed commit: ac47fcd3766aad43525506dfa68a7378ec412eb7
Branch: arjuna-x/phase-7-ai-intelligence-safety

## Scope
Static evidence reconciliation of the existing Playwright suite, harness configuration, Blueprint security requirement, and Play Store release gate. No runtime execution.

## Evidence-backed baseline
- Existing Playwright spec checks four-role launcher/router, expected-role guard source markers, role-aware registration, and diagnostics visibility.
- Playwright config runs headless with 45-second timeout, one retry, HTML report and failure trace retention; hosted GitHub Pages is default base URL.
- The release gate explicitly marks logout/session restore as LIVE TEST REQUIRED, with Android/browser refresh/app restart/role-change evidence needed.
- Blueprint requires OTP/authentication, RBAC, server/backend validation, RLS, protected documents, privacy, and secure session handling.
- No dedicated session-switch/auth fixture helper was found in inspected test files/config/package scripts.

## Risk register
| ID | Risk | Impact | Evidence required | Priority |
|---|---|---|---|---|
| S-01 | User A profile/private UI remains after logout | Cross-account privacy leak | A logout → B login UI assertion | Critical |
| S-02 | Pending A request resolves into B session | Cross-session data leak | Deferred response test; ownership assertion | Critical |
| S-03 | Role mismatch on restored session | Unauthorized dashboard/action access | Reload + role/profile assertion | High |
| S-04 | Parallel requests share mutable context | Data/output cross-contamination | Parallel A/B fixture test | High |
| S-05 | Auth expiry/invalid restore leaves stale private state | Privacy/access risk | Expired/invalid session fallback test | High |
| S-06 | Diagnostic/error messages expose tokens or private identifiers | Secret disclosure | Redaction assertions using synthetic secrets | High |
| S-07 | Logout leaves timers/subscriptions active | Post-logout data or updates | Cleanup/late-event test | High |
| S-08 | Retry/cancel attaches response to wrong session | Incorrect or leaked results | Session-tagged retry/cancel tests | Medium |
| S-09 | Language/context change bypasses session boundary | Wrong-user context leakage | Telugu/mixed-language isolation fixture | Medium |

## Acceptance criteria for future isolated test implementation
1. Tests use synthetic IDs/data only and never real customer data.
2. Auth, Supabase, SMS, push, payment, GPS and AI network calls are blocked or mocked for the isolation suite.
3. Each test is isolated in its own browser context; no shared storage state unless the test explicitly validates restoration.
4. A→logout→B sequence must prove no A-owned profile, history, pending response, private content or role remains visible to B.
5. A delayed A response must be discarded after session switch; it must not render or mutate B state.
6. Parallel A/B mocked responses must resolve only to their corresponding context.
7. Logout must clear session-bound UI state and stop/clean session-owned listeners/timers.
8. Invalid or expired session restoration must fall back to unauthenticated state.
9. Synthetic secrets inserted into errors/diagnostics must be redacted.
10. Tests must report simulation/mock evidence separately from real backend/device evidence.

## Implementation gate
Current source does not establish a test injection seam. Before adding tests, review and approve the test-only mock boundary. Do not modify production auth, frontend code, SQL, or deployed settings as part of this documentation checkpoint.

## Status
- Static risk register: complete.
- Acceptance criteria: documented.
- Runtime tests: not run.
- App/backend/production changes: none.
