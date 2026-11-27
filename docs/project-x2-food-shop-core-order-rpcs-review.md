# Project X2 Food/Shop Core Order RPC Draft Review

File: `supabase/migrations/202611270007_project_x2_food_shop_core_order_rpcs_draft.sql`

Implemented as draft functions:
- `fr_customer_place_market_order`: auth required, approved store check, non-empty address/items, validates catalogue item ownership and availability, server reads canonical item name/price/offer/prescription/image and snapshots them, rejects client price as authority.
- `fr_customer_list_market_orders`: customer-owned orders only.
- `fr_partner_list_market_orders`: partner-owned orders only, optional status filter.
- `fr_partner_update_market_order`: owner check and explicit state transition rules.

Still missing before this can be considered complete:
- SQL runtime validation and transaction/idempotency review.
- Multi-store checkout behavior (current create RPC is single store).
- Quote/counter-offer RPCs.
- Cancellation policy and delivery-fee calculation.
- Payment evidence/verification; partner confirmation alone must not be called verified.
- UI integration/runtime QA.
- Apply to QA only after review and approval.

No database migrations applied.