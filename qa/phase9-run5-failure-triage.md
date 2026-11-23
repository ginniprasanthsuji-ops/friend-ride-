# Phase 9 Regression Run #5 — Failure Triage

- Run: https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45246419796
- Branch: `qa/phase9-stabilization-2026-11-24`
- Commit under test: `0e004ddf920be350188e3c9b973404eb9e9deae9`
- Outcome: FAIL. Playwright HTML report artifact was recovered and inspected.

## Findings

### Browser fixture isolation
The shared Tier-A fixture blocks all external origins, including the Supabase JS CDN. The app then throws boot-time errors such as `window.supabase.createClient` undefined and `sb is not defined`. This is test-fixture isolation, not a live backend failure. A deterministic offline Supabase stub has been added in commit `d9271e14e5e4a4be61ee64bbdca166d8c021ef8d`; run #6 is validating it.

### Application JavaScript/runtime issues observed
- TDZ/undefined references involving `selectedRole`, `frSelectedCustomerAvatar`, and `$` occur in some registration/auth/menu workflows during browser tests.
- These require targeted app-side investigation; no production/main changes have been made.

### Dark + Gold UI regression expectations
The dark-gold route suite currently reports missing design-system marker and expected native-home components, plus legacy purple/light surfaces and navigation mismatch. Current QA-branch app markup/styles do not satisfy those tests. This is an app/UI implementation gap rather than a test-fixture issue. Preserve the test expectations; do not weaken them merely to turn CI green.

## Next
1. Inspect run #6 after the offline Supabase fixture change.
2. Separate test-fixture failures from app-runtime and Dark + Gold implementation failures.
3. Fix app defects only on the QA branch, with focused tests.
4. Require a full regression PASS before declaring Phase 9 complete.
