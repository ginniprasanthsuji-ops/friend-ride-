# Project X2 Food/Shop continuation audit — 2026-11-28

Target: `yt-test-1-to-15` only. Main and production untouched.

## Branch and CI evidence
- Branch head at audit: `969a4629a66e2fb22ca0b3149b89d02c157f24e6`.
- GitHub checks on this exact SHA: build, audit, Playwright, deploy, and report-build-status all completed with `success`.
- This is CI evidence, not a real-device, authenticated QA database, payment, or live order workflow pass.

## Catalogue schema review
- QA draft catalogue foundation defines `fr_partner_catalogue_items`, owned by `partner_id`, with SKU/name/category/unit/description, price and offer price in paise, image, availability, and prescription flag.
- Partner save RPC is RPC-only and checks authenticated partner role and approved status.
- The reviewed draft order schema references catalogue item UUIDs and snapshots item name/price/offer/quantity/unit/prescription/image.
- The core single-store checkout RPC validates selected store approval, item ownership and availability, and server-side catalogue price. It persists a quote-requested order and snapshots its items.
- The UI currently enforces single-store checkout; the multistore transaction/idempotency migration is review-only and not applied.

## Remaining blockers / safe next steps
1. Verify migration/function dependency order and signatures against QA database read-only.
2. Do not apply order-schema/RPC drafts until the actual QA catalogue schema and permissions are reconciled.
3. Keep demo Food menu disabled/non-orderable; do not create fake orders.
4. Resolve payment claim/partner confirmation RPC compatibility and status transitions; partner confirmation is not trusted payment verification.
5. Add/execute authenticated QA E2E: approved partner save catalogue -> customer catalogue view -> cart -> order -> partner quote -> customer accept/counter -> payment claim -> partner confirmation -> tracking/status.
6. Verify Parcel authenticated create/list/cancel and tracking persistence separately.
7. Real device tests for OTP, push notifications, and live location remain outstanding.

No SQL migration was applied and no live order or payment was created during this audit.
