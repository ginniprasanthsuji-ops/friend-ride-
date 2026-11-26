# FRIEND RIDE Phase 13 — Partner Catalogue Photo & Market Order Status Static Review (2026-11-26)

## Scope
Static review of QA branch `index.html` blob `6b18c4ae088c733c6d9b64139ad688573e3875e6`. No runtime/database tests.

## Catalogue photo source
- Partner-only frontend handler validates JPG/PNG/WEBP and max 5 MB.
- Upload path is scoped by current user ID and sanitized SKU, with upsert enabled.
- Upload uses `fr-partner-catalogue` storage bucket.
- Handler obtains and returns a public URL from Storage.
- Catalogue save then sends image URL and item fields to `fr_partner_save_catalogue_item` RPC.
- Catalogue list uses `fr_partner_list_catalogue` RPC.

## Risk / verification items
1. Bucket is treated as public in frontend by calling `getPublicUrl`. Verify whether public catalogue photos are intentionally public and whether bucket/policies permit only owner writes; no bucket policy source was verified.
2. Upsert permits same partner/SKU path overwrite; confirm owner/path policy blocks cross-user writes and stale/unauthorized object replacement.
3. Catalogue RPC authorization and price/offer/availability/prescription constraints are not verified server-side.
4. Customer display and catalogue photo URL handling need runtime checks for broken/stale images and safe exposure.
5. No SQL migration/policy definition for these RPCs/bucket was inspected in this pass.

## Market order source
- Partner list uses `fr_partner_list_market_orders` RPC, status filter mapping `new` to `quote_requested`.
- UI shows order number, customer name, delivery address, items/quantity, price pending or price calculation, and created time.
- Status buttons allow frontend actions: accept/reject for quote_requested, preparing for accepted, ready for preparing, complete for ready.
- Update handler calls `fr_partner_update_market_order` RPC with order ID/status, displays success only if RPC call has no error, and reloads partner order list.

## Integrity / privacy verification gaps
- Server-side partner ownership, permitted status transition enforcement, and whether customer name/address/items are exposed only to assigned partner were not verified.
- UI status controls are not security boundaries; RPC must enforce ownership, transition rules, and payment/order state.
- The SQL function definitions were not located in the inspected source scope; this is a source-search gap, not evidence the deployed DB lacks them.

## Test status
- Static review: completed.
- Runtime / SQL tests: not executed.
- Production changes/deployments: 0.
- Fixes: 0.

## Release gate
Catalogue photo storage visibility/write policies and partner market-order RPC authorization/state integrity remain unverified. Keep release gate blocked until backend policy/source and staging tests provide evidence.
