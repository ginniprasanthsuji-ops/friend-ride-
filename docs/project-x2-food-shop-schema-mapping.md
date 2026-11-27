# Project X2 Food/Shop — Schema Mapping Checkpoint (2026-11-27)

Branch: `yt-test-1-to-15` only. No QA database writes in this checkpoint.

## Verified existing schema
- `profiles` contains user id, role, partner approval status, business name/category, address, UPI/PhonePe and partner QR path.
- `fr_service_providers` uses `owner_id`, approval status, business/profile/payment fields, but is service-provider specific; do not assume it is the store/catalogue ownership table.
- `fr_store_campaigns` is campaign/discount data, not a catalogue or order schema.
- QA schema query showed no catalogue/order tables and no target market-order RPC functions.

## UI order state contract verified in source
Partner order status actions:
- `quote_requested`: Accept / Reject
- `accepted`: Start Preparing
- `preparing`: Mark Ready
- `ready`: Complete Order
Quote/customer states:
- `quoted`: accept quotation or send counter price
- customer quote fields include item quote paise, subtotal, delivery fee, total.
Catalogue saves use selected master/custom item, category, unit, description, fixed/request pricing, optional offer, availability, prescription flag, optional image.

## Security implementation must not guess
Before migration, confirm how store/partner identity is resolved in existing UI/profile data. Profiles currently contain partner approval and business data, but the schema inventory did not establish a dedicated store primary key. Proposed catalogue/order tables must either use `profiles.id` as partner/store owner (if existing UI store selection contract confirms it) or reconcile an actual store ID source. Do not make the migration dependent on `fr_service_providers` unless the app explicitly maps stores to that table.

## Status
This checkpoint documents verified schema/UI mapping only. No SQL migration applied, no Food/Shop workflow E2E claim, and no progress percentage increase.