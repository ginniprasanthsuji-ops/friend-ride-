# Phase 13D QA — Participant phone/contact RPC privacy review (2026-11-26)

## Scope
- QA project only: `pqsangtvietawkfgpgfu`.
- Read-only catalog/static review.
- Production/Main untouched; no writes/migrations.
- Runtime tests and role impersonation not performed.

## RPCs inspected
1. `fr_road_ride_get_participant_contact(p_ride_id)`
   - SECURITY DEFINER, empty search_path.
   - Requires authenticated UID.
   - Passenger branch checks an active/confirmed participant booking status before returning driver phone/name.
   - Driver branch requires a booking in the eligible statuses, then returns customer phone/name.
   - Driver branch currently returns only one passenger record (`ORDER BY created_at DESC LIMIT 1`) for a ride, rather than an explicitly selected booking/passenger. For multi-passenger rides, this is a UX/data-selection limitation and should be reviewed against intended behavior.
   - Both branches include completed/disputed/dropped statuses; contact visibility after ride completion may be broader in time than necessary. Confirm retention/visibility policy.

2. `get_ride_customer_details_v2(p_ride_id)`
   - SECURITY DEFINER, empty search_path.
   - Auth required; returns customer contact/photo only when the caller owns the driver side of the ride, customer role is customer, and ride status is accepted/confirmed/ongoing/in_progress/started/completed.
   - Static owner guard present. Completed rides remain eligible.

3. `get_ride_driver_details(p_ride_id)`
   - SECURITY DEFINER, empty search_path.
   - Auth required; returns driver contact/vehicle/photo only for the ride's customer owner and eligible status accepted/confirmed/ongoing/in_progress/started/completed.
   - Static customer ownership guard present. Completed rides remain eligible.

## ACL snapshot
- Authenticated EXECUTE present for all three functions.
- Catalog ACL does not show anon EXECUTE.
- Runtime access-denial checks were not run.

## Recommendations
- Confirm desired post-trip contact visibility; if contacts should be hidden after completion, narrow allowed statuses.
- For multi-passenger Road Ride contact retrieval, expose selected booking/passenger ID or return the authorized passenger list instead of choosing the newest passenger silently.
- Test nonparticipant, unconfirmed booking, cancelled booking, passenger, ride-owner driver, and post-completion access with runtime authenticated sessions before declaring privacy verification complete.

## Frozen tracking
- Phase 13C: 91% frozen.
- Planning/Checklist: 88% frozen.
- Overall Audit: 12% frozen.
- Progress graph: frozen.
- Phase 13D: active; this sub-review's static checks completed (100% of this scoped review only), overall 13D percentage not yet established.
