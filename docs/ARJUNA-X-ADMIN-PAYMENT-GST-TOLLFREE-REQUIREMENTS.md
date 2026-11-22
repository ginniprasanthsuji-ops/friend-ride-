# ARJUNA X — Admin Configurable Payment, GST & Toll-Free Requirements

**Added:** 2026-11-22  
**Status:** User-confirmed requirements; implementation deferred to the planned Admin/Integrations phase.  
**Scope:** FRIEND RIDE subscription collection, invoice tax configuration, homepage contact number.

## 1. Subscription payment gateway
- The current app does not yet have the subscription-collection gateway integration requested by the user.
- Provide a future Admin-configurable gateway integration/settings area so the owner can connect a payment gateway and collect subscription amounts.
- Keep the first scope focused on partner/provider subscription fees; do not silently alter ride/customer payment flows.
- Admin configuration must be protected, with credentials/secrets handled through secure server-side configuration/secrets—not exposed in frontend source or public repository.
- Support a safe disabled/unconfigured state: no gateway means subscription payment collection shows a clear unavailable/manual status rather than pretending payment succeeded.
- Verify gateway KYC/merchant onboarding and settlement requirements before enabling live collection.
- Test in sandbox first; no real-money tests without explicit owner approval.

## 2. GST configuration and invoice behavior
- GST registration has not yet been obtained by the owner; GST must therefore be disabled/unconfigured by default.
- Admin settings should be designed to accept GST details when registration is obtained (e.g. GSTIN, registered legal name/address, applicable tax configuration and invoice fields, subject to validation and accountant/legal confirmation).
- Invoice/receipt generation should read a single Admin-controlled tax configuration source. When valid GST configuration is enabled, calculate/display configured tax and tax breakdown on the invoice; when disabled/unregistered, do not add GST or show an invented GSTIN/tax claim.
- Preserve invoice/receipt generation without GST during the unregistered state.
- Tax configuration changes should be auditable and effective-date aware if feasible; historical invoices must not be silently rewritten.

## 3. Toll-free number in Admin and homepage
- Add an Admin setting for the official toll-free/contact number, initially empty/unconfigured.
- When Admin saves a valid number, display it on the FRIEND RIDE homepage in a clear contact/help section.
- Homepage must not show a fake placeholder as a live number. If not configured, hide the number or show a non-numbered support/contact prompt.
- The user intends to integrate a toll-free calling service later. Keep the number display separate from any call-provider/IVR integration; future call integration should be configurable and require its own verification.

## 4. QA acceptance checklist
- [ ] Subscription gateway is configurable by authorized Admin only.
- [ ] No secrets are stored in client source, repository, or logs.
- [ ] Gateway unconfigured/disabled state is clear and safe.
- [ ] Sandbox collection flow verified; live collection gated by owner approval.
- [ ] GST is disabled/unregistered by default and invoices remain non-GST.
- [ ] Valid tax configuration can be enabled later; invoice tax totals and breakdown use one source of truth.
- [ ] Historical invoices remain unchanged after tax-setting updates.
- [ ] Admin can save/clear toll-free number.
- [ ] Homepage reflects configured number and hides invalid/unconfigured number.
- [ ] Toll-free telephony integration is explicitly deferred, not represented as completed.

## 5. Phase placement
- Phase 2: document current gateway/tax/contact configuration footprint and risks.
- Phase 8: implement Admin configuration and integration after existing payment flows are inventoried and protected.
- Phase 10: regression, sandbox verification, invoice tax-state checks, homepage contact visibility tests.
