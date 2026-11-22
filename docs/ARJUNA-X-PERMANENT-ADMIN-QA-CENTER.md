# ARJUNA X — Permanent Admin QA/Test Center Requirement

**Status:** Locked requirement, added after Phase 1 scope confirmation  
**Project:** ARJUNA X / FRIEND RIDE  
**Branch:** `arjuna-x/phase-1-scope-lock`

## User requirement
Regression testing, Playwright testing, and End-to-End (E2E) testing must be permanent and accessible from the Admin Dashboard. This is a lasting product/admin capability, not a temporary developer-only page, and must not be removed after release.

## Admin QA/Test Center
Dedicated Admin-only area with:
- Regression test suite entry/status
- Playwright browser test suite entry/status
- E2E workflow suite entry/status
- Safe suite selection and run controls, where implemented
- Latest run and run history
- Timestamp, duration, environment, branch/build indicator
- PASS / FAIL / BLOCKED status
- Failure summary and test names
- Logs and CI artifact links where available
- Clear warning if results are stale or tests have not been run

## Access and safety
- Only authorized Admin roles can access the dashboard and test controls.
- Do not expose the QA area to customers, drivers, delivery partners, merchants, or service providers.
- Prefer isolated QA/test environments and CI runners.
- No destructive test data operations or real-money payment actions against production.
- Any production checks must be explicitly controlled, read-only, and clearly labeled.
- Do not claim a test passed unless execution evidence is recorded.

## Phase integration
- **Phase 2:** Inventory existing test scripts, Playwright configuration, CI workflows, test credentials/secrets handling, and current admin dashboard structure.
- **Phase 3:** Include navigation/layout entry for the permanent Admin QA/Test Center in the app shell/design system planning.
- **Phase 8:** Implement role-protected Admin entry, permissions, and dashboard integration.
- **Phase 10:** Wire safe test execution/results/history and verify regression + Playwright + E2E coverage, then release-gate it.

## Acceptance criteria
- [ ] Admin dashboard contains permanent QA/Test Center.
- [ ] Regression, Playwright, and E2E suites are separately identifiable.
- [ ] Admin can view status, last-run time, duration, environment/build and failures.
- [ ] History/logs/artifact links are available when supported by CI.
- [ ] Access is role-protected.
- [ ] Test execution is safe and does not target production destructively.
- [ ] UI clearly distinguishes verified execution from not-run/stale/blocked.
- [ ] Feature remains in the released Admin dashboard.
