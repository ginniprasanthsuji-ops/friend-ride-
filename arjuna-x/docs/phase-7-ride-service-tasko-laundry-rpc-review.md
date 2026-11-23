# Phase 7 — Ride, Service, TASKO & Laundry RPC Source Review

## Ride workflow positive controls
- `accept_ride`: requires authenticated approved driver, checks for active ride, then atomically updates only unassigned/requested ride.
- `counter_offer_ride`: approved driver; fare > 0; active ride check; update only unassigned/requested ride; sets counter-offered state.
- `accept_counter_offer` / `decline_counter_offer`: authenticated customer ownership, counter_offered status, driver presence (accept also agreed_fare non-null); transitions to accepted or resets request.
- `fr_driver_start_ride`: approved driver and assigned ride in accepted state; transition to ongoing; sends customer notification.
- `fr_driver_complete_ride`: approved driver, assigned ride in ongoing state; marks completed, deletes live location, sends customer notification.

## Ride follow-up risks/tests
- Driver active-ride check in accept/counter-offer is separate from ride assignment update. Concurrent attempts by same driver could potentially pass both checks; evaluate a per-driver locking/constraint design and test concurrent assignment using disposable QA records.
- Counter-offer fare only validates positive numeric; no upper bound or fare policy guard is visible in this function. Validate expected fare limits/rounding and add server-side policy if applicable.
- Ride lifecycle test matrix: approved vs pending driver; existing active ride; two concurrent accept/counter calls; wrong ride owner accepting/declining counter; start from requested/counter-offered; completion before ongoing; repeated start/complete; notification and live-location cleanup.

## Customer service request
- Requires auth profile role customer.
- Active category slug; address length 8–1000; work details 3–2000; future/current date and time.
- Optional provider must match category, be approved and online.
- Request inserted as requested with customer identity/phone.
- Test boundary dates, whitespace/length, provider unavailable/category mismatch, cross-role caller, and duplicate submission handling.

## Provider update request
- Requires authenticated approved provider owner.
- Provider ownership and approved status checked against request provider_id.
- State allowlist: assigned→accepted/rejected; accepted→in_progress; in_progress→completed.
- Test owner mismatch, provider revoked between request and update, invalid/repeated transitions, concurrent updates.

## TASKO
- Assigned booking ownership checked and row locked FOR UPDATE.
- accept: assigned→accepted; start: accepted→in_progress; complete: in_progress→completed.
- Completion requires actual_hours > 0 and <=24. Up to 6 hours: approved quote must be $150–$400 equivalent in current code's numeric currency convention; above 6 hours: formula 400 + (hours-6)*50; payment_status becomes pending.
- Confirm base quote, max hours, rounding, and currency units match product spec. Add boundaries 0, 0.01, 6, 6.01, 24, >24 and missing quote.

## Laundry
- Assigned provider check plus row lock FOR UPDATE.
- accept: assigned→accepted; start: accepted→in_progress; complete: in_progress→completed.
- Reject invalid actions/status and unauthorized provider.
- Test role/ownership, status boundaries, repeated transitions, and concurrency.

## Status
Static QA source review only. No RPCs invoked and no runtime mutations. QA test records currently empty; controlled tests require approval.