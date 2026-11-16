# FRIEND RIDE Grocery — QA implementation plan

## Selected decisions
- Bank partnership: open; FRIEND RIDE will approach an RBI-regulated bank.
- FD owner: customer. Bank alone opens/holds the FD and places any lien.
- Card issuer: bank-issued FD-secured credit card; FRIEND RIDE never issues a card.
- Weekly EMI: only if the bank itself offers and approves a weekly instalment product. Otherwise show weekly prepaid grocery payments, not a FRIEND RIDE loan.
- Purchase-linked lucky draw: disabled until written Indian legal review and campaign approval. Do not collect entries or generate codes while disabled.
- No ₹50 mandate fee is included. Bank/card/gateway charges must be disclosed by the relevant provider; do not label a merchant charge as a mandate fee.

## Critical product distinction
1. A bank-issued secured credit card is a bank credit product. The bank decides FD lien, card limit, card issuance, EMI conversion, statement and repayment.
2. A Cashfree card recurring mandate is a separate merchant collection instruction. It is not the bank's card EMI and does not turn FRIEND RIDE into a lender.
3. For ordinary grocery checkout, use Cashfree hosted/tokenized card checkout. Store only gateway references and masked last four digits; never store PAN/CVV/PIN or raw card data.
4. If a bank-approved weekly EMI integration is unavailable, weekly mode must be prepaid orders only.

## Work delivered in this QA branch
- Isolated premium Grocery front-end prototype at `grocery/index.html`.
- Supabase schema draft at `supabase/migrations/202611160001_friendride_grocery_secured_card.sql`.
- Product catalogue seed script at `grocery/catalogue-seed.sql` (416 SKU variants, inactive/draft until seller prices and images are verified).
- This implementation plan.

## Required external approvals before production
- Bank written confirmation for FD-secured card issuance and whether weekly EMI exists.
- Cashfree written approval for grocery merchant category, hosted card checkout, recurring card mandates if required, refunds and marketplace/seller settlement.
- Indian lawyer/CA review of seller-of-record, GST invoicing, consumer disclosures, data protection, and purchase-linked promotional draw.
- Authorized CIBIL/CIC access and explicit consent if FRIEND RIDE itself checks scores. Prefer letting the issuing bank conduct underwriting; FRIEND RIDE admin approval is only for Grocery membership/operational onboarding, never bank credit approval.
- Confirm payment aggregator marketplace/split-settlement eligibility for local shops.

## QA acceptance tests
- Customer cannot see another customer's profile, application, card reference, order or payment.
- Browser never receives Cashfree secret key, Supabase service-role key, card PAN, CVV or PIN.
- No card payment is marked paid from a frontend callback; only verified, idempotent Cashfree webhook can confirm it.
- No order is released to delivery until verified payment success.
- Weekly EMI option remains disabled unless a verified bank plan reference exists and bank_approved=true.
- No purchase-linked draw code can be generated while campaign enabled=false or legal_review_reference is null.
- Refund, duplicate webhook, failed payment, cancelled mandate and seller settlement paths are tested.
- Product seed produces at least 400 unique SKUs; inactive until seller-specific price, stock and images are entered.
- QA only; do not merge to main until regression tests and approvals are complete.

## Rollout phases
1. Grocery catalogue + seller inventory + prepaid card checkout.
2. Customer onboarding + PAN verification through approved KYC provider; store masked data/provider references only.
3. Bank-issued secured-card information/status capture (no FD creation or lien workflow inside FRIEND RIDE).
4. Bank-approved weekly EMI integration only if bank provides documented API/product.
5. Promotional draw module only after legal sign-off; until then disabled.
6. Run QA regression and security review; create PR for human review. Do not deploy production from this branch.
