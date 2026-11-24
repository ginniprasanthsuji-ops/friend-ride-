# Phase 7 — Live GPS & SOS Write-Path Audit (R4)

Branch: `arjuna-x/phase-7-ai-intelligence-safety`
Source reviewed: `index.html` only, static source inspection.
No SQL, database/storage writes, migrations, production/main changes, or authenticated runtime tests.

## Driver GPS source behavior

- `startDriverLiveTracking(rideId)` frontend guards current session and profile role `driver`.
- Obtains device coordinates through browser Geolocation.
- Direct upsert to `driver_locations` includes `driver_id=currentUser.id`, coordinates, online flag and timestamp.
- Direct upsert to `ride_live_locations` includes supplied `rideId`, `user_id=currentUser.id`, coordinates and timestamp.
- Repeats every 10 seconds while page is visible and user remains driver.
- Source does not show a server-side ride participant/driver assignment lookup before the ride-live-location upsert in this function.

## Customer GPS source behavior

- `startCustomerLiveTracking(rideId)` requires customer role.
- Reads ride by both ride ID and `customer_id=currentUser.id`.
- Requires an assigned driver and status passing `frCustomerTrackingStatusAllowed`.
- Writes customer coordinates to `ride_live_locations` with current UID.
- Repeats every 10 seconds while visible and logged-in customer.
- These client checks are useful UX gates but RLS must independently enforce ride ownership/participant and lifecycle.

## SOS source behavior

- `sendRideSOS()` requires login and gets current GPS.
- Inserts into `fr_ride_sos` with `ride_id=frActiveRideId||null`, `sender_id=currentUser.id`, coordinates and a fixed message.
- Offers to call emergency number 112 after successful insert.
- Frontend does not visibly validate that a non-null ride ID is owned by or assigned to the sender before insert; database policy/RPC must bind sender UID and ride participation.
- Sender ID must be server-derived or checked against `auth.uid()`; never trusted as a client field.

## Authorization / validation risks and requirements

1. Bind all `driver_id` and `user_id` values to `auth.uid()`; reject spoofed UID.
2. Driver online/location writes only for approved drivers, and ensure offline state cannot create a null/invalid GPS row.
3. Validate latitude/longitude as finite and within [-90,90]/[-180,180], reject invalid timestamps and stale/replayed updates as policy requires.
4. `ride_live_locations` writes require current ride participant (customer or assigned driver), eligible active ride state, and UID binding. Prevent arbitrary ride IDs.
5. Driver writes must be tied to an active assigned ride; role alone is insufficient.
6. Customer writes require owned ride and assigned driver/eligible state; the existing read-before-write check must be backed by RLS/RPC.
7. Reads should expose only current ride participants' latest location, not location history or unrelated users; nearby-driver RPC must minimize fields and validate radius.
8. SOS requires sender UID binding, coordinate validation, participant authorization when ride ID is supplied, bounded message, duplicate/rate controls and server-side alert/delivery logging.
9. Anonymous SOS/standalone location policy must be explicit. If ride_id is null, verify whether emergency SOS is intentionally allowed for any authenticated user and how abuse is limited.
10. Location retention/deletion, emergency access auditing, consent and notification delivery should be documented and tested.
11. Client timers stop/continue based on visibility and role; verify server-side stale-location handling and ride completion cleanup.

## Isolated QA matrix

| Test | Expected |
|---|---|
| Anonymous location write | Reject |
| User writes driver/user ID of another UID | Reject |
| Unapproved driver updates online state/location | Reject |
| Driver updates unrelated ride location | Reject |
| Driver writes assigned active ride location | Allow |
| Driver writes completed/cancelled ride location | Reject |
| Customer writes location to another customer's ride | Reject |
| Customer writes owned ride with no driver/invalid state | Reject |
| Participant writes valid bounded GPS | Allow |
| Invalid/out-of-range GPS | Reject |
| Nearby-driver RPC radius outside permitted bounds | Reject/normalize per policy |
| Nearby-driver RPC reveals private profile/KYC fields | Reject |
| SOS with forged sender UID | Reject |
| SOS with unrelated ride ID | Reject |
| SOS with valid participant ride and GPS | Allow; alert delivery independently verified |
| SOS without ride ID | Explicit policy result; rate-limited |
| Location read by nonparticipant | Reject |
| Completed ride location remains accessible beyond retention | Verify expected cleanup policy |

## Remediation sequence

- Reconcile `driver_locations`, `ride_live_locations`, `fr_ride_sos` table columns, grants, policies and RPCs against full migrations and isolated QA schema.
- Inspect approved-driver eligibility and active ride lifecycle helper/RPCs.
- Prefer UID-derived validated RPCs for live GPS and SOS, or strict RLS/check constraints with narrow column grants.
- Test with two fake authenticated users (customer and approved driver), an unapproved driver, and unrelated user in isolated QA.
- Do not prepare/apply a migration from this static evidence alone.

## Evidence boundary

Source call sites and client guards are documented; deployed RLS, data exposure, SOS alert delivery, two-device GPS, and runtime authorization remain unverified.