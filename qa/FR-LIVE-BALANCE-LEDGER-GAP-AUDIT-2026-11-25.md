# FRIEND RIDE — Live Balance / Transaction Ledger Gap Audit
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
QA project only: pqsangtvietawkfgpgfu

## User request
Check whether a live balance / transaction workflow already exists. If it is absent and there is room, add it through SQL and GitHub; do not duplicate an existing feature.

## Audit evidence
- QA database read-only metadata query found no public tables with names matching wallet, balance, ledger, payment, earning, payout, or transaction, and no public routines matching wallet/balance/ledger/payout/earning/payment.
- Repository source has a Wallet & Payments UI, but it explicitly states add-money is unavailable and shows static ₹0 / points placeholders.
- Driver Dashboard shows static Today Earnings ₹0. No ledger-backed balance identified in the reviewed source.
- Partner Dashboard has static revenue KPI and states settlements require protected backend integration.
- Play Store release gate marks Partner balance/subscription blocked/live-test-required; cashfree payment/subscription/settlement are not verified.
- Existing ride payment flow supports QR/UPI payment session and driver bank-credit confirmation; marketplace flow supports partner bank-credit confirmation. These are payment confirmation workflows, not a unified live ledger.

## Conclusion
**Gap exists — a ledger-backed balance workflow is not present in the inspected QA DB metadata/source.** Do not add wallet top-up or claim real money balance until payment gateway settlement or verified collection source is defined.

## Recommended minimal feature (SQL + GitHub only)
Create a unified immutable transaction ledger for **earned/owed amounts and adjustments**, not customer stored-value wallet:
- Actor/owner: driver or partner user id
- Source: ride, order, service, subscription, referral reward, admin adjustment
- Direction/type: credit, debit, hold, release, reversal
- Amount and currency (INR), status (pending, confirmed, reversed), reference id, idempotency key
- Created/confirmed timestamps and Admin audit metadata
- Live balance derived from confirmed ledger entries; pending amounts shown separately
- Prevent duplicate entries via unique idempotency/source constraints
- No direct user ledger edits; protected RPCs only; Admin adjustment reason and audit
- Separate customer wallet top-up/withdrawal remains out of scope until payment gateway integration is enabled

## Workflow proposal
1. Ride/order/service completed and payment/collection verification state is confirmed.
2. SQL RPC posts an idempotent pending/confirmed credit for the eligible driver/partner, based on configured commission rules.
3. Dashboard reads balance totals from secure SQL/RPC: available, pending, paid/settled (if settlement records later exist).
4. Admin verifies settlement/withdrawal when a payout process is introduced; payout must be a separate audited transaction state.
5. Refund/cancellation uses reversal entries; never delete or overwrite ledger history.

## Risks if implemented without boundaries
- Double credits on repeated status/webhook calls
- Credits before payment confirmation
- Wrong driver/partner attribution
- Race conditions during simultaneous orders
- Admin/user self-adjustment fraud
- Refunds/cancellations not reversing credits
- Mislabeling accrued earnings as withdrawable cash
- Tax/commission rules and payout compliance unresolved

## Implementation decision
Audit and gap documentation only. No SQL/schema/code/config changes, no payment integration, no live account writes, no production access. This feature can be implemented in QA after the user confirms the ledger is **earnings/settlement tracking only** (not customer wallet money/top-up) and approves commission/eligibility rules.
