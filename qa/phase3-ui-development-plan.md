# ARJUNA X — Phase 3: UI & App Development

## Start / Scope
- QA branch only: `arjuna-x/phase-3-navy-orange-ui`
- Production `main` and live deployment remain untouched.
- Preserve backend logic, Supabase schema, auth, payments, RPC/API contracts.
- UI/UX changes only; do not create parallel themes or duplicate dashboards.

## Phase 3 target
1. Establish consistent mobile-first Navy + Orange design tokens and accessible contrast.
2. Remove legacy purple styling from user-facing surfaces, where safely covered by shared tokens.
3. Make navigation/service entry points consistent; service taps should open dedicated screens with back navigation, not expand results beneath the home screen.
4. Improve typography, spacing, touch targets, responsive layouts, and Telugu/English label legibility.
5. Keep customer/driver/partner/admin visibility role-aware; UI hiding is not authorization.
6. GPS current-location display must use permission + actual location/reverse geocoding; never hardcode Tekkali.
7. Build changes in small QA commits and run automated checks before any PR review.

## Phase 3 workstream sequence
- P3-A: design tokens, global shell, typography and contrast
- P3-B: navigation and dedicated-screen routing
- P3-C: Home/service tiles, search, offers, orders and saved items
- P3-D: ride booking/location UX and responsive map surfaces
- P3-E: role-specific dashboards and visibility
- P3-F: service modules consistency (stores, delivery, TASKO, Laundry, education, hotels, etc.)
- P3-G: accessibility and visual regression acceptance

## Current verified baseline
- Branch exists and its `index.html` contains Navy + Orange CSS tokens (`--navy: #102a43`, `--orange: #f58220`).
- Root `index.html` on Phase 2 branch still has legacy purple tokens, so Phase 3 branch is the intended UI migration branch.
- Phase 2 automated checks passed on the reviewed commit. This document commit itself has not yet been CI-verified.
- No merge or deployment is authorized.

## Acceptance gate
Phase 3 is not complete until the user-facing routes/screens have been reviewed, the legacy styling is removed consistently, Telugu/English labels and touch targets are checked, and Playwright/regression suites pass on the final Phase 3 head commit.
