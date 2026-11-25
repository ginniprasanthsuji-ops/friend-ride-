# Phase 7B — Critical Release Blocker Priority Matrix

**Date:** 2026-11-25  
**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Checkpoint:** 91% estimated static QA/documentation progress (not runtime coverage)  
**Scope:** QA documentation status refresh only. No application, SQL, test, backend, or production changes.

## Prioritized blockers

### P0 — Security / certification blockers
- Auth session and role restoration/logout behavior: live verification required.
- User A/B session isolation and late-response discard: not runtime tested.
- Security Advisor warnings and 22 RLS-enabled tables without direct policies: review intended RPC access paths and authorization.
- Private KYC/storage access: authenticated owner/admin runtime access checks required.
- Play Store release gate: remains blocked until evidence-backed checks and security findings are resolved or formally accepted.

### P1 — Core operational workflow blockers
- Food ordering: frontend/backend order workflow reported disconnected.
- Service Provider and Technician registration: handler-only; no completed application/storage workflow evidenced in release gate.
- Generic Goods Delivery request: handler mapping blocked.
- CRM, User Management, referral approval, cash reward approval, payment approval queue: backend/UI connection blockers documented.
- Cashfree checkout/webhook/settlement and subscription payment: not connected in inspected release-gate evidence.
- Background push, GPS/live tracking, and real-device integrations: live tests required.

### P2 — Release evidence and polish gates
- 58-route UI/interaction checks on current branch.
- AAB build/sign/validation.
- Play Console policy, privacy, data safety, account deletion and store listing.
- Invoice/QR/payment permission and access verification.
- Manual evidence package: CI URL, commit SHA, run result, test totals, artifacts, device matrix, and redacted logs.

## Phase 7B-specific acceptance focus
1. CI workflows execute on the Phase 7B branch and evidence is captured.
2. Synthetic User A logout followed by User B login yields no A-owned UI/data.
3. Pending A responses are discarded after session switch.
4. Parallel authenticated A/B requests cannot cross-contaminate responses.
5. Logout clears role/session state, timers, subscriptions and owned requests.
6. Invalid/expired/mismatched sessions enter safe fallback.
7. Diagnostics/errors redact credentials and personal data.
8. Mock/simulation evidence is clearly separated from live backend/device evidence.

## Updated evidence status
- CI run evidence: **confirmed successful** for ARJUNA X QA run `45588309381` and FRIEND RIDE Regression run `45588309360`.
- Regression evidence recorded: Node contract tests **25 passed / 0 failed**; Playwright browser tests **5 passed / 0 failed**; report artifact uploaded.
- CI source/log evidence is recorded in `qa/PHASE-7B-CI-RUN-EVIDENCE-2026-11-25.md`.
- Static harness boundary audit: complete for the reviewed files.
- Authenticated User A→B runtime session switching: pending.
- Stale A response after B login: pending.
- Parallel authenticated request isolation: pending.
- Server-side role/auth enforcement and private KYC/storage runtime checks: pending.
- Live device/integration tests (OTP/SMS, push, GPS, payments): pending.
- Play Store certification: **BLOCKED**.

No runtime session isolation PASS or release certification is claimed. CI success covers only the recorded automated suites.
