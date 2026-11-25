# Phase 12 — Multi-Store Cart, Checkout & Order Workflow Audit
**Date:** 2026-11-25
**Scope:** Read-only GitHub source/test search and QA routine metadata
**QA project:** `pqsangtvietawkfgpgfu`; production untouched

## Static findings
- Test inventory contains a multi-store cart grouping assertion and duplicate-store checkout rejection assertion. These are test source markers only; execution status is not established here.
- Release gate marks cart/single-store checkout PARTIAL: real order write and partner dashboard visibility require staging.
- Multi-shop cart and separate shop-wise orders are PARTIAL: RPC is described as existing, but staging must verify exactly one order per store.
- Release gate calls delivery/platform fee calculations LIVE TEST REQUIRED.
- Partner payment QR/timeout/UTR guards PARTIAL; expiry, extension, replay protection and real bank confirmation pending.
- Food-delivery blueprint documents browse/menu → cart → checkout → shop acceptance → preparation → ready → delivery assignment/pickup → tracking → completion → payment/receipt → rating.
- Scoped QA routine inventory query for routine names matching multi-market-order returned no rows. This is inconclusive for actual backend existence due scoped naming/metadata visibility.

## Required runtime tests
1. Add products from 2+ stores; cart groups correctly.
2. Quantity changes, remove item, stock/price refresh.
3. Duplicate store entries and duplicate checkout rejected safely.
4. Checkout creates exactly one child order per store; verify atomicity/failure handling.
5. Customer history displays parent/multiple store orders correctly.
6. Partner sees only own store's orders and can update allowed states.
7. Customer cannot write partner order status.
8. Order status transition sequence and invalid transition rejection.
9. Stock reserved/reduced/released on success, cancellation, failure.
10. Delivery fee/platform fee match approved business rules.
11. Notifications are correctly routed to customer and each partner.
12. Payment QR/UTR expiry, duplicate reference and replay guards.
13. RLS and cross-store data isolation using separate authenticated accounts.

## Status
- Static audit: COMPLETE (partial evidence)
- QA RPC metadata: INCONCLUSIVE in scoped search
- Runtime staging tests: NOT RUN
- SQL/code/config changes: 0
- Production changes: 0
- Release gate: PARTIAL / LIVE TEST REQUIRED

## Next
Audit food/restaurant order workflow, partner acceptance, preparation/delivery stages, and payment/receipt consistency.
