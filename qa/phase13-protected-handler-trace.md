# Phase 13 — Protected Direct Handler Trace

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`
Source SHA: `701217a6869dc3309c857c81561f80f29ea6860f`
Static inspection only; no runtime execution.

## Confirmed direct handlers
The Admin Controls section in the Admin dashboard markup uses direct `showPage()` calls for:
- `users`
- `driverApprovals`
- `driverDocumentReviews`
- `partnerApprovals`
- `adminOrders`
- `referralApprovals`
- `cashRewardApprovals`
- `paymentApprovals`
- `reports`
- `frReferralAdmin`
- `frStoreReviewAdmin`
- `frDirectCouponReview`
- `frCampaignAdmin`
- `settings`

CRM quick actions also directly call `showPage('adminOrders')`, `showPage('users')`, and `showPage('reports')`.

Partner dashboard quick actions directly call `showPage()` for:
- `partnerOrders`
- `partnerPaymentSettings`
- `catalogue`
- `products`
- `inventory`
- `subscription`
- `referrals`
- `gst`
- `partnerReports`
- `frDirectCouponReview`

## Assessment
This confirms that protected route navigation is not consistently routed through `menuGo()`. It is a **client-side UI authorization concern**, not yet proof of backend data exposure. Some target loaders have additional role/session checks (e.g. driver approval loader checks login and selected admin role); others need function-level and backend review.

## Proposed safe correction (not applied)
- Add a central authorization wrapper to `showPage()` with role route allowlists and intended Admin-to-Partner exception.
- Preserve public/customer navigation and the current role launcher behavior.
- Review routes with mixed use (notably referrals/coupon review) and special Admin access before gating.
- Add browser tests for direct-call route access matrix.
- Verify RLS and RPC on all protected data endpoints.

## Scope / status
No code change in this report. QA branch only. Main/production untouched. No tests run. Release gate remains BLOCKED.
