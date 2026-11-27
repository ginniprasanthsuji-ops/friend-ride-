# X2 Food/Shop Negotiation Integrity Draft

Draft migration `202611270009_project_x2_food_shop_negotiation_integrity_draft.sql`

- Separate `customer_counter_paise` from partner quote price.
- Quote round counters on order and item.
- Quote history table for partner/customer proposals.
- 24-hour partner quote expiry field set on partner quote.
- Replaces partner quote and customer counter RPC drafts with exact item count + unique item ID validation.
- Customer counter only allowed from `quoted`; expired quotes rejected.
- Partner quote restricted to `quote_requested` or `accepted`.

Still review-required:
- Current state machine is ambiguous around customer accepting quotation versus partner accepting original order; next draft should introduce explicit states such as `customer_quote_accepted` or use a separate acceptance flag.
- Delivery fee remains zero default and is not yet calculated; must define fee policy and avoid client-provided fee.
- Need RPC for quote history read with ownership scoping.
- Payment verification needs provider/evidence design and cannot be marked verified by manual partner action alone.
- Need SQL parsing/runtime tests in QA and apply approval.

Not applied to Supabase; no database writes.