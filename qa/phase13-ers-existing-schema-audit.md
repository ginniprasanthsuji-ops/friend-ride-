# Phase 13 — ERS Existing QA Database Audit

Date: 2026-11-25
Project: QA Supabase `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Audit type: Read-only schema inspection. No database changes performed.

## Existing reusable schema found
- `public.rides`: customer_id, driver_id, vehicle_type (Auto/Bike/Car), pickup/drop text and coordinates, fare_offer, agreed_fare, status, notes, created/updated timestamps.
- `public.profiles`: role, driver approval status, vehicle type/company/model/registration, driver profile photo path, vehicle number fields and other profile fields.
- `public.driver_locations`: driver_id, latitude/longitude, is_online, updated_at.
- RLS is enabled on these tables.

## ERS gaps / decisions before integration
1. Existing `rides` table supports core ride request lifecycle but does not have a dedicated payment-method field (Cash/UPI) in the inspected column list.
2. The `driver_locations` table provides online state and last location; it does not itself prove a driver is free for ERS assignment. Availability must be checked against active ride rows and driver approval.
3. No dedicated ERS source/mode marker was identified in the inspected rides schema. ERS and ordinary ride requests must be distinguishable without breaking existing flows.
4. No live vehicle listing endpoint/RPC was verified during this read-only audit.
5. UI prototype uses demo vehicle records and clearly warns they are not live backend data.

## Recommended safe next step
Create a narrowly scoped ERS migration on QA only after reviewing current `rides` RLS policies, status transitions, and existing ride RPCs. Reuse the rides table if compatibility is confirmed; add the minimal ERS discriminator/payment metadata only if required. Implement atomic driver availability validation and authenticated-customer booking with server-side authorization. Then test in a browser.

## Audit result
Schema discovery completed; ERS backend implementation is **not** yet completed or runtime-tested. Production/Main untouched.
