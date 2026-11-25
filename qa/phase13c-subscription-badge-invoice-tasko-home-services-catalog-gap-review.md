# Phase 13C — Subscription Badge, Invoice, and TASKO/Home Services Backend Catalog Gap Review

Date: 2026-11-26
Project inspected: QA Supabase only (`pqsangtvietawkfgpgfu`)
Branch: `arjuna-x/phase-13-feature-audit`
Status: Read-only catalog inspection. No runtime tests or modifications.

## User requirements in scope
- Separate subscription badge/logo display in the matching role dashboard:
  - Driver subscription badge in Driver dashboard
  - Partner subscription badge in Partner dashboard
  - TASKO subscription badge/logo in TASKO dashboard
  - Home Services Technician Partnership badge in Home Services/Technician dashboard
- Subscription pages/actions are separate by subscription category.
- User-provided Razorpay payment link: `https://rzp.io/rzp/54cMN1g`; clicking the relevant subscription action should open this link. Link configuration and payment confirmation remain to be runtime-verified.
- Invoice watermark requirements: Customer/general invoice uses FRIEND RIDE app logo; Driver/Partner/TASKO/Home Services subscription invoices use their matching badge/logo. Center watermark at 25% opacity; invoice details, GST/tax, charges, totals and customer information must remain readable.
- These options/badges must be integrated within the existing FRIEND RIDE app and corresponding role dashboards, not a separate app/menu.

## Catalog inspection performed
Read-only QA schema queries searched:
- Public table names containing subscription, invoice, payment, task, or service terms
- Public column names containing subscription, or belonging to tables named subscription/invoice/billing/TASKO/home-service
- Public routine names containing subscription, invoice, payment, TASKO, or service terms

## Findings
1. No dedicated subscription, invoice, or billing table appeared in the matching public QA table catalog.
2. No subscription/invoice/payment/TASKO-named public RPC was found in the name search.
3. Service-related tables present include:
   - `fr_service_bookings`
   - `fr_service_categories`
   - `fr_service_provider_applications`
   - `fr_service_providers`
   - `fr_service_requests`
4. Service-related functions present include:
   - `fr_admin_assign_service_provider`
   - `fr_customer_create_service_request`
   - `fr_customer_list_approved_service_providers`
   - `fr_service_provider_update_request`
   - `fr_tasko_provider_transition`
5. The matching column search found `fr_push_subscriptions`, but that table is for push notification subscriptions, not partner/driver/tasko commercial subscription plans.
6. This is a QA catalog evidence gap only. It does not prove frontend behavior or other schemas/projects do not implement these features.

## Evidence / verification limits
- Catalog only: no code/runtime test for dashboard badge visibility, payment-link opening, payment success callbacks, subscription status persistence, expiry/renewal, or invoice watermark output.
- No user/customer data was read.
- Production/Main project was not accessed.
- No DDL, SQL writes, app code changes, deployment, or runtime tests performed.

## Recommended safe next audit steps
- Inspect role/profile/provider table columns and policies for any existing plan/status/expiry fields (catalog only).
- Inspect payment and invoice-related objects/functions using broader naming patterns if available.
- Document the dashboard badge/payment/invoice implementation gap without changing the app.
- Actual implementation and payment verification must wait for explicit safe QA authorization and should use QA only.

## Frozen tracking
- Phase 13B Shared Ride Hardening: 70% FROZEN
- Planning/Checklist: 88% FROZEN
- Overall Audit estimate: 12% FROZEN
- Progress graph: FROZEN
