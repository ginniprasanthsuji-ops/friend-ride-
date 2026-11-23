# Phase 7 — Ride Creation Write-Path Security Audit (R3)

Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Source: `index.html` static review only.
No SQL, database/storage writes, migration, production/main changes, or authenticated runtime tests were performed.

## Confirmed frontend ride-creation behavior

Function: `saveRideRequest()`

- Requires a logged-in user and frontend profile role `customer`.
- Requires pickup and drop text.
- Converts fare input to a number and rejects non-finite or non-positive fare.
- Adds `customer_id=currentUser.id`, vehicle type, pickup/drop text, fare, notes, and requested status.
- Adds pickup coordinates if parsed by `frParsePickupCoords()`.
- Performs direct `rides.insert(row)` and returns `id,status`.
- On success, sets active ride ID, displays tracking page and refreshes nearby-driver list using the `fr_customer_list_nearby_drivers` RPC.

## Authorization/security boundary

Frontend role/session checks are UX-only. The database must enforce the customer identity, role eligibility, allowed insert columns, defaults and state.

### Risks / required backend assertions

1. `customer_id` must be bound to `auth.uid()`; reject forged customer IDs.
2. Only eligible customer accounts may create ride requests; prevent driver/partner/admin role inserts even if they call REST directly.
3. Client must not set privileged ride fields such as assigned driver, payment state, completion/start timestamps, approval flags, cancellation authority or admin fields.
4. `status` should be server-defaulted or strictly constrained to initial `requested` state; reject other client statuses.
5. Fare must be finite, positive, and bounded by configured policy; client-side check alone is insufficient.
6. Vehicle type must be an allowlist; reject arbitrary values.
7. Pickup/drop must be nonempty and length-bounded; notes should be bounded and safely treated as text.
8. Coordinates must be finite and within latitude/longitude bounds; if coordinates are absent, backend should allow only the intended address-only booking mode.
9. Ensure customer can read only their own rides and permitted participant details; driver access should be limited to eligible/approved drivers and eligible ride lifecycle.
10. Prevent duplicate/abuse submissions using server-side idempotency/rate-limit policy if supported.
11. Verify ride status transitions are RPC/server-controlled; no direct client update can assign a driver, start, complete, cancel, or alter payment.
12. Nearby-driver lookup must not expose full driver data or broad location history; validate radius and rate-limit.
13. Ensure ride creation never bypasses admin/driver approval rules or exposes private profile/KYC fields.

## Required isolated QA matrix

| Case | Expected result |
|---|---|
| Anonymous insert | Reject |
| Non-customer role insert | Reject |
| Customer inserts with forged customer_id | Reject |
| Customer inserts driver_id/assigned fields | Reject |
| Customer inserts non-requested status | Reject |
| Invalid vehicle type | Reject |
| Fare 0, negative, NaN/Infinity, over-policy | Reject |
| Valid positive fare within configured bounds | Allow |
| Invalid/out-of-range coordinates | Reject |
| Empty/oversized pickup/drop/notes | Reject or validated policy outcome |
| Customer reads another customer's ride | Reject |
| Unapproved driver reads/accepts ride | Reject |
| Driver tries to update assignment/start/completion/payment directly | Reject |
| Duplicate request replay | Idempotent or policy-limited |
| Valid customer request | Persist requested ride; participant-only visibility |

## Remediation recommendation

- Reconcile actual table columns, constraints, grants, RLS and existing ride RPCs from migrations and deployed isolated QA schema.
- Prefer a validated `fr_customer_create_ride_request` RPC with UID-derived customer, allowlisted vehicle, bounded fare, validated coordinates/text and server-controlled initial state.
- If the existing direct insert is retained, use strict RLS plus column-level grants/check constraints; do not grant broad insert.
- Do not author/apply a migration until schema and migration history are complete and isolated QA test evidence is available.

## Evidence boundary

This is a static source audit. It does not prove live RLS, constraints, RPC authorization or runtime booking behavior.