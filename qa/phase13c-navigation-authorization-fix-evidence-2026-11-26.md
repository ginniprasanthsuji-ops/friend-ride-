# FRIEND RIDE Phase 13C — Navigation authorization regression fix (2026-11-26)

## Frozen handover
- Planning / Checklist: **88%** (unchanged)
- Overall Audit estimate: **12%** (unchanged)
- Progress graph: **frozen**
- Production/Main: **untouched**
- QA database migrations applied this continuation: **0**

## Access
- GitHub QA branch `arjuna-x/phase-13-feature-audit`: verified available.
- Supabase QA project `pqsangtvietawkfgpgfu`: `ACTIVE_HEALTHY`.
- Production project separately identified; no production calls/writes.

## Previous CI run inspected
Workflow run `45739482289` on commit `ddf32069f618f959a6a58276b75841547392ebd3` completed with **49 passed / 18 failed** in browser regression.
- Inline JavaScript/version integration check: passed.
- npm install: passed.
- Node unit/static suite step: passed.
- Playwright Chromium install: passed.
- Static server startup: passed.
- Browser suite: failed.
Failure logs showed route-authorization tests where `showPage` returned from a role guard but later page-isolation wrappers still activated the denied page. Other failures included a missing `fr-dark-gold-design-system` assertion and UI/modal/navigation checks; no claim that all failures share one root cause.

## QA-branch-only substantive source fix
- Core `showPage` now returns `false` on role/auth denial before page activation and `true` only after navigation side effects.
- The market-order wrapper propagates the denied result instead of swallowing it.
- Partner-approval route guard returns `false`.
- Both later route-isolation wrappers preserve the existing page state when a navigation is denied and isolate pages only for accepted routes.
- Added `tests/phase13c-navigation-guard-propagation.test.cjs` to statically check denial ordering, success return position, and wrapper propagation/isolation behavior.

## Checks in this continuation
- In-memory source/test static assertions: **7/7 passed**.
- New Node test file syntax compile (V8 compile-only check): **passed**.
- GitHub Actions Node unit/static test step: **passed**, including the new navigation propagation test.
- Playwright after this fix: **in progress** in run `45743043471`; no PASS claimed.
- QA SQL: read-only inventory/security query re-executed successfully; module inventory unchanged.
- Payment/QR storage bucket `provider-payment-qr` (and queried aliases): **not found**; matching storage policies: none. Catalogue/order tables: none found by the QA inventory query.
- No SQL migrations applied.

## Live QA inventory
- 39 public tables, RLS 39/39, FORCE RLS 0, 77 policies, 40 client-write policies.
- Client TRUNCATE/MAINTAIN grants 0; SECURITY DEFINER missing fixed search_path 0.
- QA admin rows 0; 6 admin RPCs; anon EXECUTE 0, authenticated EXECUTE 6, missing guard-pattern count 0 (static guard pattern only; runtime Admin testing unavailable).
- Core Ride 10/10; Payment/QR 0/11; Catalogue/Cart/Order 0/11; Home Services 5/7; Referral 4/7; Flash Sale 2/3; ERS/RRS 6/7.

## Changed artifacts
- `index.html`: route-denial propagation and page isolation correction.
- `tests/phase13c-navigation-guard-propagation.test.cjs`: static regression test.
- Previous QA inventory and evidence remain unchanged.

## Release
**BLOCKED.** Browser regression previously failed and needs rerun after this fix; the newly added test is not yet confirmed by Node runner. Module backend gaps, admin runtime testing, and role checks remain. QA branch only; production untouched; estimates/graph frozen.


## Current CI run
- Run `45743043471` (`run #1229`, QA branch commit `ebc787e63e9e17ad0f5843d13b2372354de9c721`): inline JS check, npm install, Node unit/static suite, Chromium installation, and local server steps completed successfully. Browser regression remains in progress at evidence update.
- [Open GitHub Actions run](https://github.com/ginniprasanthsuji-ops/friend-ride-/actions/runs/45743043471)
