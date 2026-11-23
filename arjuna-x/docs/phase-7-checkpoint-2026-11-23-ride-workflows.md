# Phase 7 Checkpoint — Ride and Service RPCs

## Review completed this turn
- Source review of ride accept, counter-offer, counter acceptance/decline, start, and completion RPCs.
- Source review of customer service request creation and provider status updates.
- Source review of TASKO provider transition and Laundry provider transition.
- Positive controls documented: role/approval checks, ownership predicates, state predicates, TASKO/Laundry row locking, notifications, live-location cleanup.
- Follow-ups documented: driver concurrent ride acceptance/counter race; counter-offer fare policy maximum; pricing boundaries; service/provider role and state tests.

## Estimated phase progress
Approximately 84% (engineering estimate; not test completion).

## Still pending
- Remaining RPC body review, especially location/detail read RPCs and notification/public RPCs.
- Table/column permission allowlist and migration proposal finalization.
- Fake-account runtime tests, RLS/API/storage tests, regressions, final security gate.

## Safety
Catalog/source read only. No RPC mutations, SQL migrations, grants/revokes, production modifications, main merge or deployment.