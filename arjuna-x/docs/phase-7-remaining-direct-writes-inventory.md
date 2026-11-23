# Phase 7 — Remaining Direct Write Inventory

Static scan of `index.html` on the Phase 7 QA branch for Supabase `.insert/.update/.upsert/.delete` patterns. Counts represent source occurrences, not runtime frequency.

## Full scanned write table inventory

- `profiles`: update 3, insert 1
- `fr_driver_documents`: upsert 1
- `rides`: insert 1
- `driver_locations`: upsert 2, update 1
- `ride_live_locations`: upsert 3
- `fr_emergency_contacts`: insert 1
- `fr_ride_sos`: insert 1
- `fr_push_subscriptions`: update 1, upsert 1
- `fr_service_provider_applications`: insert 1, update 2
- `fr_service_bookings`: insert 2, update 3
- `fr_bank_enquiries`: insert 1, update 1
- `fr_support_feedback`: insert 1, update 2

## Newly reviewed call-site details

### Emergency contacts
- Insert fields: user_id (client UID), contact_name, phone_e164, priority=1.
- Must bind user_id to auth.uid(), validate phone format/priority, and prevent users from writing other users' rows.

### Ride SOS
- Inserts SOS row with ride_id, latitude, longitude, message.
- Validate participant/ride relation and active ride, caller identity, coordinate bounds; client-supplied message should be bounded.

### Push subscriptions
- Updates old endpoint subscription is_active=false, updated_at; upserts new subscription with endpoint, user_id, user_agent, is_active, updated_at.
- Endpoint ownership and user_id must be enforced; endpoint uniqueness/upsert conflicts should not allow cross-user deactivation or ownership transfer. Consider server-side RPC and endpoint allowlist/validation.

### Service provider applications
- Insert contains provider_id, service_category, name, phone, business, address, profile photo/document paths, document type and emergency contact fields.
- Admin UI direct updates status/reviewed_by/reviewed_at/updated_at; admin authorization and allowed transitions must be enforced in database/RPC. Client must not set review fields during application submission.

### Bank enquiries
- Customer insert: user_id, service_type, full_name, phone, area. Admin update: status, updated_at.
- Ownership binding, field validation, and database admin check/status allowlist required.

### Support feedback
- Customer insert row includes user/contact details, feedback/complaint content and optional ride reference.
- Admin direct updates status and homepage publication flags/status.
- Public homepage feedback RPC separately reviewed previously. Direct publish/status updates must be admin-only at database level, with moderation and consent checks.

## Global least-privilege implications
- Direct client write surface spans 12 tables in the static scan.
- Table-level authenticated grants must not be retained just because some columns are client-writable. Use table REVOKE followed by exact verified column grants, RLS policies, or RPC-only operations as appropriate.
- Cross-user ownership and admin checks must be database-enforced. Frontend `currentProfile`/`selectedRole` guards are UX only.
- Validate all callsites including external JS modules, dynamic table names, and any other pages before final SQL; scan is not exhaustive.

## QA gate
No runtime tests, no SQL execution, no destructive actions. Production untouched; no merge/deploy.