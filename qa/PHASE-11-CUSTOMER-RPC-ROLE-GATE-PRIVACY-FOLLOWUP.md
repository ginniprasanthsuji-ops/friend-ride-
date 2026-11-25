# Phase 11 — Customer-facing SECURITY DEFINER RPC Role Gate Follow-up

**QA project:** `pqsangtvietawkfgpgfu`  
**Mode:** Read-only catalog/source inspection. No calls to these RPCs were executed.

## Newly reviewed functions

| Function | anon EXECUTE | authenticated EXECUTE | SECURITY DEFINER | Source role/auth gate |
|---|---:|---:|---:|---|
| `fr_customer_list_approved_service_providers(text)` | No | Yes | Yes | No `auth.uid()` / customer-role gate visible in SQL body |
| `fr_customer_list_approved_stores_geo(text)` | No | Yes | Yes | No `auth.uid()` / customer-role gate visible in SQL body |

## Data returned
- Approved service providers RPC returns provider UUID, display name, **phone**, service area and category slug.
- Approved stores geo RPC returns partner UUID, business name, category, **address and latitude/longitude**.

## Risk / interpretation
The catalog snapshot shows anonymous EXECUTE denied, but authenticated EXECUTE granted. Static function bodies do not show an authentication or customer-role restriction. This may allow any authenticated role to call these functions, subject to function logic and deployed environment; **runtime exploitability has not been tested**.

Potential privacy concern: service-provider phone numbers and store precise coordinates/address are exposed in the returned columns. Confirm whether the app needs all these fields before booking/interaction, and whether role/consent/data-minimization controls exist elsewhere.

## Proposed validation and remediation gate (not executed)
1. Test as Customer, Driver, Partner, Provider, and non-admin authenticated QA users. Confirm intended role access and denied roles.
2. Restrict provider contact details to a consented/authorized flow (e.g., after booking/assignment), if not intentionally public.
3. Review store location exposure; return coarse distance or approximate location for browse and exact coordinates only where required by the UX.
4. If these RPCs are intended customer-only, add an explicit authenticated customer-role check and test.
5. Verify effective grants and deployed source after approved changes.

## Status
Findings recorded for review. **No SQL changes or RPC invocations made; production untouched.** Phase 11 closure remains pending runtime tests and approved remediation.
