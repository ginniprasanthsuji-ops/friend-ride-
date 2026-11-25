# Phase 12 — Partner Catalogue, Store Visibility & Inventory Audit
**Date:** 2026-11-25
**Scope:** Read-only GitHub source/test search and QA schema metadata query
**QA project:** `pqsangtvietawkfgpgfu`; production untouched

## Static findings
- Release gate lists partner approval PARTIAL; approve/reject and approved-only listing require staging evidence.
- Catalogue save/edit, SKU, price and stock UI handlers/RPCs are marked present, but add/edit/reload/customer visibility remain untested with staging accounts.
- Source test marker recognizes `fr_partner_save_catalogue_item` and `fr_partner_list_market_orders`.
- Store GPS/map coordinates remain PARTIAL and need real device/location capture testing.
- Shop quote/counter-offer/acceptance workflow remains PARTIAL.
- QA schema metadata query for table names matching `partner_catalogue` returned no rows in this scoped query. This does not prove the catalogue tables are absent; naming/visibility/query scope may differ. Backend schema needs broader authenticated staging inspection before asserting persistence.

## Required staging tests
1. Pending/rejected partner cannot expose store/catalogue to customers.
2. Admin approves partner; store appears in eligible customer listings.
3. Add catalogue item with SKU, price, stock, image; save and reload persists.
4. Edit item without duplicate SKU or duplicate record.
5. Invalid/zero/negative price and invalid stock rejected.
6. Stock reduction, out-of-stock and availability consistency.
7. Customer sees only approved/available stores and correct catalogue.
8. Store GPS/map pin and distance correctness on real device.
9. Multi-store cart grouping and duplicate store checkout behavior.
10. Customer order -> partner quote/counter-offer -> acceptance -> order status notifications.
11. Confirm customer cannot modify partner catalogue; partner cannot modify another store's items.
12. Verify RLS/role isolation and stale catalogue/cache behavior.

## Status
- Static audit: COMPLETE (partial evidence)
- QA schema inventory: INCONCLUSIVE for catalogue table names
- Runtime staging tests: NOT RUN
- SQL/code/config changes: 0
- Production changes: 0
- Release gate: PARTIAL / LIVE TEST REQUIRED

## Next
Audit multi-store cart, checkout/order persistence, order status transitions and role-specific order visibility.
