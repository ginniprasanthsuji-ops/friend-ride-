# Phase 13 — RPC & RLS Targeted Review (continued)

Date: 2026-11-26
Branch: `arjuna-x/phase-13-feature-audit`
Supabase QA project inspected read-only; no SQL changes.

## Targeted SECURITY DEFINER RPC checks

### Positive authorization/ownership checks observed
- `fr_customer_list_nearby_drivers`: requires login, Customer or Admin role, validates coordinates/radius (max 15 km), returns approved online drivers with recent locations (5-minute freshness), capped at 100.
- `fr_get_my_earnings_balance`: filters ledger by `owner_id=auth.uid()`.
- `fr_admin_post_earnings_ledger`: requires admin membership, validates roles/types/status/amount, restricts direct confirmed posting to admin adjustments, idempotency key.
- `fr_laundry_provider_transition` and `fr_tasko_provider_transition`: target booking assigned to current provider and enforce status transitions; TASKO completion validates hours and computes final amount.
- `fr_service_provider_update_request`: requires approved provider ownership and permitted transition.
- `fr_road_ride_get_participant_contact`: requires active/eligible booking or driver participation before returning participant contact.
- `get_ride_customer_details_v2` and `get_ride_driver_details`: scope returned contact/profile fields to assigned driver or ride customer and valid ride statuses.
- `fr_road_ride_save_driver_profile`: verifies caller owns ride; validates phone length, registration, and photo path ownership.

## Privacy / exposure review items (not confirmed vulnerabilities)
1. `fr_customer_list_approved_service_providers` returns provider phone numbers for approved, online providers to authenticated callers. Confirm that customer discovery is intended to expose direct phone numbers before booking.
2. `fr_customer_list_approved_stores_geo` returns store address and exact coordinates for approved partners. Confirm public/customer discovery scope is intentional.
3. `fr_customer_list_nearby_drivers` returns driver UUIDs and live coordinates. Role, approval, online, freshness and radius restrictions observed; verify UI only calls while a customer has an active relevant flow and whether driver identifiers need to be minimized.
4. `fr_public_homepage_feedback` returns only published, homepage-visible feedback, latest 20; intended public exposure appears bounded.

## RLS review observations
- Ride live-location read policy requires participant relationship. Insert policy binds user_id to caller and ride participant.
- Driver-location ALL policy binds driver_id to caller and only allows online state for approved driver.
- Service-booking SELECT policy scopes to customer, assigned provider, or admin; admin UPDATE requires admin membership.
- Service-request SELECT policy scopes customer, provider owner, or admin; customer INSERT requires own user, requested status and unassigned provider.
- Provider SELECT policy allows approved rows, owner rows, or admin. Admin manage policy requires admin membership.
- Feedback insert policy binds caller and initializes hidden/new with no admin note; admin update requires admin membership.
- SOS read policy scopes to sender or admin; insert binds sender to caller.

## Limits
Static SQL definition and policy inspection only. No role-based live API test, exploit test, or runtime transaction test executed. Advisor warnings remain warnings, not confirmed defects. No database changes made. Main/Production untouched.
