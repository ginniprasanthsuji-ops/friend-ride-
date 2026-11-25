# Phase 13C — Invoice Watermark and Subscription Logo Requirement

Status: Requirement captured for implementation planning only. No app changes or runtime validation.

## Invoice watermark rule
Place a watermark logo/badge centered in the invoice background at 25% opacity. The watermark must remain subtle and must not reduce readability of customer details, GST/tax, charges, invoice number, line items, subtotal, totals, or other billing content.

## Logo mapping
- Customer/general invoice: FRIEND RIDE app logo.
- Driver subscription invoice: Driver Subscription badge/logo.
- Partner subscription invoice: Partner Subscription badge/logo.
- TASKO subscription invoice: TASKO Subscription badge/logo (Technician and Non-Technician program).
- Home Services subscription invoice: Home Services Technician Partnership Subscription badge/logo.

## Rendering requirements
- Center watermark in the invoice background, with 25% opacity.
- All invoice text and financial fields remain clearly readable.
- Watermark must not obscure or overlap details in a way that harms readability.
- Same mapping must be applied to on-screen invoice, PDF/download, and print output where supported.
- Select watermark from invoice/subscription type, not from a user-controlled visual toggle.
- Ensure fallback to FRIEND RIDE app logo for general/customer invoices and unknown invoice categories.
- Keep invoice layout and existing billing/tax calculations unchanged.

## Acceptance checklist (not yet tested)
- [ ] General/customer invoice uses FRIEND RIDE app logo watermark.
- [ ] Driver subscription invoice uses Driver Subscription badge watermark.
- [ ] Partner subscription invoice uses Partner Subscription badge watermark.
- [ ] TASKO subscription invoice uses TASKO badge watermark.
- [ ] Home Services subscription invoice uses Home Services Technician Partnership badge watermark.
- [ ] Watermark is centered and opacity is 25%.
- [ ] Customer details, GST, charges, amounts, and invoice totals remain clear.
- [ ] Watermark mapping/opacity persists in print and PDF/download output.
- [ ] Unknown invoice category falls back to app logo.
- [ ] No billing calculations or invoice fields are altered by watermark implementation.

## Audit boundaries
Documentation only. No SQL writes, migrations, application code changes, deployments, invoice generation tests, or production/Main access. Frozen Phase 13 tracking remains unchanged: Planning/Checklist 88%, Overall Audit estimate 12%, progress graph frozen, Phase 13B Shared Ride Hardening 70% frozen.
