# Phase 11 QA Execution Runbook

## Safety requirements
- Test only against a locally served copy.
- Do not set FRIEND_RIDE_BASE_URL to a hosted, production, or public URL.
- Keep main and production untouched.
- Do not record a test as passed until the command output is captured.

## Run static security/isolation contracts
From the repository root, with Node.js 22:
```sh
node --test qa/phase-11-security-isolation-contract.test.mjs
```

## Run local browser regression
Terminal 1:
```sh
npx --yes http-server@14.1.1 . -p 4173 -s
```

Terminal 2:
```sh
FRIEND_RIDE_BASE_URL=http://127.0.0.1:4173/ npm test
```

The npm test script runs the local-only preflight before Playwright. The browser tests are configured for localhost/loopback only and block service workers.

## Expected browser scenario count
- Registration role isolation: 4 scenarios (customer, driver, partner, admin)
- Dashboard page isolation: 1 scenario

## Evidence to retain
- Static test output with pass/fail totals
- Playwright test output with pass/fail totals
- Playwright HTML report and test-results artifacts
- Any failure trace, screenshot, and exact error

## Closeout criteria
Phase 11 may be closed only after static contracts and all 5 browser scenarios execute successfully, CI evidence is available, and failures (if any) are fixed and rerun.