# Phase 12 — Regression Gate & Evidence Checklist

Status: checklist draft. No test execution claimed.

## Test environment prerequisites
- [ ] Confirm correct FRIEND RIDE QA/staging project identity and URL/ref; do not use unrelated Supabase project.
- [ ] Test accounts for customer, approved driver, approved partner/store owner, home-service provider, admin.
- [ ] Test records are synthetic; avoid real payment/identity details.
- [ ] Confirm baseline branch/version and existing routes/features before changes.
- [ ] Attach screenshots/logs and CI run link for executed tests.

## Existing workflows regression
- [ ] Role selection routes to correct dashboard (Customer/Driver/Partner/Admin/Service Provider).
- [ ] Customer registration and profile flow.
- [ ] Driver registration, approval, profile photo/doc uploads.
- [ ] Partner/store registration, approval, catalogue and stock save.
- [ ] Service provider registration and approval.
- [ ] Store catalogue -> customer view -> cart -> order -> quote/accept -> payment confirmation -> order status.
- [ ] Ride request -> driver accept -> ride lifecycle -> completed -> payment QR/transaction confirmation.
- [ ] Delivery/parcel payment workflow.
- [ ] Home service request/assignment/completion.
- [ ] TASKO existing workflow/payment (where enabled).
- [ ] Notifications are scoped to correct recipient; read/unread state works.
- [ ] Dashboards do not cross-role route or expose other role's records.
- [ ] Existing referral and subscription flow, with current backend threshold test.
- [ ] QR display and post-completion behavior.

## Phase 12 feature tests
- [ ] Platform fee exact approved formula, rounding and ₹25 cap.
- [ ] Fee displayed consistently on relevant checkout/order summaries and persisted only on verified event.
- [ ] Ledger duplicate prevention and atomic retries.
- [ ] Coupon create/edit/activate/pause and issuer ownership.
- [ ] Coupon purchase pending state; customer cannot self-confirm paid.
- [ ] Direct-to-store payment confirmation and issuer recognition notification.
- [ ] Paid coupon token/QR ownership and secure display.
- [ ] Single redemption, wrong-store/service rejection, expiry, concurrent redemption, retry idempotency.
- [ ] Coupon issuer/customer/admin reports scoped by role.
- [ ] Referral promise text and backend rule aligned after owner approval.
- [ ] Customer ₹50 and partner one-month offer entitlements backend-verified.

## Release evidence
- [ ] Current CI run result (not historical result).
- [ ] SQL migration dry-run/review and QA execution record.
- [ ] Permission/RLS test results.
- [ ] Browser/app workflow test results.
- [ ] Real device: OTP, push notifications, GPS/live tracking, payment flow.
- [ ] Signed AAB and Play Store checklist.
- [ ] Privacy/Data Safety, account deletion, support contact and store listing checked.

## Release status
BLOCKED until all required test evidence is current, verified, and reviewed.