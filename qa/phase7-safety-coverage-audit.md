# FRIEND RIDE Phase 7 — QA Safety & Coverage Audit

**Branch:** `qa/phase9-stabilization-2026-11-24`  
**Scope:** audit, test safety, QA-only CI, and release blockers.  
**Production/main:** untouched.  
**External integrations:** none added. No live provider calls, payments, AI, Zoom, CIBIL, DigiLocker, maps, voice/calling, or backend schema changes are part of this phase.

## Phase 7 outcomes

| Work item | Status | Evidence |
|---|---|---|
| Coverage-gap review | Complete (audit) | Existing release-gate audit covers role/auth, rides, driver KYC, partner/shop, marketplace, food, parcel, services, complaints, notifications and live-only tests |
| Test tiers | Complete (defined) | Tier A local/mock; Tier B QA/staging; Tier C real-device/live-only |
| Local-only test target guard | Implemented | `scripts/qa-local-preflight.cjs` requires explicit URL and exact localhost/loopback host |
| Hostile/external URL rejection | Test-covered | `tests/qa-preflight-safety.test.cjs` rejects hosted URLs, look-alike hosts, FTP and malformed values before request |
| External-origin isolation | Implemented in Tier-A fixture | `qa/local-only-fixture.cjs` permits only configured local origin; external origins are aborted |
| Safety CI | Updated | `.github/workflows/arjuna-x-qa-safety.yml` now runs on QA branch push and manual dispatch |
| P0 security review | Audit complete; fixes not certified | See blockers below; requires authenticated staging evidence and/or privileged backend review |
| Regression execution | Pending evidence | GitHub Actions run triggered by this workflow update; verify actual result before marking Phase 7 runtime PASS |

## Test tiers

- **Tier A — local/mock:** localhost-only, deterministic mocks, external network blocked. Never use production data or real accounts.
- **Tier B — staging/QA:** separate test accounts and isolated QA data; verify role/RLS/RPC/storage behavior without production writes.
- **Tier C — real-device/live-only:** SMS receipt, push when app closed, two-device GPS movement, payment settlement and device lifecycle. Requires controlled device/account tests and is not simulated as PASS.

## Release-blocking security items (P0/P1)

1. **Database/RPC privileges:** inspect effective grants and authorization for privileged RPCs using a non-admin staging account. Source/schema inventory alone is not proof.
2. **SOS and live-location access:** verify participant/admin authorization, row ownership, update/subscribe scope, location retention and unauthorized reads/writes.
3. **Storage policy drift:** verify private buckets, upload ownership, signed URL expiry and cross-role document access. Confirm policies match the deployed bucket configuration.
4. **OTP deployment consistency:** verify deployed function/version, expiry, one-time use, rate/attempt controls, and Auth session exchange using a real QA account.
5. **Push/FCM:** verify token ownership, subscription authorization and event-to-recipient routing; closed-app device delivery remains Tier C.
6. **Role/approval enforcement:** verify server-side checks for Driver, Partner and Provider approval state and admin-only actions; UI hiding is not security evidence.

These findings remain **BLOCKED/NOT CERTIFIED** until the evidence is collected. No production SQL or policy changes were applied in Phase 7.

## Automated preflight coverage

The dependency-free test file checks:
- missing explicit target -> blocked exit code
- hosted/external and look-alike host targets -> blocked
- malformed URL -> blocked
- valid loopback target with unavailable server -> safe failure, not a remote fallback

The local preflight does not auto-switch to a hosted site. Tier-A browser fixtures abort external-origin requests.

## Phase 7 release decision

**QA safety tooling: IMPLEMENTED.**  
**Automated safety CI: PASS — Run #45247584009, all job steps successful.**  
**Security runtime verification: BLOCKED pending staging/live-only evidence.**  
**Production release/merge: BLOCKED.**

**Phase 7 audit + guard + CI implementation scope: COMPLETE.** Runtime/security verification remains blocked by staging/live-only evidence. This is not a security certification or Play Store release approval.
