# Phase 13D QA — Road Ride Participant Contact Privacy Audit (2026-11-26)

## Scope
Read-only QA Supabase catalog review of `fr_road_ride_get_participant_contact(p_ride_id uuid)`, booking/ride RLS and relevant schema. No function execution, SQL writes, user data access, or Main/Production changes.

## Contact RPC static findings
- Function is SECURITY DEFINER with empty search_path.
- EXECUTE ACL includes authenticated and service_role (plus owner).
- Requires auth.uid() not null.
- Passenger branch requires passenger booking for the ride in status confirmed, boarding, in_progress, dropped, completed, or disputed; returns driver contact.
- Driver branch requires ride driver is auth.uid() and at least one participant booking in the same eligible statuses; returns passenger contact for an eligible customer booking.
- Otherwise raises: Contact details are available only to confirmed ride participants.
- Contact visibility is scoped to ride ID and participant role. Static logic aligns with the confirmed-participant-only requirement.

## RLS catalog
- `fr_road_ride_bookings`: authenticated SELECT policy passenger-owned OR `fr_road_ride_is_driver(ride_id)`.
- `fr_road_rides`: authenticated SELECT policy live OR owner-driver OR `fr_road_ride_is_passenger(id)`.
- RLS enabled was previously confirmed on both; FORCE RLS false.
- Public LIVE listing is governed by ride SELECT policy; the contact RPC is a separate participant-gated path. Static review does not establish that frontend LIVE cards omit phone fields; inspect frontend rendering separately.

## Risks / limits
- Static policy and function checks only; no impersonation or runtime RPC test performed.
- Function returns only one passenger contact (latest eligible booking) when called by driver; shared rides with multiple confirmed passengers need UX/business requirement confirmation whether driver should receive all participant contacts or one contact.
- Frontend LIVE listing contact-field leakage not checked in this pass.
- Phone data comes from ride stored driver fields/guest profile and passenger profiles; data consistency and masking not runtime verified.

## Conclusion
Static authorization guard appears correctly restricted to authenticated confirmed participants, with ride/role checks. Remaining verification: inspect LIVE UI payload/rendering for phone exposure and runtime cross-user denial tests.

## Frozen tracking
Phase 13C 91%; Planning/Checklist 88%; Overall Audit 12%; graph frozen. QA branch only.
