# Phase 7B — Manual CI Evidence Collection Readiness
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety

## Evidence reconciliation
Reviewed existing Phase 7B documentation and release gate:
- Logout/session restore is explicitly marked LIVE TEST REQUIRED by release gate.
- Existing CI push trigger does not include this branch; manual dispatch is the documented route.
- CI workflow runs inline-JS check, npm dependency installation, Playwright Chromium and npm test.
- Static logout evidence shows cleanup markers but not cross-user isolation proof.
- No dedicated test fixture or auth session-switch helper was found in the reviewed files.

## Manual CI run checklist (user/repository UI action)
1. Open repository Actions → FRIEND RIDE Regression.
2. Choose Run workflow and select branch `arjuna-x/phase-7-ai-intelligence-safety`.
3. Run the workflow without production secrets or production data.
4. Record run URL, commit SHA, job conclusion, test totals, report artifact names.
5. Inspect failed tests and trace artifacts if any.
6. Do not equate a green source/DOM suite with authenticated A/B session isolation.

## Evidence fields to capture
- Workflow run ID/URL:
- Exact commit:
- Job status:
- Inline JavaScript validation:
- Playwright regression result:
- Unit/core test result:
- Artifact/report:
- Failure details:
- Runtime session tests included? (No in current inspected coverage)
- Production writes performed? (Should be No)

## Next decision
A manual workflow dispatch cannot be triggered by the current available connector action. User/repository UI execution is required for this evidence. Test-only session isolation additions remain unimplemented pending explicit approval of a mock boundary.

## Status
- Readiness checklist: documented.
- CI execution: not run from this audit.
- App/SQL/backend/production changes: none.
