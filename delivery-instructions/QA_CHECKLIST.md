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
- [ ] Shop checkout creates `fr_market_orders`, while current delivery authorization checks `shop_orders`; reconcile the order/driver-assignment model before enabling customer + assigned-driver access.
- [ ] Upload photo/audio and persist paths from the customer flow.
- [x] Ride assigned-driver instruction card loads through the existing active-ride renderer.
- [x] Parcel assigned-driver instruction widget is mounted after successful driver acceptance.
- [ ] Food and Shop assigned-driver instruction cards remain blocked by the missing/mismatched order-flow mappings.
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
This is a database foundation, not a completed end-to-end feature. UI integration across all order types, assigned-driver arrival-photo write path verification, and automated browser/security tests remain release blockers. The separate delivery OTP Edge Function is already ACTIVE; no registration OTP function or secrets were changed. Main branch has not been modified or merged.
