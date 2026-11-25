# Phase 12 — Privacy-Safe RPC Implementation Draft (NOT APPLIED)

Branch: phase-12-implementation-plan  
QA project: pqsangtvietawkfgpgfu

## Draft decisions
- Keep precise driver location data internal to dispatch/authorized active ride flows.
- Customer pre-booking nearby-driver RPC should return coarse coordinates (round to 2 decimals, roughly kilometer-scale; note latitude/longitude scale varies) and omit driver UUID/raw update timestamp. Consider availability count instead of pins if app does not require a map.
- Driver request list should use an explicit projection, not `SETOF rides`. Pre-acceptance fields proposal: request token/ride ID, vehicle type, rounded pickup coordinate, rounded drop coordinate (or omit drop entirely if destination privacy is prioritized), fare offer, status, request-created time. Omit customer UUID, notes, exact address text, exact coordinates, agreed fare, completion fields and unrelated columns. Exact pickup detail only after acceptance through existing authorized details RPC.
- Provider listing should omit phone until consent mechanism and UI are verified.
- Public feedback: safest interim output is aggregate rating/count only; disable public message/name output until explicit consent + moderation are implemented.

## Caller/UI compatibility gate
Before applying, search app code for these RPCs and field usage:
- `fr_customer_list_nearby_drivers`
- `get_driver_requests`
- `fr_customer_list_approved_service_providers`
- `fr_public_homepage_feedback`

Map consumers; update interfaces and UI together. No field removal until consumers are accounted for. Confirm driver accept workflow still obtains exact pickup via authorized RPC after accept.

## Draft SQL shape (conceptual; not executable migration)
1. Replace nearby-driver return projection with rounded latitude/longitude and a stable non-identifying display token only if map pins need it. Avoid returning driver UUID and exact update time. Radius filtering continues using exact stored coordinates internally; online/approved/recent filters remain server-side.
2. Replace driver-request RPC return type with an explicit table projection. Since PostgreSQL cannot change a function return type in-place, migration must drop/recreate the function or use a new versioned RPC name and update clients. Prefer new versioned RPC to reduce deployment risk.
3. Create a new provider-list RPC version with phone excluded, then migrate client caller.
4. Create feedback aggregate RPC (rating average/count only), revoke anonymous access to raw public-feedback function until consent/moderation path exists.

## Consent/moderation schema proposal
- Add provider phone-display consent boolean + timestamp + consent version (default false/null), with explicit provider UI action.
- Add feedback public-display consent boolean + timestamp + consent version; default false.
- Add moderation status or reuse existing status only after enumerated status values and admin workflow are verified. Explicit consent and admin moderation both required before publishing identifiable content.
- Never infer consent from existing `show_on_homepage` without verifying its UX/meaning.

## Security/deployment checklist
- Check RPC execute ACLs and role gates.
- Verify approved-driver/customer/admin checks remain.
- Verify exact active-ride detail RPCs are scoped to assigned driver/customer.
- Test pre-accept vs post-accept responses with role-separated test accounts.
- Test app compatibility, map/dispatch, ride acceptance, provider listing/contact, feedback display.
- Rollback path and migration reviewed.
- QA-only project confirmed; approval required before execution.

**Status:** Draft only. No SQL applied. No app source changed. Runtime privacy tests not run.
