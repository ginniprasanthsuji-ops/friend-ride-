# Phase 7 — Minimal QA Branch CI Design (Proposal)

**Proposal only. Not implemented or dispatched.**

## Intended triggers
- `push` to `arjuna-x/phase-7-ai-intelligence-safety` for reviewed test/config/docs paths.
- `workflow_dispatch` only for explicit manual QA.
- Do not trigger production deployment.
- PR target `main` may run only local/mock tests, subject to branch protection and permissions review.

## Job 1 — Static/local-only
1. Checkout branch.
2. Node setup with pinned major/version.
3. Install dependencies from lockfile using clean install (`npm ci`, if lockfile exists and is compatible).
4. Inline script syntax checks.
5. Unit tests, after side-effect inspection.
6. Typechecks (check-only).
7. Core unit tests (after network/mock verification).

## Job 2 — Browser Tier A
1. Start static server bound to localhost.
2. Health-check localhost.
3. Set explicit `FRIEND_RIDE_BASE_URL=http://127.0.0.1:<port>/`.
4. Run only reviewed QA specs.
5. Fail fast if Playwright baseURL is not localhost.
6. Verify browser network log has no disallowed external provider calls (allow-list localhost only or explicitly reviewed static assets).
7. Upload sanitized artifacts only; no screenshots/logs if they could contain sensitive user data.

## Permissions and controls
- Job-level `permissions: contents: read` only.
- No secrets/environment variables from production.
- No write permissions, deployment steps, migrations or database cleanup.
- Timeouts and concurrency limits.
- Manual protected staging workflow is separate; no SMS, payment, FCM, Zoom, AI, geocoding, or KYC provider calls in Tier-A.

## Acceptance criteria before implementation
- Workflow YAML reviewed line-by-line.
- Test commands verified against package scripts.
- Dependencies/lockfile availability and install lifecycle scripts reviewed.
- Local-only network guard verified.
- Artifact policy reviewed.
- QA branch owner approval recorded.

## Current decision
**HOLD implementation/dispatch** until the test isolation guard and workflow scope receive review. No CI has been launched in this checkpoint.
