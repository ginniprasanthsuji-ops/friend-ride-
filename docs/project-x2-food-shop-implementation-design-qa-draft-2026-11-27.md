# Project X2 Food/Shop — Implementation Design (QA Draft)

Date: 2026-11-27
Branch: `yt-test-1-to-15`
QA Supabase project: `pqsangtvietawkfgpgfu`

## Additional verified findings
- `public.profiles` has UUID `id`, role text (default customer), partner approval status text (default pending), business name/category, partner UPI/PhonePe/QR, photo, and location fields.
- The QA profiles query returned no partner/customer rows, so approval-status values in live data could not be verified.
- QA profile RLS currently includes own-profile select/insert/update policies; the own-update policy does not restrict role/approval columns, so RPC authorization must not trust profile fields supplied by client and should validate the server-side profile role/status.
- The Storage bucket `fr-partner-catalogue` is absent in QA. Current UI attempts upload there and getPublicUrl, so image upload will fail until a QA-only bucket and object policies are included in a reviewed migration.
- No public market/catalog tables exist in QA.

## Design
1. Store identity: use `profiles.id = auth.uid()`; approved partner profile required. Store type/category comes from profile. Do not accept partner/owner user ID from RPC arguments.
2. Catalogue: partner-owned rows with item name/category/unit/description, base and offer price in integer paise, image path, available and prescription-required flags. Save RPC checks authenticated role/approval, validates lengths/prices and image path prefix.
3. Image storage: create QA bucket `fr-partner-catalogue` with object path `<auth.uid()>/<SKU>.<ext>`; restrict MIME types to JPEG/PNG/WEBP and max size 5 MB; owner-scoped object policies. Client UI currently uploads before RPC, so bucket policy must allow only the authenticated partner's prefix.
4. Orders: customer-owned order + item snapshots. Server derives item names, current price, image, prescription and store identity from catalogue; client price/name fields are not authoritative. Use request key uniqueness for retry protection.
5. Quotes/counters: quote revisions with per-item integer-paise amounts, ownership checks, and state transition guards; accept latest quote only. Store counter-offers as separate revision.
6. Payment: customer claim and partner manual confirmation remain distinct statuses; never call it independently bank-verified. Expose partner payment details only to the customer for their eligible order.
7. Access: RLS on tables; no anonymous access; authenticated customer/partner ownership policies. RPCs use explicit authorization checks. Any SECURITY DEFINER routine must have fixed search_path, narrow grants, auth.uid() checks, and must not be callable by anon/public.
8. Order-status workflow must be based on UI status values verified in source, with allow-listed transitions and history rows.

## UI RPC contract (verified source calls)
- `fr_partner_save_catalogue_item`
- `fr_partner_list_catalogue`
- `fr_customer_list_partner_catalogue(p_store_id)`
- `fr_customer_place_market_order_v2(p_store_id,p_delivery_address,p_items,p_request_key)`
- `fr_customer_list_market_orders`
- `fr_partner_list_market_orders(p_status)`
- `fr_partner_quote_market_order(p_order_id,p_quotes)`
- `fr_customer_accept_market_quote(p_order_id)`
- `fr_customer_counter_market_order(p_order_id,p_offers)`
- `fr_customer_market_payment_details(p_order_id)`
- `fr_customer_tick_market_payment`
- `fr_partner_confirm_market_payment(p_order_id,p_payment_reference)`
- `fr_customer_store_payment_options`
- `fr_partner_update_market_order(p_order_id,p_status)`

## Blockers before migration apply
- Confirm actual approved partner status string(s) from app/admin code, not database rows (QA profile data is empty).
- Confirm the UI's exact order-status values and quote/payment stages.
- Review bucket/object policy against current upload code and whether partner QR/payment data should be private or public.
- Migration must be applied to QA only after review; no migration has been applied yet.

## Next
Create the versioned QA migration only after status values and the complete RPC result shapes are confirmed from the UI. Then apply QA migration, test RPC ownership and workflow, and repair Food/Shop UI/backend integration. Main/production remain untouched.
