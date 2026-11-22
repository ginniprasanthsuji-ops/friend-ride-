# FRIEND RIDE QA Regression Gate

QA recovery branch: qa/ui-regression-recovery-2026-11-22
PR: #34

## Required automated checks
- [x] Inline JavaScript syntax validation (29 scripts)
- [x] Playwright browser regression suite (58 tests)
- [x] Navigation isolation and 5-tab bottom navigation
- [x] Cycle Delivery card, route, pricing calculator, partner login entry
- [x] VidyaSetu Teacher, Student, Coaching Center entry points
- [x] Teacher dashboard and role-selector return navigation
- [x] Notification bell and profile avatar fallback
- [x] No browser JavaScript errors in added smoke tests

## Verification evidence (2026-11-22)

- QA HEAD tested: `667c99230f7982df7130570e4d74a096ad0d3622`
- Browser regression: [Run #390](https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/44954208961) — 58/58 passed.
- Quality gate: [Run #33](https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/44954208991) — typechecks, runtime build, Node 4/4, Vitest 5/5, inline syntax and integrations passed.
- Inline syntax: 29/29 scripts passed.
- GPS coverage is simulated in browser tests; physical-device GPS and real backend/OTP/push/payment flows are not release-certified.

## Release gate

Do not merge QA to main or deploy unless the complete regression workflow succeeds, integration history is reconciled, and the UI migration is reviewed. If CI is unavailable or incomplete, keep main and live deployment untouched.
