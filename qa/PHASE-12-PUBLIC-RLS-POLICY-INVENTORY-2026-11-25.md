# Phase 12 QA — Public Schema RLS Policy Inventory (QA only)
Date: 2026-11-25
Supabase project: QA ref pqsangtvietawkfgpgfu
Scope: Read-only metadata inventory of public tables and policies. No production access, no row data read, no runtime impersonation.

## Inventory
All 23 public tables observed had RLS enabled:
admin_users, driver_locations, fr_app_notifications, fr_bank_enquiries, fr_driver_documents, fr_earnings_ledger, fr_emergency_contacts, fr_notification_events, fr_notification_preferences, fr_notification_tokens, fr_push_subscriptions, fr_ride_notifications, fr_ride_sos, fr_service_bookings, fr_service_categories, fr_service_provider_applications, fr_service_providers, fr_service_requests, fr_support_feedback, fr_train_saved_itineraries, profiles, ride_live_locations, rides.

## Policy patterns observed
- Owner/participant-bound SELECT/INSERT/UPDATE policies across notifications, emergency contacts, bank enquiries, service requests/bookings, ride SOS/live location, rides, train saved itineraries, driver documents, and earnings.
- Admin checks generally use EXISTS against public.admin_users.
- Driver online status update policy on driver_locations requires own uid and approved driver profile when setting is_online true.
- Service bookings customer insert constrained to own customer_id, pending status, payment_status not_due.
- Provider application insert constrained to own provider_id and pending status.
- Driver documents owner insert constrained to own ids and pending status; own updates remain pending.
- Earnings ledger authenticated users have owner/admin SELECT only (prior audit); no authenticated write policy observed.
- Profiles own UPDATE policy uses id=auth.uid() for USING and WITH CHECK. It does not, by itself, constrain role or other sensitive profile fields. This is a **review flag**, not proof of exploitable privilege escalation. Requires column-level grant review and authenticated runtime tests.

## Gaps / caveats
- Metadata-only inventory; not testing policy behavior with authenticated users.
- Table grants/column grants and SECURITY DEFINER routines not exhaustively reviewed in this checkpoint.
- RLS enabled does not imply safe policy coverage; runtime negative tests remain pending.
- Main frontend source visibility/runtime integration remains an unresolved audit limitation.

## Next recommended QA actions
1. Review profiles table grants and column-level privileges, role/approval field mutation controls.
2. Review SECURITY DEFINER functions and trigger paths touching profiles, approval, ledger, rides, and service workflows.
3. Perform safe authenticated negative tests in QA with test accounts only (no production).
4. Continue release gate checklist; do not claim runtime pass until evidence is collected.
