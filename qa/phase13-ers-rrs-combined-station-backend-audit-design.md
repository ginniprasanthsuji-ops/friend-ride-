# Phase 13 — ERS + RRS Combined Live Station: Backend Source Audit & Design

Branch: `arjuna-x/phase-13-feature-audit`
QA Supabase project: `pqsangtvietawkfgpgfu`
Audit: read-only table/schema inspection. No database changes made.

## 1. ERS source
Existing `public.rides` table:
- Vehicle categories: Auto, Bike, Car.
- Ride status values: requested, accepted, counter_offered, confirmed, ongoing, completed, cancelled.
- Customer and assigned driver UUIDs; pickup/drop text and coordinates; fare offer/agreed fare.
- RLS enabled.
Registered driver source: `public.profiles` (role, driver approval, vehicle fields, profile photo/vehicle number) and `public.driver_locations` (online, last location timestamp).

ERS limitations found in earlier RPC audit: generic nearby-driver endpoint does not exclude busy drivers and doesn't return safe profile/vehicle listing fields or atomic booking selection. ERS backend/listing remains pending.

## 2. RRS source (schema observed)
- `public.fr_road_rides`: guest/road ride listings, route labels and optional coordinates, departure/cutoff timestamps, pickup radius, fare, statuses live/booked/departed/in_progress/completed/cancelled/expired; guest driver display name, phone, photo path, bike registration and phone_verified flag; RLS enabled.
- `public.fr_road_ride_bookings`: booking rows with passenger_id, pickup/drop labels, fare snapshot and statuses booking_pending/confirmed/driver_arrived/boarded/in_progress/dropped/completed/cancelled/no_show/disputed/refund_pending/refunded; RLS enabled.
- `public.fr_road_ride_guest_profiles`: guest driver contact/profile details (phone, photo path, bike registration, display name); RLS enabled.
- `public.fr_road_ride_events`: ride/booking event records; RLS enabled.
The schema inspection confirms the RRS data structures exist. It does NOT prove that live RPCs, UI integration, permissions, or runtime flows pass.

## 3. Combined station architecture
Avoid physically merging ERS and RRS tables. Use a combined read/listing RPC or UI aggregation with a normalized, source-tagged response:
- source/channel: ERS_REGISTERED or RRS_GUEST
- source record id and source-specific booking/ride id
- display status mapped to a shared customer-facing status, while retaining original source status
- vehicle category (ERS Bike/Auto/Car; RRS Guest Bike only)
- safe display name/photo and masked vehicle registration where policy permits
- route/pickup summary and time/availability fields
- no public phone or precise private driver coordinates
- listing/booking eligibility flag grounded in server-side conditions

## 4. Customer filters and status
Filters: ALL, ERS, RRS.
ALL combines only current backend-confirmed eligible ERS listings/requests and current RRS live rides/bookings. ERS and RRS filters isolate their source.
Customer-facing status mapping should be source-aware:
- Available/live
- Request/booking pending
- Accepted/confirmed
- Driver approaching / pickup
- Ongoing
- Completed
- Cancelled/expired (history or non-active status as appropriate)
Do not invent transitions or rewrite source statuses.

## 5. Separation, permissions, privacy
- ERS only authenticated registered customers and registered/approved drivers.
- RRS guest driver rides stay in RRS; guest driver must not be treated as ERS registered profile.
- Customer's own bookings/requests visible to that customer; public listings show only permitted fields.
- Reveal phone and more exact location only under existing authorized booking/matching rules.
- Server-side RPC authorization and RLS must be reviewed before integration.

## 6. Next implementation tasks (QA only)
1. Inspect RRS RPC/function definitions and RLS policies for list/book/accept/status flows (read-only).
2. Design source-specific listing RPCs or a single combined RPC with safe output. Prefer source-specific RPCs plus client aggregation if permissions/lifecycles differ.
3. Add a QA combined station prototype that consumes real data only when backend calls are wired; label any mock fixtures as DEMO.
4. Test ERS and RRS separately, then combined ALL/ERS/RRS filters and status mapping.
5. Capture evidence. No production deployment without Phase 14 and explicit user approval.

## Status
Schema audit documented. Combined listing implementation, RPC security review, UI integration, and runtime QA remain pending. No SQL applied.
