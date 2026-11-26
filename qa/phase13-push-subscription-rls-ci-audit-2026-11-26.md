# FRIEND RIDE Phase 13 — Push Enrollment, RLS Inventory Coverage & CI Audit (2026-11-26)

## Scope / isolation
Read-only source review on `arjuna-x/phase-13-feature-audit` only. Source files inspected:
- `index.html` blob `e4d797dcfa741e0648e2d01d7afed8468e0c4c8e`
- `service-worker.js` (source inspected from this QA branch)
- `qa/read-only-regression.sql` blob `b341a1bf881bb326d08fc6fd4f48005a3663d8c8`
- `.github/workflows/friend-ride-regression.yml` blob `7a507c136b44aea9d957a2702e3592552267c7ab`
No production/main files, database, migrations, or SQL execution were changed.

## Push enrollment — static findings
- Frontend requests Notification permission, registers the existing `service-worker.js`, waits for service-worker readiness, refreshes it, requires the VAPID public key, and creates/validates a PushManager subscription.
- It reads `fr_push_subscriptions` for an active row matching endpoint and current user; if not recognized/key mismatch, it deactivates a matching endpoint row for the current user, unsubscribes, then subscribes again.
- It upserts endpoint, p256dh, auth key, user ID, user-agent and active status with conflict key `endpoint`.
- Frontend success text says background push has been registered; it does not establish that push delivery, recipient scoping, or notification click navigation work on a physical device.
- Service worker supports Firebase Messaging background notifications and generic push events, maps event text/role to ride/order/delivery/payment alerts, and handles notification click by focusing/navigating an existing window or opening one.

## GAP / BLOCKED items
1. **GAP — subscription ownership & account-switch safety:** the frontend upsert uses endpoint as conflict key and may update a row's user ID. Server-side policy must enforce that authenticated user can only write their own subscription and must prevent endpoint takeover or cross-account reassignment without a safe cleanup/claim flow. SQL/RLS policies were not inspected or executed.
2. **GAP — logout cleanup:** inspected logout hook stops FRIEND RIDE realtime listeners, but this source path does not deactivate or unsubscribe the push subscription on logout. Confirm desired persistence behavior and ensure subsequent account sign-in does not deliver previous-user notifications.
3. **GAP — QA inventory coverage:** read-only SQL inventories `fr_push_subscriptions` for existence/RLS-enabled status and includes expected RPC names `fr_get_push_runtime_config` and `fr_push_notification_webhook`, but does not enumerate/verify push-subscription table policies, webhook authentication/authorization, or runtime-config secret exposure. Presence-only function checks do not prove permissions.
4. **PENDING — actual push:** no real device/browser permission, subscription, background delivery, account-switch, notification-click, or FCM/Web Push test was executed in this continuation.

## CI evidence — observed for current branch head
- Commit: `5afe49ec67c4177382803ab57cb0d5d2ac3fa7b8`
- Workflow run ID: `45756576433`
- Workflow: FRIEND RIDE Regression, event `push`
- Status/conclusion: **completed / success**
- Job: `browser-regression`, completed success.
- Inline JS + V10.1 integration validation: step completed success.
- Node unit/static regression: **45 passed, 0 failed, 0 skipped**.
- Playwright browser regression: **66 passed**.
- Report artifact uploaded successfully (ID `15087464746`).
- Commit combined status endpoint returned an empty statuses list; the workflow run/job is the positive CI evidence.
- Branch-filtered workflow-runs query was not available through the connector; the latest global run retrieved was for the current QA branch head above. No failure or pending run was observed for that head.

## CI WARNINGS / RELEASE RISKS
- `npm install` reported **3 dependency vulnerabilities: 1 moderate and 2 critical**. The install log did not identify the affected package names; do not mark this resolved until a detailed audit is run.
- QA branch `package.json` exists, but `package-lock.json` and `npm-shrinkwrap.json` were not found at the root in the checked ref. This weakens reproducible dependency installs and may contribute to dependency drift.
- CI logs show deprecation warnings for `punycode` and legacy `url.parse()`, and a GitHub Actions warning that `actions/checkout@v4`, `setup-node@v4`, and `upload-artifact@v4` target Node 20 but are being forced to Node 24 on current runners. CI succeeded, but these should be tracked.

## Classification
- **PASS (CI only):** JS validation, Node unit/static regression 45/45, Playwright browser regression 66/66 on the observed commit.
- **PASS (static inspection only):** push enrollment and service-worker event-handler source wiring present.
- **GAP:** push subscription ownership/RLS, account-switch/logout cleanup, webhook authorization/runtime-config exposure, and QA SQL coverage.
- **BLOCKED:** live background push verification and detailed dependency vulnerability triage.
- DB/RLS tests executed: 0.
- Production changes/migrations/deployments: 0.

## Progress
Phase 13 frozen baseline remains **80.5%**; remaining **19.5%**. This evidence does not justify recalculating the frozen progress graph or unrelated audit estimates.

## Next audit task
Read-only audit notification webhook/runtime-config source and the related SQL/migration definitions on this QA branch; verify endpoint auth, subscription ownership constraints, recipient filtering, secret handling, and event deduplication. No SQL execution or migrations without explicit user approval.
