# Phase 13B — Public Default ACL Impact Scope (Read-only)

Date: 2026-11-26. QA project only.

## Scope query
Read-only inventory of `information_schema.table_privileges` for public-schema tables excluding Shared Ride tables, grants to `anon` and `authenticated`.

## Counts
- `anon`: 13 tables with any grant; all 13 show at least one write/admin privilege in the table-level privilege inventory.
- `authenticated`: 36 tables with any grant; 34 show at least one write/admin privilege (INSERT/UPDATE/DELETE/TRUNCATE).

## Representative functional groups observed
- Referral tables (`fr_customer_referral_*`, `fr_referral_*`): privileges vary; some include SELECT/TRUNCATE and some broader write grants.
- Road Ride tables (`fr_road_ride_bookings`, `fr_road_ride_events`, `fr_road_ride_guest_profiles`, `fr_road_rides`, `fr_road_rides_public`): grants vary widely, including broad table privileges on some tables.
- Profiles, rides, driver locations, SOS, emergency contacts, notifications, service providers/bookings, campaigns, support feedback, bank enquiries and admin tables have authenticated grants in the catalog.

## Limitation
Privilege-count/scope inventory only. No effective RLS tests, row inspection, exploitability determination, or complete privilege-source attribution. Broad privileges alone do not prove data access because RLS may constrain rows; DELETE/TRUNCATE grants need independent review. No ACL changes made.

## Decision
Do not apply global/default ACL changes from this Shared Ride audit. Require module-by-module dependency and RLS review, especially Road Ride, profiles, rides, driver_locations, SOS/emergency contacts, notifications, service-provider and referral modules. Main/Production untouched.
