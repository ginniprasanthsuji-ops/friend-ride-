# P0 Platform Fee — QA Specification (Draft)

Status: Requirements captured; fee formula between sample points is not approved yet. No SQL implementation has been deployed.

## Confirmed fee examples from user
- ₹100 order amount → ₹2.50 fee
- ₹500 order amount → ₹11.50 fee
- ₹1,000 order amount → ₹25 fee
- Amount greater than ₹1,000 → fee capped at ₹25

## Formula decision still required
The examples do not uniquely define how to calculate the fee for all amounts between ₹100, ₹500 and ₹1,000 (or below ₹100). Do not infer a percentage, interpolation, slab, rounding, or minimum fee without approval.

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
