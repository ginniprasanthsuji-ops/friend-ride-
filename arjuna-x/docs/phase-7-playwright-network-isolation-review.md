# Phase 7 — Playwright Test Network-Isolation Review

**Review-only checkpoint. Tests not executed. No CI dispatch, production navigation, DB/storage mutation or provider calls.**

## Files inspected
- `qa/friend-ride.spec.cjs`
- `qa/tasko-laundry-main-regression.spec.js`
- `tests/tasko-laundry-main-regression.spec.js`
- `tests/learn-teach-marketplace.spec.js`
- `playwright.config.cjs`

## Findings

### 1) Root Playwright configuration — P0 safety guard needed
`playwright.config.cjs` fallback baseURL is the hosted GitHub Pages URL if `FRIEND_RIDE_BASE_URL` is absent. Therefore bare `npm test` can target the hosted app. Guard should require explicit localhost for Tier-A tests and fail closed.

### 2) Main QA spec — external requests not globally blocked
`qa/friend-ride.spec.cjs` navigates relative URLs ('.' and './test.html'), but does not install a global route blocker. It has one test recording external requests during a specific diagnostic scenario, but that is not a suite-wide isolation barrier. Application startup could attempt external Supabase/CDN/provider calls.

**Recommendation:** suite-level route interception should abort non-local network requests by default, with exceptions only for explicitly reviewed test fixtures. Prefer mocks for provider SDK/API dependencies.

### 3) TASKO/Laundry regression spec — partial isolation
`qa/tasko-laundry-main-regression.spec.js` blocks `https://**/*` and uses a hard-coded localhost URL. This is a stronger Tier-A pattern. It still needs confirmation the localhost server is present and all HTTP destinations other than localhost are blocked; no test execution performed.

### 4) Learn & Teach smoke spec — local target but no network blocker
`tests/learn-teach-marketplace.spec.js` uses hard-coded localhost URL but has no route interception. This spec must receive the same suite-level network isolation guard before running.

### 5) Root config test directory mismatch/coverage note
Root Playwright config sets `testDir: './qa'`; thus `npm test` runs QA directory specs by default, not necessarily every `tests/*.spec.js` file. The root Node/Vitest scripts are separate. Verify intended suites explicitly to avoid a false claim of full coverage.

## Proposed implementation acceptance checks
- Fail config if baseURL is missing, non-localhost or non-loopback for Tier-A.
- Use a local server health check before launching browser tests.
- Abort external requests at test fixture/context level.
- Explicitly mock Supabase/API calls in tests that assert backend UI states.
- Add an isolated test proving external requests are blocked and local requests allowed.
- Keep staging/provider tests separate with explicit environment protection.
- Review package install lifecycle scripts and lockfile before CI.

## Status
- Network-isolation source review: completed.
- Test execution: not run.
- Guard or route blocker implemented: not yet.
- CI workflow change/dispatch: none.
