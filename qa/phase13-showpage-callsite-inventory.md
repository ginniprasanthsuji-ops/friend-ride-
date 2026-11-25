# Phase 13 — Direct Route Call-Site Inventory

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`
Source: `index.html`, SHA `701217a6869dc3309c857c81561f80f29ea6860f`
Method: static source scan only; no runtime test.

## Inventory
- 140 textual `showPage(...)` call sites found.
- 62 page elements were counted by static markup scan (includes possible non-route/legacy elements; count is not runtime route validation).
- Literal destinations include role dashboards and service/customer routes, plus protected Admin/Partner destinations.
- Dynamic arguments also exist (`id`, `target`, `dashboardFor(dbRole)`, `dashboardFor(role)`), so static literal scan is not complete route coverage.

## Protected destinations found in direct-call scan
Admin-oriented: `users`, `driverApprovals`, `driverDocumentReviews`, `partnerApprovals`, `adminOrders`, `referralApprovals`, `cashRewardApprovals`, `paymentApprovals`, `reports`, `frReferralAdmin`, `frStoreReviewAdmin`, `frCampaignAdmin`, `settings`, `frSuperHub`.

Partner-oriented: `partnerPaymentSettings`, `partnerReports`, and other partner destinations declared in `menuGo` (`partnerOrders`, `catalogue`, `products`, `inventory`, `subscription`, `referrals`, `gst`).

## Existing gate reviewed
`menuGo(id)` declares role-specific dashboard mapping, an admin-page allowlist and partner-page allowlist. It checks login and role (admin can access partner-required routes). This gate applies when callers use `menuGo`, not automatically to direct calls of `showPage(id)`.

## Risk status
Direct-call count and list confirm a broad call surface; they do **not** prove a bypass exists because call-site context and backend enforcement must be checked. `showPage(id)` itself has no role gate, so protected pages could potentially be activated by a direct caller. UI activation is not equivalent to data access; backend RLS/RPC remains critical.

## Next action
Trace each protected direct call to its button/handler and identify whether it uses `menuGo`, direct `showPage`, or another guarded function. Then implement a centralized UI guard only after reviewing intended role exceptions, and add role matrix regression tests. Review Supabase `admin_users` policies and RPC authorization separately.

## Execution status
No tests executed. No code changed. Main/production untouched. QA documentation only.
