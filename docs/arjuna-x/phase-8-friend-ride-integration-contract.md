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
