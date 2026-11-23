# Phase 7 — Test Execution Safety Checklist & P0 Security Plan

**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Audit type:** Read-only planning/source review  
**No tests run, no CI dispatched, no secrets accessed, no DB/storage writes, no provider calls, no deployment.**

## 1. Test tiers and safe order

### Tier A — local/deterministic (safe first)
- Inline JavaScript syntax validation.
- Static/source assertions and unit tests that do not require credentials.
- Playwright against a local static server with mock/simulated data.
- QA page deterministic simulations; verify live-only sections remain clearly blocked.
- UI role launcher, routing, field visibility, pricing preview, navigation, diagnostics visibility.
- PWA static asset/service-worker source checks.

**Safety gate:** Tests must not accidentally call live Supabase, SMS, FCM, Cashfree, Zoom, geocoding/maps, AI, or other restricted external providers. If test source is not clearly mocked/offline, stop and review before running.

### Tier B — isolated QA/staging account tests (explicitly gated)
- Dedicated QA customer/driver/partner/admin accounts only.
- Small number of test records; no personal documents or real phone numbers except specifically approved OTP recipient.
- Confirm project URL/ref and environment before test; refuse if production ref appears.
- Check test cleanup is reversible and does not delete unrelated records.
- No KYC upload, payment, SMS, provider dispatch, or privileged RPC until each has a documented safe test setup and approval.

### Tier C — real-device/provider tests (approval required)
- Real OTP/SMS delivery.
- Two-device GPS/live location.
- Push delivery/closed-app notifications.
- KYC private uploads and Admin preview.
- Payment/settlement, QR verification, external classroom integrations.
- Signed AAB/device compatibility and Play Store policy validation.

These are **not** run by this checklist. Restricted-provider rules remain in force.

## 2. Preflight checklist before any execution
- [ ] Confirm branch is exactly the Phase 7 QA branch.
- [ ] Confirm repository and latest commit SHA.
- [ ] Confirm workflow trigger scope and inspect every job/step.
- [ ] Inspect package scripts for network calls, live credentials and destructive commands.
- [ ] Inspect test fixtures for real URLs, auth tokens, API keys and production refs.
- [ ] Confirm test server binds localhost and test data is deterministic.
- [ ] Confirm no SQL migration, DB write, storage write or cleanup/deletion occurs.
- [ ] Confirm external-provider calls are mocked, disabled or explicitly authorized.
- [ ] Confirm artifacts contain no secrets, OTPs, personal data or private documents.
- [ ] Run only approved Tier A tests; record exact command, commit, duration, results and failures.

## 3. P0 security test plan (must block release if unresolved)

### A. Role & authorization matrix
For each sensitive table/RPC and direct-write endpoint:
- Unauthenticated request → deny.
- Authenticated wrong-role request → deny.
- Nonparticipant access to ride/location/customer/driver data → deny.
- Participant access to permitted data → allow only necessary fields.
- Admin access → allow only documented admin action.
- Attempt role/status escalation via profile mutation → deny.
- Confirm row and column permissions, including broad grants; RLS alone is not enough for TRUNCATE.

### B. SOS and live location
- SOS insert must verify sender identity and ride participation (plus agreed lifecycle rules).
- Nonparticipant SOS attempt → deny.
- Live-location update must validate both user identity and destination ride participation in WITH CHECK.
- Move a participant location to another user's/ride's record → deny.
- Test stale, malformed and out-of-range coordinates; rate limit and lifecycle behavior.
- Controlled alert test only after notification provider is approved.

### C. Storage/private KYC
- Verify exact bucket existence, privacy and policy state in QA before upload tests.
- Owner can access only their own permitted object.
- Non-owner/non-admin cannot read or download.
- Admin preview follows role policy.
- Reject disallowed MIME, oversize files and path manipulation.
- Confirm signed URL expiry and metadata write authorization.
- Do not upload real identity documents during QA.

### D. OTP/session
- Inventory deployed QA function and frontend caller; reconcile missing-function discrepancy.
- Test expiry, single-use, attempt limits, resend cooldown, rate limits and session role.
- No fake OTP, bypass or hardcoded acceptance.
- Test role mismatch and logout/session restoration.

### E. Notification token ownership
- Test token registration owner identity.
- A token conflict must not silently transfer ownership without verified semantics.
- Verify dispatch secret and service-role protections without exposing secret values.
- Provider send remains disabled/restricted until approved.
- Test fallback in-app/polling, quiet hours, duplicate idempotency and retry semantics locally/mocked.

## 4. Workflow review finding (current source)
- FRIEND RIDE Regression push trigger targets `main` and the legacy dark-gold branch; manual and schedule triggers exist.
- TASKO/Laundry regression push trigger targets its integration branch; PR target is `main`.
- Quality workflow push target is `main`; PR target is `main`.
- ARJUNA X Core CI push target is `arjuna-x/implementation-foundation`; PR path covers `arjuna-x/**`; manual trigger exists.
- Consequently, the current Phase 7 QA branch has no matching ordinary push trigger across these inspected workflows. Prior audit found zero runs for this branch.

**Recommendation:** Prepare a minimal, reviewed QA-branch trigger change with Tier-A-only jobs. Do not dispatch or change triggers in this checkpoint. Before enabling, verify workflow permission scopes, artifact content, test provider isolation and whether npm install/scripts can reach restricted services.

## 5. Stop conditions
Stop and report if any test:
- Uses production Supabase ref or production credentials.
- Makes real SMS, push, payment, Zoom, AI, geocoding or other restricted-provider requests.
- Performs destructive DB/storage cleanup or migration.
- Exposes secrets or personal data in logs/artifacts.
- Requires role escalation or bypass to pass.
- Has unclear side effects or fixture cleanup.

## 6. Checkpoint status
- Checklist and P0 test plan: **documented**.
- Source workflow review: **done for inspected workflows**.
- Tests executed: **0**.
- CI dispatched: **no**.
- Database/storage changed: **no**.
- Production merge/deploy: **no**.

## Next
Review the proposed minimal QA branch CI trigger/job design (read-only), then prepare exact local-only test commands and an isolation check before execution.
