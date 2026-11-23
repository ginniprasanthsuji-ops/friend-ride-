# Phase 7 — Network-Isolation Guard Implementation Readiness

**Status:** design and acceptance criteria only; no code changed.

## Minimum safe patch scope (QA branch only)
1. Add a fail-closed localhost URL guard to Playwright config or a Tier-A-specific config.
2. Default local-only suite base URL must not be the hosted app.
3. Add a shared test fixture/context route handler that blocks external origins by default.
4. Add test proving localhost requests pass and non-local external request is aborted.
5. Ensure static-server port and base URL match; health check fails if server unavailable.
6. Add tests to CI only after review; workflow remains read-only and has no secret env.
7. Keep test suites that require staging/provider behavior separated and opt-in.

## Guard behavior
- Allowed: `localhost`, `127.0.0.1`, `::1` only, with configured local port.
- Denied: hosted URLs, production Supabase project, external CDN, SMS, FCM, Cashfree, Zoom, geocoding, maps/tiles, AI, any other provider.
- Test runner should fail immediately when URL is not local; no silent fallback.
- Route blocker logs only origin and blocked request category, not full query string or tokens.
- Allow explicit mock fixtures only, not network exceptions for real providers.

## Do not patch until
- Confirm branch current commit and clean/expected file state.
- Inspect Playwright version and API compatibility.
- Inspect package lock and install scripts.
- Design reviewed for app's CDN dependency; local test may need static SDK mock rather than real external load.
- User approves source/config patch. The prior “Continue” authorizes audit continuation, but not bypassing the established safety boundary.

## Readiness
- Test source audit: completed for reviewed files.
- Isolation design: ready for code patch review.
- Actual guard: not implemented.
- Tests: not run.
- CI: not run.
