# Phase 12 QA — Notification & Storage Policy Audit
Date: 2026-11-25
QA project: pqsangtvietawkfgpgfu only. Production untouched.
Review: read-only metadata; no schema/storage changes; runtime tests not performed.

## Notification policies
- fr_app_notifications: SELECT own user_id; UPDATE own user_id with matching check.
- fr_notification_events: SELECT own user_id.
- fr_notification_preferences: ALL operations scoped to auth.uid() = user_id.
- fr_notification_tokens: ALL operations scoped to auth.uid() = user_id.
- fr_ride_notifications: SELECT and UPDATE scoped to own user_id.

## Driver documents
- SELECT policy: own owner_id OR admin membership.
- INSERT policy: owner_id=auth.uid(), driver_id=auth.uid(), verification_status='pending'.
- UPDATE own pending documents scoped by owner_id and driver_id, and pending status.
- Admin review UPDATE policy checks admin_users membership.
- No runtime tests; verify table grants and storage object behavior in test accounts.

## Supabase Storage
- QA storage.buckets inventory returned no buckets.
- storage.objects policy inventory returned no policies.
- This means storage-backed document/profile-photo upload paths are not configured/visible in QA metadata at audit time.
- This is a release blocker for features requiring secure uploads (driver/partner/provider profile photos, driver documents, QR images) until intended storage bucket(s), object policies, and upload/download paths are provisioned and tested.
- Do not create buckets or policies without approval; production untouched.

## Trigger
- auth.users AFTER INSERT trigger fr_auth_user_notification_preferences observed, calling fr_create_notification_preferences_for_new_user().
- Runtime confirmation that new signups receive preferences is pending.

## Pending tests
1. Cross-user notification read/update negative tests.
2. Token/preferences ownership negative tests.
3. Driver document owner/admin access and pending-state transitions.
4. Upload/download/delete storage policies once storage is configured.
5. New-user notification preference trigger test.
