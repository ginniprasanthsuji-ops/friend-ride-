# Phase 13C — Profile Privacy & Ride Participant Contact Function Review

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Scope: Read-only catalog review; no runtime tests.

## Profile RLS catalog
Policies found:
- authenticated users SELECT own profile only (`id=auth.uid()`)
- authenticated users INSERT own profile, role limited to customer/driver/partner
- authenticated users UPDATE own profile, row identity remains self
- admin-only SELECT policy for driver profiles

Profile contains sensitive fields (phone, WhatsApp phone, Aadhaar/license identifiers, vehicle registration, payment identifiers, document paths, profile-photo paths, business coordinates). The own-profile SELECT policy is row-scoped, but field-level API exposure and the admin policy's practical scope need runtime confirmation. Column grants/response projection should be checked before relying on row-level policy alone.

## Participant contact RPC found: road rides only
Catalog contains `fr_road_ride_get_participant_contact(uuid)`, SECURITY DEFINER, empty search_path.
Observed guards:
- login required
- passenger can retrieve driver contact only if booking status is confirmed/boarding/in_progress/dropped/completed/disputed
- driver can retrieve a customer contact only when the ride has participant booking in one of those statuses
- otherwise raises contact-access exception

Potential review issue:
- Driver branch returns a single passenger record using ORDER BY booking.created_at DESC LIMIT 1, even though the ride may have multiple confirmed bookings. Runtime/business review should confirm intended behavior; if the driver needs contacts for all confirmed passengers, the function's current shape appears to return only one.
- Driver contact comes from ride/guest-profile driver phone/name fallback; passenger contact from profile WhatsApp/phone.

## Shared Ride contact requirement gap
Earlier catalog review of shared-ride bookings/rides found participant-scoped booking row policies but no Shared Ride participant-contact RPC in the function-name search. Profile RLS remains own-profile only (plus admin driver-profile policy), so a booking participant may not be able to retrieve the other participant's phone through direct profile read.

Requirement to verify/implement only with approval:
- after booking is confirmed, only that booking's passenger and its driver can see each other's contact details
- contact numbers must not appear in public LIVE listings or to unrelated passengers
- contact visibility should be booking-specific, not broad profile access
- runtime API payload and RPC authorization tests are pending

## Test matrix added
1. Anonymous profile read → deny.
2. Authenticated user reads another user's profile → deny.
3. Admin driver-profile read → verify exact fields and scope.
4. Road-ride participant contact: passenger -> driver only for eligible booking statuses.
5. Road-ride driver contact: verify behavior with multiple confirmed passengers; current catalog definition returns one passenger.
6. Shared Ride confirmed passenger -> assigned driver contact.
7. Shared Ride assigned driver -> only contacts for their confirmed bookings.
8. Shared Ride unconfirmed, cancelled, refunded, unrelated passenger, and LIVE-listing viewer → no contact access.
9. Verify public LIVE API does not return phone/WhatsApp/profile sensitive fields.

## Status
Catalog evidence only; no runtime execution. No schema changes, data mutations, deployments, merges, or production access.
