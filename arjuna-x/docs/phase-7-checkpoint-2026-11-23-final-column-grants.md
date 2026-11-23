# Phase 7 Checkpoint — Final Column Grant Review

- Verified authenticated column-level INSERT/UPDATE grants on profiles, rides, driver_locations, and fr_ride_notifications.
- Sensitive profile role/approval/Aadhaar/license fields have direct authenticated column grants; trigger review guards some UPDATE fields but INSERT and GUC bypass need controlled runtime validation.
- Ride direct grants include lifecycle fields (status, driver_id, agreed_fare) and identity fields; workflow RPCs have state checks but direct API access plus RLS needs runtime verification.
- Notifications direct grants allow user_id, ride_id, title, message and timestamps, not just read-state; server-authored notifications should be write-restricted.
- Driver locations allow driver_id/is_online/coordinates/timestamp writes; confirm RLS binds identity and approved role, and prevents spoofing.
- Remediation principles documented; exact migration should be staged after frontend path/RPC reconciliation, explicit approval, QA verification.

Estimated Phase 7 progress: 92% (engineering estimate; static review only).

Remaining: migration/review reconciliation; controlled runtime tests; storage/RLS/API regressions; final gate. No SQL applied or production changes, no merge/deploy.