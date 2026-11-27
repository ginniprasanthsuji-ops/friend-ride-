# X2 Food/Shop State Machine Correction Review

Draft migration: `202611270011_project_x2_food_shop_state_machine_correction_draft.sql`

Corrects a concrete incompatibility found in draft review:
- Migration 006's order status CHECK did not include `customer_quote_accepted`, despite migration 010 setting it.
- Partner updater did not handle the customer-accepted quote state.

Draft correction:
- Replaces status CHECK to include `customer_quote_accepted`.
- Partner updater allows partner acceptance/rejection from `quote_requested`.
- Allows progression from `customer_quote_accepted` to `preparing`, but only when payment_status is `verified`.
- Subsequent preparing→ready and ready→completed transitions also require payment_status verified.

Important limitation: payment verification RPC/provider evidence is not implemented, so this gate may block the flow until the verification system is defined. It is safer than letting a partner manually mark a payment verified. No SQL applied or runtime tested.