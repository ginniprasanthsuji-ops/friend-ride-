# Phase 13C — Ride Contact Privacy & Role Scope Catalog Review

Date: 2026-11-26
Environment: QA Supabase `pqsangtvietawkfgpgfu`
Mode: Read-only catalog/function-definition review. No runtime calls and no data mutation.

## Ride contact functions
### `get_ride_customer_details_v2`
- Requires authenticated caller.
- Returns customer phone/profile photo only when caller is the assigned ride driver (`r.driver_id=auth.uid()`) and ride status is in accepted/confirmed/ongoing/in_progress/started/completed.
- Catalog-level positive ownership gate; runtime cross-driver negative test pending.

### `get_ride_driver_details`
- Requires authenticated caller.
- Returns driver contact/vehicle/photo only when caller is ride customer (`r.customer_id=auth.uid()`) and ride status is in accepted/confirmed/ongoing/in_progress/started/completed.
- Catalog-level positive ownership gate; runtime cross-customer negative test pending.

### `fr_road_ride_get_participant_contact`
- Requires authenticated caller.
- Passenger path checks a booking for the caller on the target ride in confirmed/boarding/in_progress/dropped/completed/disputed states before returning driver contact.
- Driver path checks caller is ride driver and has at least one qualifying booking, then returns one passenger contact using latest booking order and LIMIT 1.
- Important design observation: driver-side result is limited to one passenger contact. For rides with multiple confirmed passengers, verify whether UI needs all eligible passenger contacts or a single contact by intended design. Privacy scope appears ride/participant gated in definition; runtime test pending.

## Customer discovery RPC role scope
- `fr_customer_list_approved_service_providers`: SECURITY DEFINER, authenticated EXECUTE; returns phone for approved online providers. Function definition has no explicit auth.uid() or role gate. Review intended exposure and test non-customer role access.
- `fr_customer_list_approved_stores_geo`: returns approved partner business name/category/address/coordinates; no explicit role gate in definition. Validate expected public/authenticated scope.
- `fr_customer_list_nearby_drivers`: explicit login plus customer-or-admin check; coordinate/radius validation and max 15 km radius.

## Runtime negative-test checklist additions
1. Customer A calls driver-details RPC for Ride B belonging to Customer B: must return no rows.
2. Driver A calls customer-details RPC for Ride B assigned to Driver B: must return no rows.
3. Unconfirmed/cancelled passenger calls road-ride participant contact: must fail.
4. Non-participant authenticated user calls road-ride participant contact: must fail.
5. Passenger of Ride A tries Ride B contact lookup: must fail.
6. Driver with multiple passengers: verify contact-return cardinality matches intended workflow.
7. Non-customer authenticated role calls provider discovery RPC: confirm approved phone visibility is intended or deny.
8. Unauthenticated caller attempts each contact/discovery RPC; expected access must match product privacy rules.

## Status
Read-only catalog review completed. Runtime negative tests remain pending. No security certification claimed.
