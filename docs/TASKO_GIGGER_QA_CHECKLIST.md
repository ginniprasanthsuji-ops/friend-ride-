# TASKO / GIGGER – QA and Release Checklist

## Scope
- Feature name: TASKO / GIGGER
- Code branch: `qa/tasko-gigger-launch`
- Production Supabase project: `friend-ride` (`fglyplxcczdjtfwobtzh`)
- Separate Supabase QA database: intentionally not created, per owner instruction.
- Main branch: must not be modified until review and test sign-off.

## Implemented in the QA branch
1. Customer TASKO request form on Home Services.
2. Rate display: up to 6 hours ₹150–₹400 (Admin-approved quote); above 6 hours ₹400 + ₹50 per additional hour.
3. Gigger registration through the existing service-provider application table and private KYC storage bucket.
4. Admin approval/rejection of TASKO Gigger applications.
5. Admin assignment of approved Giggers and base quote (₹150–₹400).
6. Gigger accept → start → complete transitions through restricted database RPC functions.
7. Customer payment-reference submission and Admin payment verification.

## Production database migration
The additive migration `202611110001_tasko_gigger_workflow.sql` was applied to the existing Supabase project. It adds work-hours/final-amount/payment tracking columns and three authenticated RPC functions. No existing rows were deleted and no test bookings/payments were inserted.

## Verification completed
- Confirmed existing RLS policies allow customers to create/read their own service bookings.
- Confirmed Admin can read/update service bookings and review provider applications.
- Confirmed providers can read only bookings assigned to their own user ID.
- Confirmed the private `fr-service-provider-kyc` bucket and owner-upload/admin-review storage policies exist.
- Confirmed new payment/work columns and the three RPC functions exist, and authenticated execute grants are present.
- Supabase security advisor still reports existing project-wide RLS/function warnings; review these separately before public launch.

## Required end-to-end tests (not yet passed)
Use controlled internal Customer, Gigger, and Admin accounts on the production app. Do not use real customer data or collect real payments during testing.
- Customer creates a TASKO request; verify row belongs only to that customer.
- Gigger submits photo + identity document; verify private storage paths and pending application.
- Admin approves; verify unapproved Giggers cannot be assigned.
- Admin assigns approved Gigger and quote; verify only assigned Gigger can read the booking.
- Gigger accepts, starts, and completes; verify invalid state transitions are rejected.
- Verify 6-hour and >6-hour pricing calculations (₹150–₹400 base; ₹50 per extra hour after 6).
- Customer submits UPI/bank reference; Admin verifies or rejects; verify customer cannot mark payment as verified.
- Test on Android device and confirm no regressions to ride, OTP, shop, cart, and existing home services.

## Release gate
Do not merge to `main` or advertise the service as live until the controlled end-to-end tests above pass and the Supabase security findings have been reviewed.
