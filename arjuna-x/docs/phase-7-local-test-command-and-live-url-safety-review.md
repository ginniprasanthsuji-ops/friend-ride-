# Phase 7 — Local Test Command & Live-URL Safety Review

**Review only:** test commands were not run. No CI, deployment, database, storage, provider or production action was performed.

## Root scripts inspected
`package.json` defines:
- `npm test` → `playwright test`
- `npm run test:unit` → Node test runner over `tests/*.test.cjs`
- `npm run typecheck` → TypeScript check for ride-contact module
- `npm run build:runtime` → TypeScript writes `assets/ride-contact.js`
- `npm run test:core` → Vitest
- `npm run typecheck:core` → project TypeScript config

Playwright config `playwright.config.cjs` uses:
- test directory: `./qa`
- retries: 1
- baseURL fallback: **GitHub Pages production URL** when `FRIEND_RIDE_BASE_URL` is unset
- trace retention on failure.

## Safety issue found
Running bare `npm test` without setting `FRIEND_RIDE_BASE_URL` may navigate to the GitHub Pages hosted app rather than a local server. This could be considered live/production browser testing and is not safe for an unreviewed test run.

## Proposed safe local command sequence (NOT EXECUTED)
1. Start local static server on localhost:4173 (using reviewed, pinned tool version).
2. Confirm server responds locally and that the tested URL is exactly localhost.
3. Set `FRIEND_RIDE_BASE_URL=http://127.0.0.1:4173/` for the Playwright process.
4. Run only selected Tier-A specs initially; inspect network requests and test logs.
5. If test source or app source triggers external Supabase/provider requests, stop and mock/disable before expanding.

A separate guard should fail the test command when the base URL is not explicitly localhost for the Tier-A suite; it should not silently default to GitHub Pages. Any code/workflow change implementing this guard requires a reviewed QA-branch patch.

## Safe command candidates (after local environment is established)
- `node scripts/check-inline-js.mjs` — static inline-script syntax and source markers; inspected script reads local `index.html`.
- `npm run test:unit` — inspect individual tests for side effects first.
- `npm run typecheck` — check-only.
- `npm run typecheck:core` — check-only.
- `npm run test:core` — inspect test files first; verify mocks/no network.
- `npm test` — only with explicit localhost baseURL, local server, and inspected specs.

**Not currently safe to run blindly:** `npm run build:runtime`, because it writes a generated source asset; only run when file-diff review/rollback is planned. Also no root `npm install` until dependency scripts/lockfile and network behavior are reviewed.

## Workflow design proposal
A minimal QA branch workflow should:
- Trigger on push to the exact QA branch and optionally manual dispatch.
- Use read-only `contents: read` permissions.
- Run static syntax/source checks and local deterministic tests first.
- Set explicit localhost base URL for Playwright.
- Never inject production or provider secrets.
- Avoid deployment, migrations, cleanup/delete steps.
- Upload only sanitized reports; inspect artifacts for personal data and secrets.
- Use concurrency cancellation for duplicate QA runs if appropriate.
- Keep staging/provider/device tests in separate manual workflows requiring explicit environment protection.

No workflow trigger was changed or dispatched in this review.

## Status
- Live URL default identified: **potentially unsafe for blind test execution**.
- Safe local command plan: documented.
- Guard implementation: pending reviewed QA patch.
- CI run: none.
