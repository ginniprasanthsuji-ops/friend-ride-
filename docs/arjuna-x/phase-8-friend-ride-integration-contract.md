# ARJUNA X Phase 8 — FRIEND RIDE Integration Contract

Status: Phase 8 started; planning and source-level integration groundwork only.
Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Safety: QA branch only. Do not merge/deploy, access production Supabase, mutate schema/auth/payments, or call live providers without explicit approval.

## Goals
Connect ARJUNA X assistant intents to FRIEND RIDE app navigation and workflows through a narrow, reviewable adapter. Voice is an intent-input method; it must not bypass app permissions, role checks, confirmation screens, or backend authorization.

## Integration modules
1. Voice command intents: navigate home/ride/orders/services/profile; set pickup/drop only after user confirmation; request GPS only after permission.
2. Location: device permission -> current coordinates -> address display; allow manual pickup/drop edits. Do not send location to external geocoding services in this phase without approval.
3. Ride workflow: select Bike/Auto/Car; capture pickup/drop; show quote/fare/booking review; require explicit final confirmation before any booking mutation.
4. Orders/services: navigation to existing screens only; do not initiate purchases, bookings, payments or provider calls.
5. Safety: never execute ambiguous intents; no background mic/GPS; no external-origin network access in QA; never expose PII to logs.
6. QA: unit tests for intent parsing and action allowlist; local Playwright tests for navigation/confirmation UI; mock backend/provider responses.

## Proposed intent contract
- `navigate`: target in {home, ride, orders, services, profile, help}
- `set_location`: field in {pickup, drop}; value must be user-confirmed; location source {manual, device}
- `select_ride`: type in {bike, auto, car}; no booking side-effect
- `review_booking`: requires confirmed pickup, drop and ride type; displays existing review UI
- `confirm_booking`: only from explicit user button/action, never voice-only; re-check role/auth and existing backend validation
- `cancel`: cancel assistant intent or draft; not a real ride cancellation unless existing authenticated confirmation flow is invoked

## Acceptance criteria
- Voice intents are mapped to an allowlisted set of app actions.
- Unknown or ambiguous commands do not execute.
- Booking/payment/provider actions require explicit in-app confirmation.
- Role and backend authorization remain authoritative.
- Location permission is requested only at point of need; manual location remains available.
- QA uses local-only fixture and mock responses; no production/live provider calls.
- Changes are committed on QA branch, reviewed, and tests are executed only after test environment safety review.

## Out of scope / prohibited for this phase without approval
- Production deployment or merge to main.
- Production database, schema, auth, RLS, secrets, or payments changes.
- Real OTP/SMS, Cashfree, FCM delivery, WhatsApp/calling automation, Zoom, DigiLocker, CIBIL/NBFC, external geocoding/maps provider calls.
- Background recording or tracking.


---

# ARJUNA X Phase 8 — Voice Intent QA Checkpoint

**Phase:** 8 — FRIEND RIDE Integration  
**Branch:** `arjuna-x/phase-7-ai-intelligence-safety`  
**Status:** Safe adapter groundwork in progress; no FRIEND RIDE UI wiring or booking mutations.

## Scope completed in this checkpoint
- Added expanded tests to `tests/voice-intent-contract.test.cjs` for normalized commands, invisible characters, English/Telugu booking-review variants, payment/cancel blocking, unknown/admin intents, and location-sharing/address injection rejection.
- Added the Phase 8 voice-intent contract test step to `.github/workflows/arjuna-x-qa-safety.yml`.
- CI exposed a normalization bug: punctuation removal could leave trailing whitespace and cause otherwise allowlisted commands such as `MY ORDERS!!` to fall through as unknown.
- Fixed `qa/voice-intent-contract.cjs` to trim after punctuation/whitespace normalization.
- Reproduced the parser and tests in a local Node-only isolated test harness: **10/10 tests passed** after the fix.

## Commits
- `26c88f9d` — expanded voice intent contract tests.
- `393bcd4b` — added Phase 8 contract tests to QA safety workflow. CI run `45306568998` failed because the normalization edge case was caught (9/10 intent tests passed; preflight safety passed).
- `c3abc18b` — normalization fix.

## CI status
- Original run `45306568998`: **FAIL**, test detected normalization bug.
- The fix commit has no observed GitHub Actions run yet. Local isolated Node tests passed 10/10. Do not mark GitHub CI green until a run is observed.

## Safety boundaries preserved
- No microphone or GPS access.
- No external network/provider calls.
- No direct booking/payment/cancellation execution from voice.
- Location/address commands remain unknown/fail-closed.
- No production/main changes, merge/deploy, Supabase schema/auth/storage/RLS changes, or live backend tests.

## Next Phase 8 work
1. Verify CI after the normalization fix (if run is available).
2. Define a typed action adapter over the intent allowlist, keeping navigation/ride-type selection draft-only.
3. Implement explicit user confirmation UI for pickup/drop and booking review; no voice-only confirmation.
4. Add local Playwright mock tests for navigation and review/confirmation UI.
5. Only later, with approval, connect to existing FRIEND RIDE screens and authenticated backend workflows.
