# Phase 7B — Session Switch Isolation Test Plan
Date: 2026-11-25
Track: AI Runtime Safety / Auth Session Isolation
Scope: QA plan only. No app code, SQL, test accounts, live sessions, or production touched.

## Test setup (QA only)
- Use two dedicated QA accounts with no real customer data: User A and User B.
- Use mocked/stubbed request context in browser tests; do not invoke live AI/runtime actions or payment/SMS.
- Keep each test isolated and clear browser storage between test cases.
- Do not copy User A's private data into User B test fixtures.

## Deterministic test cases
| ID | Sequence | Expected |
|---|---|---|
| 7B-SW-01 | Start anonymous → protected request | Rejected; no private data |
| 7B-SW-02 | Login A → load A fixture | A fixture only |
| 7B-SW-03 | Logout A → verify state | Session/context/history references cleared |
| 7B-SW-04 | Login B after A logout | B fixture only; no A context |
| 7B-SW-05 | Switch A→B without reload | Auth/session and UI context re-bound to B |
| 7B-SW-06 | B request after switch | Request payload/context contains B identity only |
| 7B-SW-07 | A pending request during logout/switch | Stale response discarded; never rendered in B view |
| 7B-SW-08 | Parallel A and B mocked requests | Outputs rendered only to matching originating session |
| 7B-SW-09 | Refresh as B | Restore B only; never restore A data |
| 7B-SW-10 | Logout B then anonymous state | No prior-user content visible |
| 7B-SW-11 | Invalid role / role change | Denied or revalidated server-side |
| 7B-SW-12 | Storage cleanup | No private context in local/session storage after logout, except explicitly approved auth persistence |

## Evidence checklist
- Test fixture assertions with explicit account identifiers.
- Assertions that visible data matches current authenticated user.
- Network request mock inspection for user/session-bound payloads.
- A stale-response test with delayed A response after B login.
- Screenshot or test report showing cleared UI after logout.
- No PASS claim until test is executed and report captured.

## Safety boundary
This plan is not permission to modify production code or Supabase. Implementation of new automated tests must use an approved QA branch and deterministic mocks, after confirming available test harness and existing patterns. Real session/account tests must be staged and authorized separately.

## Next step
Inspect existing test harness helpers for safe mocked auth/session state. If the current suite lacks suitable helpers, propose the smallest isolated QA-only test addition for approval before editing.
