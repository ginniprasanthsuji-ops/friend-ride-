# Phase 12 — RPC Query Performance Static Review (2026-11-25)

QA project only: pqsangtvietawkfgpgfu. Read-only source/index metadata review. No row data or production queried.

## Functions examined
- fr_customer_list_nearby_drivers(lat,lng,radius)
- get_driver_requests()
- admin_list_driver_applications()
- admin_list_driver_documents()
- fr_notification_claim_batch(token,limit)
- fr_customer_create_service_request(...)
- fr_service_provider_update_request(...)
- accept_ride / counter_offer_ride / accept_counter_offer / decline_counter_offer
- fr_driver_start_ride / fr_driver_complete_ride
- get_ride_customer_details_v2 / get_ride_driver_details

## Performance observations
1. Nearby-driver RPC computes Haversine-style distance expression for candidate rows, then filters and orders by updated_at, with limit 100. Existing driver_locations index (is_online, updated_at) can reduce candidate set for online/fresh location predicates, but no spatial/geographic index is present. At scale, distance math may remain expensive. No query plan/load test was run.
2. get_driver_requests filters rides by status='requested' and driver_id IS NULL, orders created_at DESC. Existing rides_status_created_idx covers status/order; NULL driver filter is not specifically covered by a partial index in the observed index list. Potential optimization candidate only, not recommendation until query plans are checked.
3. Notification batch claim uses FOR UPDATE SKIP LOCKED, bounded limit (max 50), and status/created_at index exists. Static design supports parallel workers without duplicate row-lock claiming; runtime throughput and stale-claim behavior untested.
4. Notification events have user_created index for user history and claim/status indexes for queue selection.
5. admin_list_driver_applications filters role='driver', orders by full_name; profiles snapshot has only PK index. Potential full scan/sort at scale. Review EXPLAIN and application query usage before index recommendation.
6. admin_list_driver_documents joins profiles and orders by created_at DESC; fr_driver_documents snapshot lacks created_at index. Potential sort/scan for large document volume.
7. fr_service_requests has customer created-desc and provider/status indexes; these align with observed customer/provider filters.
8. fr_service_providers snapshot only primary-key index; provider availability/category queries may need indexes but exact query plans and table columns/patterns are required before any change.

## Suggested P2 follow-up (not implemented)
- Capture EXPLAIN (ANALYZE, BUFFERS) for nearby-driver RPC and driver request queue with synthetic QA data.
- Consider spatial/geographic index strategy only if allowed within SQL-only/Supabase constraint and workload supports it; no index change proposed here.
- Evaluate role/full_name index for admin application list and created_at index for admin documents based on query plans.
- Confirm stale notification claim recovery under repeated failures.
- Keep indexes targeted; no speculative index additions.

## Status
Static RPC/query review: completed.
Runtime plans/benchmarks: not run.
SQL changes: 0.
Production: untouched.
