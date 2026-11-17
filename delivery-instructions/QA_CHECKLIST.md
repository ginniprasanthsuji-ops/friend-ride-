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
- [ ] Add customer capture UI to each supported order form.
- [ ] Upload photo/audio and persist paths from the customer flow.
- [ ] Add assigned-driver instruction card and signed/private media access.
- [ ] Add driver arrival photo upload flow.
- [x] Confirm the separate `friendride-delivery-otp` Edge Function is ACTIVE in Supabase; it reuses existing `APITXT_AUTHKEY` / `APITXT_TEMPLATE_ID` secrets. Registration `Sms-otp` function is separate and must remain untouched.
- [ ] Add source-controlled Edge Function parity and automated tests for issue/verify, 5-minute expiry, 60-second resend cooldown, and five-attempt limit; never expose plaintext OTP or hash to the client.
- [ ] Add landmark pin selection and persist coordinates.
- [ ] Ensure Driver can update arrival evidence only through a narrow server-side RPC; do not grant broad table UPDATE.
- [ ] Add Playwright coverage for Customer/Driver ownership, unauthorized user denial, media upload/read, and OTP expiry/attempt limits.
- [ ] Run existing full regression suite and verify existing ride/order flows.
- [ ] Review Supabase Security Advisor and RLS policy tests.
- [ ] Merge to Main only after every test passes.

## Current status
This is a database foundation, not a completed end-to-end feature. UI integration across all order types, assigned-driver arrival-photo write path verification, and automated browser/security tests remain release blockers. The separate delivery OTP Edge Function is already ACTIVE; no registration OTP function or secrets were changed. Main branch has not been modified or merged.
