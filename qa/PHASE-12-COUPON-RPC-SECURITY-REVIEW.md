# Phase 12 — Coupon RPC Security Review Notes

Status: read-only review notes / design draft. No production SQL executed.

## Existing infrastructure observations
- `fr_app_notifications` exists and has RLS policies allowing authenticated users to read their own notifications and mark their own notifications read.
- Notification table has required fields for recipient, type, title/body, action URL, order/ride references, dedupe key, read status, timestamps.
- `fr_shops` exists. Shop owner insert policy requires owner_id = auth.uid() and approval_status='pending'; read policy includes approved shops, own shops, and admins.
- `profiles` has role and partner/driver approval fields, but observed profile policies are complex/duplicated. Do not reuse profile role values without confirming canonical authorization helper and role mapping.
- Coupon feature must reuse notification infrastructure only after validating the notification insertion path and dedupe behavior. Do not allow authenticated clients to directly write notification rows for coupon-payment confirmation.

## RPC contracts to implement only after schema review

### 1) `fr_coupon_campaign_create`
Inputs: campaign attributes, optional shop ID.
Must validate authenticated user; admin role via trusted helper, or approved shop owner owns shop ID; enforce campaign type, dates, discount, limits, and service scopes. Campaign issuer fields must be set from server-side auth context, never user-supplied.

### 2) `fr_coupon_campaign_update`
Must lock campaign row; validate issuer ownership/admin status; prevent changing issuer; enforce status transitions and field validation.

### 3) `fr_coupon_purchase_start`
Inputs: campaign ID, requested quantity (if supported).
Must validate campaign active/current, per-customer and campaign inventory limits atomically. Create payment-pending purchase only. Never set paid state from customer-provided input. Direct-to-store payment means FRIEND RIDE does not collect coupon proceeds.

### 4) `fr_coupon_payment_confirm`
Inputs: purchase ID and verified reference/metadata.
Must authorize admin or campaign shop owner; verify pending state and expected amount; confirmation is idempotent; record confirmer and timestamp; only then transition purchase to paid and issue a deduplicated notification to the issuer/shop owner. Store/customer submitted reference alone is not proof.

### 5) `fr_coupon_redeem`
Inputs: coupon token, redemption type, service/store/ride context, idempotency key.
Must lock purchase/campaign; validate paid status, not expired, campaign active and within dates, correct store or service, eligibility/limits, and actor authorization. In one transaction create redemption and mark coupon redeemed. Unique constraints plus lock must ensure exactly one winner for concurrent requests. Idempotent retries return prior result, not another redemption.

### 6) `fr_coupon_report`
Issuer reports scoped to owned campaigns/shop; admin reports global only after admin helper check. Avoid exposing raw coupon tokens in reporting.

## Notifications
Use existing notification insert infrastructure if confirmed safe. Proposed event names:
- coupon_purchase_payment_confirmed
- coupon_redeemed
- coupon_expired (optional scheduled work; do not rely on client-only expiry)
Use stable dedupe keys based on event + purchase ID. Verify existing dedupe uniqueness and insertion function before implementing.

## Open design questions (must resolve before migration)
- Canonical approved-shop owner check and admin authorization helper.
- Confirm actual rides table/key and supported ride coupon service values.
- Refund/reversal behavior after paid purchase or redemption.
- Coupon code/token generation and QR display approach (token must not be predictable).
- Whether campaign quantity means purchased coupon inventory or campaign coupon count.
- Define exact percentage/fixed discount math, rounding, max discount, and coupon price.
- Determine whether per-customer limit applies to purchases or redemptions.
- Validate notification dedupe key uniqueness and safe insertion routine.

## Review status
Schema draft is not ready to deploy. RLS currently enabled on proposed tables, but no policies/grants/RPCs included. Authenticated direct writes must remain blocked until carefully designed RPCs and policies are tested.