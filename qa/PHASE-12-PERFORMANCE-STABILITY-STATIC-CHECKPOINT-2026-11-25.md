# Phase 12 — Performance & Stability Static Checkpoint (2026-11-25)

QA Supabase: pqsangtvietawkfgpgfu
Method: Read-only catalog review of indexes, relation size estimates, and fee/coupon/offer/platform-named functions.
Production untouched. No SQL changes.

## 1. Index snapshot (reviewed key tables)
Valid indexes observed:
- rides: primary key(id), customer_id + created_at DESC, driver_id + created_at DESC, status + created_at DESC.
- driver_locations: primary key(driver_id), is_online + updated_at.
- ride_live_locations: primary key(ride_id,user_id), ride_id + updated_at.
- profiles: primary key(id) only in this snapshot.
- fr_app_notifications: primary key(id), user_id + created_at DESC.
- fr_ride_notifications: primary key(id), user_id + created_at DESC.
- fr_notification_tokens: primary key(id), unique token, user_id + is_active.
- fr_service_requests: primary key(id), unique request_number, customer_id + created_at DESC, provider_id + status.
- fr_service_bookings: primary key(id) only.
- fr_ride_sos: primary key(id) only.
All indexes returned valid=true.

## 2. QA relation-size/row estimates
Catalog returned relation-size metadata. Estimated rows were -1 and table storage 0 bytes for these listed tables in this snapshot. This suggests the QA tables may be empty/un-analyzed, but it is not proof of exact row counts. Therefore production-scale performance cannot be evaluated from this snapshot.

## 3. Potential performance coverage gaps
- Profiles has only primary-key index in observed list; review app queries for role/approval/phone lookups before recommending indexes.
- fr_service_bookings and fr_ride_sos only primary-key indexes in observed list; query patterns unknown.
- Driver location index supports online/updated filtering, but no query plans or load tests run.
- ride_live_locations has ride_id+updated_at index and composite PK, supporting ride lookup patterns; actual query plan unverified.
- Ride indexes support customer/driver history and status/time filtering; no EXPLAIN/load test executed.

## 4. Fee/coupon/offers function search
Catalog search for public functions named with fee/coupon/offer/platform found no dedicated fee/coupon/platform function. This is a name-based search only and does not establish absence of business logic elsewhere (tables, triggers, client source, or differently named RPCs).

Functions reviewed in the search result:
- accept_counter_offer: customer ownership check; conditional state update.
- counter_offer_ride: approved driver check; positive fare; active ride guard; conditional claim of unassigned requested ride.
- decline_counter_offer: customer ownership; conditional state reset.
- fr_public_homepage_feedback: published-feedback filter, homepage flag, top 20.

No runtime workflow or concurrent race tests were executed.

## 5. Next required tests
- Load/benchmark ride request, driver discovery, accept/counter-offer, cancellation, live location update.
- Validate indexes using representative EXPLAIN (ANALYZE) only in disposable QA data.
- Check concurrent accept/counter-offer for duplicate assignment.
- Verify fee calculation against user-approved tariff cases; implementation/source mapping needed.
- Coupon sale/redemption, store recognition, direct payment and platform fee workflows need source and test data coverage.
- Notification list queries, token lookup and service request dashboard queries require representative query plans.

## Status
Static catalog review: performed.
Runtime tests/load tests: not run.
Fee/coupon source mapping: incomplete.
SQL changes: 0.
Production: untouched.
