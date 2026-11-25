# Phase 13 — Frontend RRS Integration Check & Passenger RLS Correction Draft

Branch: `arjuna-x/phase-13-feature-audit`
QA only; Production/Main untouched.

## Frontend inspection
The current feature-branch root `index.html` was inspected (large single-page app). Search for RRS-specific tokens (`roadRide`, `road_ride`, `Road Ride`, `RRS`, `Guest Bike`, `guestDriver`) returned no occurrences in this file. The Phase 13 feature directory contains ERS UI prototype and referral files, but no combined ERS/RRS live station integration.
This indicates the combined station/RRS UI is not currently integrated into the inspected main SPA. It does not rule out separate branch/page implementations outside this file.

## RRS passenger read policy suspected defect
Earlier QA policy inspection identified the booking correlation as:
`b.ride_id = b.id`
This compares booking ride_id against booking primary key and is likely incorrect. The intended correlation should compare the booking's ride_id to the outer road-ride row ID.

### Draft correction only — NOT applied
Candidate expression (must verify policy table/alias and full policy first):
`EXISTS (SELECT 1 FROM public.fr_road_ride_bookings b WHERE b.ride_id = fr_road_rides.id AND b.passenger_id = auth.uid())`

Before applying:
1. Inspect full current policy definition and table alias context.
2. Test with isolated QA passenger + guest ride owner + booking.
3. Verify passenger can SELECT their booked ride when status is no longer live.
4. Verify unrelated passengers cannot SELECT that ride.
5. Verify live listing and ride-owner visibility still work.
6. Apply as a narrow QA-only policy replacement only after validation and rollback plan.

## Integration decision
Do not merge ERS/RRS tables. RRS frontend integration is absent from the inspected root SPA, so combined station should be a new isolated Phase 13 module, then wired via a controlled dashboard entry point.
Use source-tagged records:
- ERS Registered (approved, authenticated driver; active availability only)
- RRS Guest (guest bike listing only)
Filters: ALL / ERS / RRS.
No demo records shown as live. Do not expose phone, private photo storage path, or exact private coordinates in public listings.

## Next step
Create an isolated combined-station UI module with a clear backend adapter contract and disabled/error states until real source RPCs are wired. Then perform server-side ERS eligibility and RRS listing authorization audit before building booking actions.
