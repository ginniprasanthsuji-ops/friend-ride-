# Phase 13 — Direct Route / Authorization Surface Check

Date: 2026-11-25
Branch: `arjuna-x/phase-13-feature-audit`
Source inspected: `index.html`, SHA `701217a6869dc3309c857c81561f80f29ea6860f`
Scope: static source inspection only. No runtime execution.

## Finding RTA-04 — `showPage(id)` has no role authorization gate (needs review)

The inspected `showPage(id)` function directly activates any matching `.page` element by toggling the active class and then runs selected route loaders. It does not itself validate the current user's role.

The `menuGo(id)` navigation function performs role checks for dashboard/admin/partner routes before calling `showPage(id)`. However, direct calls to `showPage(id)` elsewhere in the application may bypass those checks. The source contains direct calls to protected page IDs, so all call sites and event handlers must be traced before certifying access control.

### Risk
Potential client-side UI access-control bypass if a protected route is activated through a direct handler. Backend RLS/RPC authorization remains the actual data security boundary and must be verified independently.

### Required follow-up
1. Inventory every direct `showPage()` caller and protected page ID.
2. Add a centralized role gate inside `showPage()` or ensure every caller routes through a secure wrapper.
3. Preserve role-specific legitimate access (e.g., Admin access to Partner tools where currently intended).
4. Add regression tests for direct route activation attempts for unauthenticated/customer/driver/partner/admin.
5. Verify backend RLS and RPC checks; UI gates alone are not security.

## No implementation change made
Documentation-only finding. QA branch only. Main/production untouched. No tests executed and no PASS claimed.
