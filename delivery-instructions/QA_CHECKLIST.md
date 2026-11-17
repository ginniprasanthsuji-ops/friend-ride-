# Delivery Instructions QA

## Scope
Five integrated delivery capabilities:
1. Customer building/door photo
2. Recorded voice directions
3. Landmark text + map coordinates
4. Driver arrival photo
5. Delivery OTP confirmation and one-screen/no-call instruction summary

## Database
- Production migration applied with explicit owner approval: `202611170002_friendride_delivery_instructions.sql`
- Private bucket: `fr-delivery-instructions`
- Table: `public.fr_delivery_instructions`
- RLS enabled; SELECT/INSERT/UPDATE policies present.
- Access function checks Customer or assigned Driver for Ride, Parcel, Food, and Shop orders.

## Required before release
- [x] Ride customer capture UI is mounted after a ride is created.
- [x] Parcel customer capture UI is mounted after the parcel-create RPC returns an order ID.
- [ ] Food order creation is not wired to `fr_food_orders` in the current UI; implement the real customer order-create flow before mounting instructions.
- [x] Shop/Market delivery uses the existing `fr_market_orders.id` and `customer_id`; legacy `shop_orders` and `shop_delivery_assignments` are not modified.
- [x] Added a separate `fr_market_order_delivery_assignments` mapping table for assigned drivers, with Partner/Admin assignment RPCs and a Driver-only assigned-order listing RPC.
- [x] Added Customer delivery-instructions widget to existing FR Market order cards and an assigned-Market-deliveries panel to Driver Dashboard.
- [ ] Apply and verify additive migration `202611170003_friendride_market_delivery_mapping.sql` in the QA database, then test Partner assignment and Driver-only access.
- [ ] Upload photo/audio and persist paths from the customer flow.
- [x] Ride assigned-driver instruction card loads through the existing active-ride renderer.
- [x] Parcel assigned-driver instruction widget is mounted after successful driver acceptance.
- [ ] Food assigned-driver instruction cards remain blocked by the missing Food order-create flow. Shop driver widget is mounted from the new FR Market assignment list after a driver is assigned.
- [ ] Add driver arrival photo upload flow.
- [x] Confirm the separate `friendride-delivery-otp` Edge Function is ACTIVE in Supabase; it reuses existing `APITXT_AUTHKEY` / `APITXT_TEMPLATE_ID` secrets. Registration `Sms-otp` function is separate and must remain untouched.
- [ ] Add source-controlled Edge Function parity and automated tests for issue/verify, 5-minute expiry, 60-second resend cooldown, and five-attempt limit; never expose plaintext OTP or hash to the client.
- [ ] Add landmark pin selection and persist coordinates (current UI captures GPS coordinates, but no map pin picker).
- [ ] Ensure Driver can update arrival evidence only through a narrow server-side RPC; do not grant broad table UPDATE.
- [ ] Add backend integration tests for Customer/Driver ownership, unauthorized user denial, media upload/read, and OTP expiry/attempt limits.
- [x] Add Playwright checks for four order-type widget rendering and Parcel customer/driver mount hooks.
- [ ] Run full Playwright regression and verify all existing ride/order flows. The repository currently has a small delivery-specific Playwright suite; this is not yet a complete application regression suite.
- [x] Add a GitHub Actions Playwright workflow and local static preview server configuration.
- [ ] Review Supabase Security Advisor and RLS policy tests.
- [ ] Merge to Main only after every test passes.

## Current status
This is an incremental integration. Ride and Parcel are mounted; Shop uses the existing FR Market order model with an additive driver-assignment map and does not change legacy Shop checkout/quotation/payment logic. Food order creation, applying/testing the additive mapping migration, assigned-driver media security, and full browser/backend regression remain release blockers. The separate delivery OTP Edge Function is already ACTIVE; no registration OTP function or secrets were changed. Main branch has not been modified or merged.
