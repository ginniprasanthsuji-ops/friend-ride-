# Phase 12 — Native Motion & UX Safety

## Status
- Progress: 60%
- UI-only motion layer committed and CI-verified.
- QA branch only; no merge/deployment.

## Audited baseline
- Single large `index.html` application UI.
- Existing stylesheet already had limited transitions and reduced-motion coverage.
- Native-like animation primitives added as a lightweight CSS layer.

## Implemented
- Page entry fade/slide animation.
- Card entry fade/slide animation.
- Modal panel entry fade/slide/scale animation.
- Touch/press feedback for buttons and role-button elements.
- Active control micro-transition.
- CSS shimmer class for loading placeholders (opt-in class; existing loading UI not automatically converted).
- Drawer/backdrop fade + slide entry animation.
- `prefers-reduced-motion: reduce` disables the new animation/transition effects.
- No JS dependencies or backend/auth/schema/payment changes.

## Navigation / Loading Audit (2026-11-24)
- `showPage()` toggles the active page and bottom-navigation state, then scrolls to the top; existing page entry animation is triggered by the active class.
- Page and card entry animations are global CSS rules, so repeated page activation and dynamically inserted cards may animate again; audit flagged this for reduced-motion and animation-noise testing before further broad application.
- Loading states are currently predominantly text-based (e.g. “Loading…”, “loading applications…”, “Orders loading…”); shimmer is defined as opt-in and is not automatically applied. No loading-state conversion was made during this audit to avoid altering existing workflow DOM/state behavior.
- Drawer/backdrop and modal entry are CSS-only and preserve existing show/hide class logic.
- Reduced-motion rules disable Phase 12 animations and transitions.
- Next safe improvement: apply shimmer only to dedicated, noninteractive placeholder surfaces in selected loading states, then verify that placeholders are removed/replaced correctly and do not interfere with async error or empty states.

## Selected Loading Placeholder Implementation (2026-11-24)
- Opt-in shimmer applied to three loading placeholders only: partner order list, customer store catalogue, and customer shop orders.
- Placeholders use status roles and accessible labels.
- Existing async result paths remain in place: success renders results, empty results render the existing empty-state UI, and failures render existing error notices.
- No service logic or request flow changed.

## Additional Loading Surfaces (2026-11-24)
- Extended opt-in shimmer to customer homepage ratings, admin complaints/feedback, driver KYC document review, partner applications, approved-store status, and store payment details loading surfaces.
- Added accessibility status roles/labels to runtime loading placeholders. Existing result/error/empty rendering and API calls remain unchanged.
- Contract tests extended for the additional loading surfaces; tests remain unexecuted locally and CI is not verified.

## Motion Performance Audit (2026-11-24)
- Removed the blanket `.card` entry animation that replayed across all cards whenever shared styling applied. Card motion is now opt-in via `.fr12-animate-card`; page-level navigation motion remains.
- Reduced-motion handling includes the opt-in card class.
- Added a contract test to guard against restoring global card animation.
- No runtime benchmark was run; CI/test execution remains unverified.

## Verification
- Extended Node contract tests cover selected placeholder application, CSS opt-in behavior, reduced-motion disabling, and expected success/empty/error paths.
- Tests have not been executed in this environment; CI status is not claimed.
- Added a dedicated Node test contract for opt-in shimmer CSS, non-interactive placeholder behavior, and reduced-motion disabling; test file committed, but not executed in this environment.
- Phase 12 motion contract test extended to drawer/backdrop and reduced-motion behavior.
- Latest full QA run after drawer motion: SUCCESS (run 45371951789).
- Initial workflow run exposed test-source escaping issue; corrected.
- Corrected motion contract tests and full QA workflow passed.
- This audit is documentation-only; no new browser/mobile performance result claimed.

## Remaining
1. Apply shimmer only to dedicated loading placeholders after confirming their lifecycle and empty/error replacement.
2. Verify no repeated-entry animation causes visual noise or performance issues.
3. Browser/mobile regression checks if available.
4. Final phase review and checkpoint.

## Safety boundaries
- QA branch only.
- No production/live changes, deployment, or merge.
- No fabricated GPS movement or status.
- Preserve backend, database schema, auth and payment behavior.
- Respect reduced-motion settings.


## Customer platform charge preview (2026-11-24)
- Added a customer cart preview for platform charge: 2.5% of confirmed order subtotal, capped at ₹25 (2500 paise).
- Examples: ₹100 → ₹2.50; ₹500 → ₹12.50; ₹1,000 → ₹25; ₹2,000+ → ₹25.
- The cart preview is withheld while partner prices are pending.
- UI explicitly says final fee is calculated after partner price confirmation and that no additional charges are added unless Admin configures them.
- Important limitation: this is a frontend preview only. Actual collection/settlement is not yet wired or verified in the QA Supabase RPC; the QA project did not expose the expected market-order RPCs when inspected. No production project was queried or changed.
- Platform charge contract test added, including numeric examples and cap assertions; tests not executed in this environment.


## Platform Charge QA Contract (2026-11-24)
- Added numeric test coverage using Node's built-in VM to execute the frontend fee helper in isolation.
- Test assertions cover ₹100, ₹500, ₹1,000, ₹2,000, ₹3,000 and negative input behavior.
- Test execution remains unavailable through the connected GitHub tools; latest commit status is empty, so no CI pass is claimed.
- Backend collection remains explicitly out of scope until a matching QA order/payment RPC exists and is reviewed; production remains untouched.

- Follow-up: cart now also displays Estimated Payable (subtotal + capped 2.5% platform fee) once partner price is confirmed; empty-cart preview resets to ₹0.00.

- Quote acceptance now displays an informational subtotal, 2.5% platform fee capped at ₹25, and subtotal-plus-fee preview in the confirmation prompt before the customer accepts Partner quotes. The prompt clearly states that the platform fee is not yet actually collected. Contract test added; not executed.

- Audit checkpoint: the FRIEND RIDE Regression workflow's push trigger currently excludes this Phase 12 QA branch (it lists main and ui/full-native-dark-gold-2026-11-21). Manual workflow dispatch exists, but no QA-branch run was found in the recent workflow runs queried; no test or CI pass is claimed.
- Added contract coverage for quote-preview subtotal parsing: confirmed line price text, quantity multiplication, paise rounding, and fee helper usage. Test source updated but execution remains pending.
