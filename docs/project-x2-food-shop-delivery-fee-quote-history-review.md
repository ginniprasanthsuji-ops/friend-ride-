# Project X2 Delivery Fee and Quote History Draft Review

Migration: `202611270010_project_x2_food_shop_delivery_fee_quote_history_draft.sql`

Draft additions:
- Delivery distance and fee-rule snapshot columns.
- Fee helper formula draft: ₹20 base + ₹5/km, bounded to 0–100 km.
- Customer quote acceptance uses explicit `customer_quote_accepted` state and checks quote expiry.
- Customer/partner-owned quote history read RPC.

Business-policy confirmation needed: fee formula is a proposed placeholder, not approved policy. Distance source, distance calculation, caps, rounding, and who pays fee need confirmation before implementation.
Important unresolved state-machine update: migration 007 partner status updater must be revised to support partner progressing `customer_quote_accepted` to `preparing`, while preserving original accept/reject transitions.
Security/runtime review: quote history authorization; SECURITY DEFINER and search_path; SQL type resolution; migration ordering; function grants; tests still required.
No migration applied.