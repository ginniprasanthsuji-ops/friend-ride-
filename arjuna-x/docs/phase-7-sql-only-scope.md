# ARJUNA X Phase 7 — SQL-only scope reset

## User-approved constraint
No new paid APIs, subscriptions, third-party AI providers, external identity/credit/lender integrations, or service purchases. Continue only with features that can be implemented using existing FRIEND RIDE code and Supabase SQL/database capabilities.

## Keep (database-first, existing app code only)
- User preferences: language preference (Telugu default, Hindi/English selectable), stored in existing app preference mechanisms.
- Role/scope data for business assistance (shop-owner, partner, driver, delivery-partner, admin, customer) using existing database authorization and RLS; no AI-generated insights.
- Manual business summaries based on existing database aggregate data, subject to server-side authorization.
- Rider safety records and manual status/ETA/safe confirmation; database can persist status/events. No automatic SMS, calls, push, or server scheduler unless already available without purchasing/configuring an external service.
- Smart Grocery EMI as a **manual Admin quotation/order workflow only**, if existing database and app support it: application record, consent record, manually entered identity/score marked unverified, Admin decision, quotation, order/status/audit. No credit limit claims, no automated lending/credit decision, no DigiLocker/CIBIL/lender API integration, and no guaranteed delivery promises.
- Data validation, permission checks, audit events, test coverage, documentation.

## Remove/de-scope from Phase 7 (requires paid/external services or isn't SQL-only)
- AI chat/completions, AI shopping agent, AI tutor, AI quiz generation, AI business insights.
- AI-provider/runtime wiring and claims of live AI.
- Voice recognition/speech synthesis and voice assistant execution.
- GPS/maps/navigation/nearby lookup as a new Phase 7 feature.
- External DigiLocker verification/API integration, CIBIL bureau data integration, lender/NBFC API, automated credit check/decision/limit.
- SMS/calls/automated SOS escalation or external push services.
- Any new external API keys, subscriptions, provider setup or purchases.

## SQL limitations
SQL can create and validate tables, constraints, indexes, functions, triggers, RLS, and data records. SQL alone cannot provide an AI model, speech engine, GPS/maps service, identity/credit verification, SMS/calls, external lender decisions, or a frontend user experience. Those are excluded unless already provided by the existing app/service and specifically approved.

## Implementation rule
Keep QA branch-only. Before any SQL is executed, inspect the existing schema, prepare a non-destructive migration, verify table/policy conflicts, and use a QA/Test Supabase project only. Do not run production SQL, merge main, or deploy without explicit approval.