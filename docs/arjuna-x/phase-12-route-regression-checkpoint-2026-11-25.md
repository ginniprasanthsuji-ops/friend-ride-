# Phase 12 — Route Regression Coverage Checkpoint (2026-11-25)

## Progress
- 78% (CI pending after route-test workflow update)
- QA branch only; no merge/deployment.

## Changes
- Updated `.github/workflows/friend-ride-regression.yml` so the Playwright step runs both:
  - `qa/tasko-laundry-main-regression.spec.js`
  - `qa/dark-gold-route-regression.spec.js`
- The route regression suite contains 12 tests, including:
  - route inventory presence/design system
  - customer/driver/partner registration entry points
  - home service navigation clicks
  - shared customer route activation
  - Admin role guard
  - OTP/login modal UI
  - all inventoried route IDs activate without route loss

## Verification
- Workflow change committed; CI run for this exact new commit was not yet visible at audit time.
- Existing latest CI before this workflow change was successful, but it does not validate the newly added suite.
- No test pass claim for the newly added route suite until the exact commit's run completes successfully.

## Remaining
1. Inspect CI for commit `18d6152d41a382895d5990206b4b2cf8df3200f9`.
2. Fix any route-suite failure on QA branch only.
3. Verify reduced-motion contract and repeated page activation behavior with browser-level coverage.
4. Check small viewport route navigation and final Phase 12 closeout.
