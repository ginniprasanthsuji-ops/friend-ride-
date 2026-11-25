# Phase 13C — Public Schema Table Inventory / RLS Flag Snapshot

**Date:** 2026-11-26  
**Environment:** QA Supabase project `pqsangtvietawkfgpgfu` only  
**Method:** Read-only catalog query against `pg_tables` for `public` schema. No user rows accessed. No writes, DDL, RPC calls, migrations, deployment, or runtime tests.

## Result
- Public tables returned: **39**
- Tables with `rowsecurity = true`: **39/39**
- Tables with `rowsecurity = false`: **0**
- Ownership reported for all listed tables: `postgres`

This is a catalog flag snapshot only. It does **not** prove that policies are correct, effective ACLs are safe, columns are appropriately restricted, or unauthorized requests are denied at runtime. Negative runtime tests and role-specific verification remain pending.

## Tables observed
```
admin_users
driver_locations
fr_app_notifications
fr_bank_enquiries
fr_customer_referral_codes
fr_customer_referral_reward_ledger
fr_customer_referrals
fr_customer_reward_ledger
fr_driver_documents
fr_earnings_ledger
fr_emergency_contacts
fr_notification_events
fr_notification_preferences
fr_notification_tokens
fr_push_subscriptions
fr_referral_codes
fr_referrals
fr_ride_notifications
fr_ride_sos
fr_road_ride_bookings
fr_road_ride_events
fr_road_ride_guest_profiles
fr_road_rides
fr_service_bookings
fr_service_categories
fr_service_provider_applications
fr_service_providers
fr_service_requests
fr_shared_ride_bookings
fr_shared_ride_events
fr_shared_ride_payments
fr_shared_rides
fr_store_campaign_redemptions
fr_store_campaigns
fr_support_feedback
fr_train_saved_itineraries
profiles
ride_live_locations
rides
```

## Next gate
Continue catalog-only review of policy definitions and grants, then prepare the remaining runtime negative-test evidence checklist. Do not touch Production/Main or modify app/schema.
