# Project X2 continuation — implementation readiness checkpoint (2026-11-28)

Branch: `yt-test-1-to-15`
Current reviewed commit: `6f639f87970420b3d808f1c435e13f6abc67d50a`

## Source-backed blockers
- Existing UI/backend compatibility audit reports payment-confirmation RPC signature mismatch: UI sends `p_order_id` and `p_payment_reference`, while draft SQL only defines a one-argument function.
- Payment state design remains unsafe/incomplete: partner manual confirmation is not trusted verification; fulfillment must be gated by a distinct guarded payment state.
- UI status map omits `customer_quote_accepted` from drafted order states.
- Multi-store checkout is not implemented; current flow is single-store.
- Idempotency v2/request key is not wired into checkout.
- Customer payment-claim RPC is documented as not wired into UI.
- Food demo menu must remain clearly non-orderable until backend order flow is complete.

## Execution discipline
- Do not apply SQL drafts or make schema assumptions until QA DB read-only introspection establishes actual table/function/role conventions.
- Do not create fake orders or payments.
- Do not report authenticated E2E, payment verification, SMS, push, live tracking, or device checks as passed without evidence.

## Immediate next implementation sequence
1. Read-only QA schema/function introspection and reconcile catalogue/order schemas.
2. Draft corrective SQL for exact payment RPC signature and guarded transitions, without applying.
3. Add UI status label for customer-accepted quote and ensure payment-claim state has explicit UI/RPC contract.
4. Integrate idempotency/request key into checkout.
5. Implement or explicitly scope single-store-only checkout; avoid falsely advertising multi-store.
6. Execute authenticated QA E2E after safe migration review.
7. Add tests for UTF-8/Telugu visible-text integrity, payment state guards, RPC contract, and duplicate checkout.
8. Separate browser CI evidence from real device evidence.

This checkpoint is documentation only. No code, SQL schema, QA/live records, or production settings were changed in this turn.
