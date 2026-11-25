# Phase 12 — Platform Fee Implementation Gate

Status: BLOCKED on final business formula approval; planning and QA structure only.
Branch: phase-12-implementation-plan

## Confirmed fee points
- ₹100 amount: ₹2.50 fee
- ₹500 amount: ₹11.50 fee
- ₹1,000 amount: ₹25 fee
- Above ₹1,000: fee capped at ₹25

## Formula approval checklist
- [ ] Define fee for 0–₹99.99
- [ ] Define calculation method between ₹100, ₹500 and ₹1,000 (percentage, slabs, or another explicit rule)
- [ ] Define paise rounding (round / floor / ceiling)
- [ ] Define minimum fee, if any
- [x] Cap above ₹1,000 at ₹25
- [x] Confirm ₹100, ₹500, ₹1,000 sample outputs

## Proposed SQL API (not deployed)
A single deterministic SQL function should accept an amount and return the fee in rupees/paise. Keep it pure (no payment side effects), reject invalid inputs, and use numeric types to avoid floating-point drift. Configuration should be explicit and protected from unauthorized edits.

## QA cases
1. Confirmed examples: 100, 500, 1000.
2. Cap: 1000.01 and larger values produce no more than 25.
3. Formula boundaries: test immediately below and above every approved threshold.
4. Invalid inputs: negative, null, malformed, and zero according to approved policy.
5. Precision: inputs with paise and rounding cases.
6. Idempotency: fee must not be duplicated by retrying checkout/payment.
7. Totals: subtotal + delivery + platform fee + applicable tax equals displayed/recorded total.
8. Regression: ride, food, grocery, multi-shop, shopping, parcel, and home-service checkout.

## Safety and rollout
- Do not run SQL against production while formula is pending.
- First migration is additive and isolated to QA/staging.
- Verify frontend and backend use the same authoritative fee result.
- Record test evidence and commit hashes.
- Only promote after regression passes and approval.

## Next checkpoint
Await explicit formula and zero/minimum/rounding policy. Then implement QA-only SQL function/config and test it against this matrix.
