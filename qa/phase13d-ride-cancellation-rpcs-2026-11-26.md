# Phase 13D Ride Cancellation RPCs
Applied in QA Supabase project pqsangtvietawkfgpgfu only.

## RPCs added
- fr_road_ride_cancel_booking(booking_id): passenger-owned pending/confirmed booking cancellation, before departure, row locks, ride status reopens to live, event log.
- fr_road_ride_driver_cancel(ride_id): owner driver cancels live/booked ride before departure, cancels pending/confirmed bookings, event log.
- fr_shared_ride_cancel_booking(booking_id): passenger-owned pending/confirmed/cancel_requested cancellation before departure, restores booked seats, reopens full ride to live, event log.
- fr_shared_ride_driver_cancel(ride_id): owner driver cancels live/full ride before departure, cancels eligible bookings, booked seats reset, event log.

## Safety
All RPCs require authenticated caller and enforce passenger/driver ownership. SECURITY DEFINER with empty search_path. Execute granted authenticated only; PUBLIC/anon revoked. No refund automation: event/result explicitly flags refund_review_required=true and automatic_refund=false. Payments must be manually reviewed; cancellation is not falsely represented as refund completed.

## Verification
Catalog check confirms all four functions exist, SECURITY DEFINER, empty search_path, authenticated EXECUTE true, anon/public EXECUTE false. Static verification only. No runtime identity tests, fixture mutations, or frontend wiring yet. Production untouched.
