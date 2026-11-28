# Project X2 QA backend readiness audit — 2026-11-28

## Scope
Read-only Supabase inspection of FRIEND RIDE QA project `pqsangtvietawkfgpgfu`; no schema or data changes were made.

## Findings
- QA project is active/healthy.
- Parcel persistence table `public.fr_parcel_requests` exists and RLS is enabled.
- Food/Shop market-order tables are absent: `fr_market_orders`, `fr_market_order_items`, and catalogue table `fr_partner_catalogue_items` were not found.
- Applied migrations include the X2 Parcel persistence migration and X2 station booking RPC fix, but no Food/Shop schema/order/payment migrations.
- The app's current Supabase URL in `index.html` resolves to project `fglyplxcczdjtfwobtzh` (the `friend-ride` project), not the QA project.
- Food/Shop SQL migrations 005–014 in this branch remain drafts. The draft chain has dependencies and contains a delivery-fee formula (₹20 base + ₹5/km) that is explicitly a placeholder and requires business approval. Payment claim/partner-confirmation state must also be reconciled with the partner order-state transitions before migration.

## Safe next steps
1. Keep all SQL drafts unapplied until migration chain, policies, RPC grants, and state transitions are reviewed.
2. Confirm the intended QA app endpoint and deployment target before changing any client configuration; do not redirect the current app from its configured backend without explicit approval.
3. Build a QA-only migration set after confirming fee policy and payment workflow, then apply to QA only and verify with authenticated E2E.
4. Add authenticated Food/Shop order tests and Parcel lifecycle tests; static tests and launcher/navigation smoke tests are not substitutes.

## Verified CI at commit 8425f1a
- Build: success
- Audit: success
- Project X2 transfer static QA: success
- ERS/RRS static QA: success
- Phase 13D static QA: success
- Playwright E2E: success
- Deploy check was still in progress when this audit was recorded.

