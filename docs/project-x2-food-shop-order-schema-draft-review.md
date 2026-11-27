# Project X2 Food/Shop Order Schema Draft Review

Migration draft: `supabase/migrations/202611270006_project_x2_food_shop_order_schema_draft.sql`

- Orders table: customer and partner ownership, address, status, quote totals, delivery fee, total, payment state/reference, timestamps.
- Order items: catalogue link plus item-name/price/image snapshots, quantity, unit, prescription flag and partner quote price.
- Status/payment CHECK constraints and indexes for customer/partner order listing.
- RLS enabled and direct authenticated/anon table grants revoked; RPCs will be the access layer.
- No RPCs yet, no migration applied, no QA database writes.

Review before runtime: UI payload uses `quantity` and quote item identifiers; quantity numeric type and JSON parsing must be aligned. Order number generation, RPC authorization, quote state transitions, fee calculation, idempotency, payment confirmation evidence, and cancellation/refund rules are not yet implemented.