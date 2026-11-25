# Phase 12 Coupon Backend — QA Matrix (Draft)

Status: test plan only; no database changes or live tests performed.
Branch: `phase-12-implementation-plan`

## Test environments and evidence
- Use only a confirmed FRIEND RIDE QA/staging Supabase project. Do not use the unrelated project previously inspected.
- Capture SQL test output, app screenshots, and CI run URL for each test.
- Production remains unchanged until QA passes and owner approves.

## Campaign permissions
| ID | Test | Expected |
|---|---|---|
| CAM-01 | Admin creates campaign | Allowed; campaign issuer is authenticated admin |
| CAM-02 | Approved shop owner creates store coupon for own shop | Allowed; shop ownership validated |
| CAM-03 | Shop owner tries another shop's campaign | Denied |
| CAM-04 | Unapproved partner attempts campaign creation | Denied |
| CAM-05 | Customer tries campaign create/edit/activate | Denied |
| CAM-06 | Campaign dates invalid or discount <= 0 | Rejected by constraints/validation |
| CAM-07 | Campaign pause/cancel | New purchase/redemption blocked; existing paid coupon policy explicit |

## Purchase and direct-to-store payment
| ID | Test | Expected |
|---|---|---|
| PUR-01 | Customer starts purchase | Pending purchase only; not marked paid |
| PUR-02 | Customer self-submits paid flag | Rejected / no paid status change |
| PUR-03 | Issuer/store verifies payment | Purchase becomes paid only through trusted issuer workflow |
| PUR-04 | Store payment confirmation | Store receives purchase-recognition notification |
| PUR-05 | Duplicate confirmation retry | Idempotent; no duplicate notifications or purchase records |
| PUR-06 | Failed/cancelled payment | Not redeemable |
| PUR-07 | Payment reference reused by another purchase | Rejected or flagged for review |

## Coupon ownership and redemption
| ID | Test | Expected |
|---|---|---|
| RED-01 | Customer views own coupon | Allowed; code/token not exposed to other customers |
| RED-02 | Customer reads another customer's purchase | Denied |
| RED-03 | Store redeems coupon issued for that store | Allowed if paid, active, in dates, and rules match |
| RED-04 | Different store attempts redemption | Denied |
| RED-05 | Ride coupon Bike/Auto/Car matching service | Allowed within campaign scope |
| RED-06 | Ride coupon wrong service type | Denied |
| RED-07 | Expired campaign/coupon | Denied |
| RED-08 | Coupon already redeemed | Denied |
| RED-09 | Two concurrent redemption attempts | Exactly one succeeds |
| RED-10 | Retry same idempotency key | Same result; no second redemption |
| RED-11 | Invalid, altered, or guessed coupon code | Denied; no sensitive data leak |
| RED-12 | Redemption actor lacks role/ownership | Denied |

## Notifications and reporting
| ID | Test | Expected |
|---|---|---|
| NOT-01 | Payment verified | Issuer receives notification once |
| NOT-02 | Coupon redeemed | Customer and issuer receive appropriate notifications |
| NOT-03 | Notification insert retry | Dedupe key prevents duplicates if supported |
| REP-01 | Issuer reports | Only own campaigns, sales, and redemptions |
| REP-02 | Admin reports | Global reports restricted to admin |
| REP-03 | Refund/cancel/expiry totals | Accurate and not double-counted |

## SQL migration review gates
- Check existing table/function names before applying; migration must not overwrite or conflict with existing schema.
- Confirm referenced ride table and keys, shop ownership/approval source, admin helper, and role values.
- Review RLS policies and grants; authenticated clients must not write paid status or redemption state directly.
- Redemption RPC must lock purchase row or otherwise serialize concurrent redemption, validate every eligibility rule inside transaction, and write purchase + redemption atomically.
- RPCs must use a fixed safe search_path, explicit authorization checks, and idempotency.
- Validate constraints for campaign kind, service scope, price/discount calculation, quantity/per-customer limits, and time boundaries.
- Decide refund handling and coupon purchase amount calculation before coding.
- Use a reversible/rollback plan and verify row counts and function/policy inventory after migration.

## Release decision
Coupon feature remains **NOT READY** until the migration is reviewed, QA tests executed in the correct environment, client integration verified, and regression evidence attached.