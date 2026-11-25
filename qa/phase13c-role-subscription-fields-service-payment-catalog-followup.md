# Phase 13C — Role Subscription Fields & Service Payment Catalog Follow-up

Date: 2026-11-26
QA project only: `pqsangtvietawkfgpgfu`
Branch: `arjuna-x/phase-13-feature-audit`
Status: Read-only schema catalog inspection; no data reads, runtime tests, or writes.

## Inspected areas
- `profiles`
- `fr_service_provider_applications`
- `fr_service_providers`
- `fr_driver_documents`
- `fr_earnings_ledger`
- `fr_shared_ride_payments`
- Matching column names across public schema for plan/subscription/expiry/invoice/billing/Razorpay/payment
- Matching public routines for Razorpay/subscription/invoice/billing/payment

## Catalog findings
1. The inspected profile and service provider/application tables do not show commercial subscription-plan, subscription status, subscription expiry, invoice, or billing columns.
2. `fr_earnings_ledger` is an earnings ledger, not catalog evidence for subscription billing.
3. `fr_shared_ride_payments` records Shared Ride payments (booking, amount, provider transaction, status, paid/released/refunded timestamps); it is not a subscription-plan ledger.
4. `fr_service_bookings` has payment workflow fields: `payment_status`, `payment_reference`, `payment_submitted_at`, `payment_verified_at`, `payment_verified_by`. This catalog evidence relates to service booking payments, not subscriptions.
5. The broad public routine-name search returned no matches for Razorpay, subscription, invoice, billing, or payment.
6. This only establishes a matching-catalog gap in QA. It does not prove that the UI or external payment-link handoff is absent, and no actual payment flow was tested.

## Requirements remain unchanged
- Driver: Driver Subscription badge/page, in Driver dashboard
- Partner: Partner Subscription badge/page, in Partner dashboard
- TASKO: TASKO Subscription badge/page/logo, in TASKO dashboard
- Home Services Technician: Technician Partnership Subscription badge/page, in relevant technician dashboard
- User's supplied payment URL: `https://rzp.io/rzp/54cMN1g`; clicking the relevant subscribe action must open it.
- Subscription-specific invoice watermark: corresponding role badge/logo.
- General customer invoice watermark: FRIEND RIDE logo.
- Watermark centered at 25% opacity; GST, customer details, charges, totals and invoice text remain legible.
- Menu baseline options from supplied screenshots remain preserved in the same FRIEND RIDE app; add future options there only, do not remove baseline items.

## Follow-up checks pending
- Inspect service-booking payment field constraints/state transitions and RLS catalog.
- Review any payment-link handoff code and invoice rendering code in the QA branch, if safely accessible.
- No payment callback or subscription persistence verified.
- No app code, SQL changes, migrations, deployment, runtime tests, or production/Main access.

## Frozen Phase 13 tracking
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Progress graph: FROZEN
