# Phase 13B — Public Module ACL/RLS Catalog Snapshot (QA, Read-only)

Date: 2026-11-26
Project: QA Supabase `pqsangtvietawkfgpgfu`
Scope: Public-schema table catalog excluding the four Shared Ride tables. Catalog metadata only; no row contents were read. No SQL writes or policy/grant changes were performed.

## Snapshot findings
- All catalogued tables reported RLS enabled; none reported FORCE RLS.
- Most tables have authenticated policies, but several have policy command scope narrower than the effective table-level grants.
- Anon table-level grants with write/admin privilege flags were observed on referral-related tables, road-ride tables, campaign tables, and referral-code tables. The catalog query is a privilege inventory; it does not prove access to rows because RLS and policy predicates remain relevant.
- Authenticated grants include DELETE/TRUNCATE on many tables even when policies list only SELECT, INSERT, UPDATE, or no DELETE policy. These privileges should be reviewed module-by-module, especially where data is operational, personal, or financial.
- Admin, driver-location, emergency-contact, notification, bank-enquiry, driver-document, service-provider, profile, ride, live-location, SOS, and referral modules surfaced for follow-up.

## Highest-priority follow-up modules
1. **Road Ride**: `fr_road_ride_bookings`, `fr_road_ride_events`, `fr_road_ride_guest_profiles`, `fr_road_rides` — anon broad grants observed; check view exposure, guest data, write pathways, and policy predicates.
2. **Referrals / Rewards**: `fr_referral_codes`, `fr_customer_referral_codes`, `fr_customer_referrals`, `fr_referrals`, `fr_customer_referral_reward_ledger`, `fr_customer_reward_ledger` — broad anon grants (including some write/admin privilege flags) observed; verify intended public code lookup versus protected reward/ledger data and authenticated-only flows.
3. **Campaigns**: `fr_store_campaigns` — anon and authenticated broad grants observed; one policy includes anon/authenticated roles; validate campaign public read requirements and mutation controls.
4. **Sensitive user/operations data**: `profiles`, `driver_locations`, `ride_live_locations`, `fr_ride_sos`, `fr_emergency_contacts`, `fr_driver_documents`, `fr_bank_enquiries`, `admin_users` — inspect column-level exposure, policy predicates, and direct DML necessity.
5. **Service module**: `fr_service_bookings`, `fr_service_categories`, `fr_service_provider_applications`, `fr_service_providers`, `fr_service_requests` — check owner/admin/provider boundaries and whether broad authenticated DML grants are required.
6. **Notifications**: `fr_app_notifications`, `fr_ride_notifications`, `fr_notification_events`, `fr_notification_preferences`, `fr_notification_tokens`, `fr_push_subscriptions` — verify token ownership, update-only status paths, and event write controls.

## Limits
- Catalog-only: no RLS policy predicate semantics were evaluated in this snapshot.
- No data was queried from the listed tables.
- Broad grants alone do not establish exploitability or data disclosure.
- No remediation was applied. Global default ACL changes remain deferred because they can affect future objects and unrelated modules.

## Next audit step
Proceed module-by-module, starting with Road Ride and Referrals/Rewards. Capture exact policy definitions, table and column grants, view definitions, function dependencies, and policy predicate review. Remediation must remain a draft until explicitly approved.
