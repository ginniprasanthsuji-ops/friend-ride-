# Phase 7 — Final Release Blocker Priority Matrix (Checkpoint)

Date: 2026-11-23. QA branch source/catalog evidence only. Not a runtime certification.

## CI evidence
GitHub Actions query for branch `arjuna-x/phase-7-ai-intelligence-safety` returned 0 workflow runs. This confirms no branch run records were found in the queried Actions list at the time of review. It does not prove workflow failure. Combined commit statuses were also empty.

## Prioritized blockers

### P0 — Security / data integrity gates
1. Broad authenticated grants and TRUNCATE privilege risk documented earlier. Must narrow privileges only after direct-write callsites are migrated/tested; do not blanket revoke yet.
2. SOS insert policy does not show ride-participant predicate; live-location update destination ride participant predicate is incomplete. Hardening SQL is proposal only; tests required before applying.
3. Storage catalog drift: QA storage buckets/policies inventory empty while source references multiple buckets. Authenticated uploads cannot be certified; reconcile QA storage configuration and least-privilege rules.
4. OTP deployment discrepancy: QA Edge Functions list excludes `Sms-otp`, while historical main-branch report says active. Current QA auth cannot be release-certified until project/environment mapping and endpoint status reconciled.

### P1 — Core workflow
5. Ride booking pickup/drop/fare/driver acceptance state transitions — browser/runtime and backend tests pending.
6. Role routing and unauthorized role/session switch — test source exists, but no CI run evidence on this branch.
7. GPS/live tracking — two-device real staging test required. External geocoding/map provider restriction impacts location UI; de-scope/approved fallback plan remains pending.
8. Driver/partner KYC and Admin review — private storage configuration drift blocks certification.
9. TASKO/Laundry booking and assignment — tests exist; branch CI execution and staging workflow evidence absent.

### P1 — Notifications / integrations
10. FCM token registration module `fcm-web-push.js` exists, but QA `index.html` source did not show module linkage; generic permission handler is separate. Linkage/runtime registration test needed.
11. Active FCM dispatch and Zoom functions conflict with restricted external-provider preference; de-scope plan exists but no changes applied.
12. Notification queue/cron is enqueue-only; dispatch dependency and failure behavior must be tested, including preferences and token ownership.

### P2 — Release package
13. AAB build/signature, Play Console privacy/data safety, account deletion, policy and listing checks remain.
14. Full regression across 58 routes/screens and role-specific access remains unverified.
15. Real-device tests for OTP, push, GPS, ride, SOS, and payment are live-only. Payment processing remains restricted; sample UI must not imply real settlement.

## Recommended safe execution order
1. Reconcile QA vs historical OTP project/function inventory.
2. Run QA branch static/unit/browser suites in isolated CI; verify no secrets/external calls/write paths.
3. Resolve source-to-test coverage gaps and notification module linkage.
4. Review proposed provider de-scopes with workflow impact; obtain explicit approval before implementation.
5. Reconcile Storage buckets/policies and prepare minimal privilege remediation; test before changes.
6. Validate SOS/live-location policy proposals with participant and lifecycle test matrix.
7. Stage real-account/device tests only with explicit test accounts, controlled contacts and consent.
8. Keep release gate BLOCKED until evidence collection is complete.

## Safety status
No CI workflow was dispatched in this review; queried Actions list had zero runs for the QA branch. No production access, merge, deployment, source code modification, database write, storage write, SMS, FCM test message, or payment was performed.
