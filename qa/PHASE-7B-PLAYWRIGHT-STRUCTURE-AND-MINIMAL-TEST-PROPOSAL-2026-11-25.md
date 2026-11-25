# Phase 7B — Playwright Structure Inspection & Minimal Test Proposal
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
Reviewed commit: ac47fcd3766aad43525506dfa68a7378ec412eb7

## Files inspected
- qa/friend-ride.spec.cjs
- playwright.config.cjs
- package.json

## Current harness
- CommonJS Playwright tests using `test, expect`.
- TestDir: `./qa`; timeout 45s; retry 1; HTML report; failure trace retained.
- Default base URL is the hosted FRIEND RIDE GitHub Pages site; configurable by FRIEND_RIDE_BASE_URL.
- No dedicated test fixtures, mocked Auth state helper, or session storageState helper observed in the inspected files.
- Current suite mainly checks page/UI wiring, source markers, static simulations, and selected local interactions. It does not provide dedicated session A→B isolation coverage.

## Proposed minimal, safe test-only addition (not implemented)
Create a standalone test file `qa/phase-7b-session-isolation.spec.cjs` using deterministic in-memory/mock context. It should not call live Supabase Auth or AI endpoints.

Test cases:
1. anonymous context has no user-private fixture;
2. mock login A exposes only A fixture;
3. logout clears user/context/history references;
4. mock login B exposes only B fixture;
5. delayed A response after switch is discarded;
6. parallel A/B requests are bound to their own fixture/session;
7. logout leaves no private fixture visible.

## Implementation prerequisites
- Confirm a test-only mock boundary can be injected without modifying production page code.
- Ensure all mock fixtures and interceptors are scoped to Playwright test context.
- Keep network requests to Supabase/Auth/AI blocked or mocked in the new test.
- Use synthetic user IDs and synthetic fixture content only.
- Assert no live side effects.
- Review proposed test code before applying.

## Decision
No test implementation was added in this checkpoint because the current harness does not expose a confirmed session-mock boundary. A minimal isolated test file is proposed pending explicit approval for test-only changes.

## Status
- Source files inspected: complete for the listed files.
- Test execution: not run.
- App code/SQL: unchanged.
- Production: untouched.
