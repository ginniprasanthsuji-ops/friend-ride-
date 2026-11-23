# Phase 8 Consolidated QA Maintenance

**Branch:** `qa/phase8-16-notification-consistency-2026-11-24`  
**Purpose:** Automate the consolidated QA regression after the Phase 8 checkpoint contracts were added.

## CI checks configured
1. Inline JavaScript syntax check
2. Node unit/contract tests (`npm run test:unit`)
3. Playwright Chromium installation
4. Static app-server health check
5. Browser regression suite (`npm test`)
6. Playwright report and test-results artifacts uploaded on completion

## Trigger
- Push to the Phase 8.16 QA branch
- Manual workflow dispatch

## Safety
This workflow is isolated to QA branch automation. It does not merge or deploy to production. CI execution results must be reviewed before declaring the regression pass.
