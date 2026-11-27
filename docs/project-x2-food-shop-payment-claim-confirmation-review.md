# Project X2 Food/Shop Payment Claim + Partner Confirmation Draft Review

Migration 013 adds customer claim and partner confirmation RPCs.

- Customer claim stores a payment reference and sets payment_status to customer_claimed.
- Partner confirmation changes it to partner_confirmed only.
- This migration deliberately does NOT create a path to payment_status=verified.
- Fulfillment transition gates in migration 011 continue to require verified, so order progress remains blocked until a trusted verification mechanism is designed.
- Claim/confirmation timestamps are added.
- No actual payment provider, bank/UPI verification, or payment evidence validation is implemented.
- Draft only: not applied to Supabase and not runtime-tested.
