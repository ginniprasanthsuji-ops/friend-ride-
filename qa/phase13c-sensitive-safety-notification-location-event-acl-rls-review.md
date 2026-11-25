# Phase 13C — Sensitive Safety, Notification, Location and Event ACL/RLS Review

Date: 2026-11-26
QA project: `pqsangtvietawkfgpgfu`
Method: Read-only catalog policy and table privilege inspection.

## RLS status
RLS enabled on all reviewed tables: driver_locations, fr_app_notifications, fr_earnings_ledger, fr_emergency_contacts, fr_notification_preferences, fr_notification_tokens, fr_push_subscriptions, fr_ride_notifications, fr_ride_sos, fr_road_ride_events, fr_shared_ride_events. FORCE RLS is false across these inspected tables (catalog state).

## Policy observations
- driver_locations: owner-only policy; check requires own driver_id and, when online, approved driver role/status.
- fr_app_notifications: own user read and update only.
- fr_earnings_ledger: owner or admin select; no client write policy observed in reviewed policy output.
- fr_emergency_contacts: own-user management.
- notification preferences/tokens and push subscriptions: own-user management.
- fr_ride_notifications: own-user read/update.
- fr_ride_sos: own SOS insert/read; admin read policy.
- road ride events: participant-only SELECT via driver/passenger helper functions.
- shared ride events: participant-only SELECT via driver or booking-passenger relationship.

## ACL discrepancy / risk
Information-schema table privileges show broad authenticated grants (including INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER) on multiple RLS tables, although policies restrict available operations. This is not proof of exploitability; RLS should deny unmatched operations, but runtime negative tests are required to verify.
- `fr_shared_ride_events`: anon table privileges appear broadly granted in information_schema, but policy role list observed is authenticated. Validate anon access is denied and confirm actual effective privilege behavior.
- `fr_road_ride_events`: anon grants also appear in information_schema, while participant SELECT policy is authenticated-scoped. Verify anon cannot read/write.
- Authenticated broad grants on driver_locations, emergency contacts, notification tables, SOS, and event tables: verify cross-user operations, self-spoofing, and forbidden destructive operations are denied.

## Runtime priority matrix
1. Anonymous select/insert/update/delete on road/shared ride event tables: deny.
2. Authenticated nonparticipant read of event history: deny.
3. Cross-user driver location read/write/delete/truncate: deny; only own approved-driver online state should be allowed as policy specifies.
4. Cross-user emergency-contact CRUD: deny.
5. Cross-user device token/push subscription/preferences CRUD: deny.
6. SOS: user can create/read own only; non-admin cannot read other users' SOS; arbitrary sender spoof must deny.
7. App/ride notification: cross-user read/update/insert and destructive actions should deny.
8. Earnings ledger: owner/admin read only; direct client write must deny.
9. Confirm whether table grants can be narrowed to operation-specific privileges rather than broad CRUD, preserving intended app behavior.

## Limits
Catalog-only review. No table rows queried, no runtime calls, no mutation/migration/deployment. Production/Main untouched.
