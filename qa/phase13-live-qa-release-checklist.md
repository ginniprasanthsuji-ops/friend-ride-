# Phase 13 — Live QA & Release Verification Checklist

Branch: `arjuna-x/phase-13-feature-audit`
QA only: production/Main is not changed.

## Gate A — Dashboard routing
- [ ] Role selector routes Customer to Customer Dashboard
- [ ] Role selector routes Driver to Driver Dashboard
- [ ] Role selector routes Partner to Partner Dashboard
- [ ] Role selector routes Admin to Admin Dashboard
- [ ] Refresh/back navigation preserves correct role page
- [ ] Unauthorized roles cannot open Admin-only pages/actions

## Gate B — Referral customer flow
- [ ] Customer A generates/refetches referral code
- [ ] Customer B applies valid code
- [ ] Invalid code rejected
- [ ] Self-referral rejected
- [ ] Duplicate apply rejected
- [ ] Referral remains pending until eligibility conditions are met
- [ ] Admin verifies only eligible referral

## Gate C — Reward ledger
- [ ] Admin verification credits referrer exactly ₹50
- [ ] Admin verification credits referee exactly ₹50
- [ ] Repeat verification produces no duplicate credits
- [ ] Each customer sees only their own ledger
- [ ] Rewards are shown as reward ledger entries—not wallet cash—until redemption/wallet integration is approved

## Gate D — Flash Sale
- [ ] Admin create/update/end sale
- [ ] Customer sees active sale only
- [ ] Expired sale hidden
- [ ] Price/discount validation
- [ ] Checkout/order integration is verified before release

## Gate E — Core workflows
- [ ] Customer registration/profile
- [ ] Driver registration/profile photo and approval
- [ ] Partner registration/profile photo and approval
- [ ] Partner catalogue save → customer view → cart → order
- [ ] Ride request → driver accept → trip status → complete
- [ ] Payment confirmation and real ledger-backed amounts
- [ ] QR appears after completion, if required workflow is enabled
- [ ] Home-service request and provider workflow

## Gate F — Messaging/device checks
- [ ] OTP delivery tested with staging configuration and real phone
- [ ] Push notification verified on separate devices
- [ ] Live tracking verified on physical devices
- [ ] Emergency contact/SOS flow is verified (not merely UI)
- [ ] No secrets/API keys committed to repo

## Gate G — Release evidence
- [ ] GitHub Actions test results captured
- [ ] Browser QA results captured
- [ ] Defects listed with severity and owner
- [ ] All release-blocking defects closed
- [ ] Phase 14 readiness review completed
- [ ] Explicit user approval before live deployment

## Status
Checklist is a test plan. Items are not marked passed without recorded test evidence.
