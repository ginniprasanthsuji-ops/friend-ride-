# Phase 7 — Local Test Server / CI Safety Review (Continuation)

**Read-only workflow review; no test commands executed and no workflow dispatch.**

## Findings
1. The repository root has no `package-lock.json` at the inspected QA branch path. Root `package.json` has semver ranges for Playwright/Vitest/TypeScript; `npm install` therefore is not locked to a committed dependency tree.
2. Existing Quality Gate workflow starts a Python static server on port 4173, then sets `FRIEND_RIDE_BASE_URL=http://127.0.0.1:4173` for `npx playwright test`. This matches the new local-only config guard.
3. FRIEND RIDE Regression workflow uses http-server on port 4173 and sets base URL with trailing slash; this also matches.
4. TASKO/Laundry regression spec uses hard-coded `http://127.0.0.1:4173/index.html`. If configured local origin/port differs, the new fixture will block the request (fail-closed). Recommended normalize this spec to `page.goto('/index.html')` so configured baseURL is the single local server source of truth.
5. Current fixture route-blocks every request whose origin differs from the configured baseURL origin. External CDN/SDK/Supabase/OTP/FCM/payment/Zoom/geocoding requests are blocked. It does not permit live providers.
6. The config validates hostnames but does not verify that the local server is actually responding before browser launch. The first browser navigation will fail if server is down; a preflight health-check is a future improvement.
7. QA branch has no reviewed workflow trigger for the new guard; inspected workflows have branch trigger restrictions. CI has not run on this branch.

## Recommended next safe source patch
- Change TASKO/Laundry test navigation to relative `/index.html`, honoring configured local baseURL.
- Add a minimal local-server preflight before Playwright starts (or rely on the first navigation with clear failure; preflight should not make external calls).
- Consider adding a lockfile after a dependency/version review; do not run package installation with lifecycle scripts until the scripts and dependency set are reviewed.
- Add a dedicated workflow trigger only after review; no dispatch or secret access in this checkpoint.

## Verification status
- Config and fixture source review: complete.
- Workflow source review: complete.
- Server health/preflight: not implemented.
- Test execution: not run.
- CI: not run.
- Production/live providers: not accessed.
