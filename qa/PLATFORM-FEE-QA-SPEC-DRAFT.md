# P0 Platform Fee — QA Specification (Draft)

Status: Requirements captured; fee formula between sample points is not approved yet. No SQL implementation has been deployed.

## Confirmed fee examples from user
- ₹100 order amount → ₹2.50 fee
- ₹500 order amount → ₹11.50 fee
- ₹1,000 order amount → ₹25 fee
- Amount greater than ₹1,000 → fee capped at ₹25

## Formula decision still required
The examples do not uniquely define how to calculate the fee for all amounts between ₹100, ₹500 and ₹1,000 (or below ₹100). Do not infer a percentage, interpolation, slab, rounding, or minimum fee without approval.

## QA test matrix (formula approval required before expected results are asserted)
| Input amount | Expected fee / outcome |
|---:|---|
| ₹0 | Reject or safe zero-fee behavior—business decision needed |
| Negative amount | Reject |
| Null / malformed | Reject |
| ₹100 | ₹2.50 (confirmed) |
| ₹500 | ₹11.50 (confirmed) |
| ₹1,000 | ₹25 (confirmed) |
| ₹1,000.01 | ₹25 cap (confirmed) |
| Amount above ₹1,000 | ₹25 cap (confirmed) |
| Paise precision / boundary values | Formula + rounding rule approval required |

## Required QA cases after formula approval
- Exact examples: 100, 500, 1000
- Cap: 1000.01 and any higher amount → 25 maximum
- Boundary values immediately below/above each slab or threshold
- Zero, negative, null, and malformed inputs rejected or handled safely
- Currency rounding to paise deterministic
- Fee not duplicated on retry
- Checkout display and backend total agree
- Ledger records only verified/valid events; no fabricated payment records
- Existing ride, market, food, shopping, and service workflows regressions tested

## Proposed implementation safeguards
- Central SQL function/config for fee computation (once formula approved)
- Additive migration only; QA project first
- No direct production modification during implementation/testing
- Keep subtotal, delivery fee, platform fee, taxes (if configured), and total distinct
- Idempotent payment/reconciliation behavior

## Phase 12 next actions
1. Confirm exact fee formula for amounts between examples and for amounts below ₹100.
2. Confirm rounding rule (paise), whether minimum fee exists, and zero-amount handling.
3. Only after decisions: create SQL function + configuration and QA-only migration.
4. Run exact-value, boundary, invalid-input, retry/idempotency, and checkout-total tests.
5. Validate regression on ride, marketplace, food, shopping, and services; keep production untouched until verified.


## Phase 12 QA inventory checkpoint (2026-11-25)
- QA Supabase read-only inventory searched public routines with names matching fee/platform/payment; no matching routine was returned.
- QA table inventory found `fr_earnings_ledger`, but no platform-fee configuration/table surfaced in the scoped table-name inventory.
- This is an inventory result only; it does not prove fee logic is absent from frontend code or other database objects.
- No SQL implementation was created because the fee formula and below-₹100/zero/rounding behavior remain unapproved.
- Production database remains untouched.
