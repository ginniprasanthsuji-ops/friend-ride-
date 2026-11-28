# Project X2 Parcel lifecycle source review — 2026-11-28

Branch: `yt-test-1-to-15` only. Source review/static test additions; no database migration applied and no authenticated runtime test performed.

## Verified from source
- Customer create RPC inserts persistent row into `fr_parcel_requests` and generates tracking ID.
- Customer list RPC scopes rows to `auth.uid()` and returns parcel tracking fields without phone numbers.
- RLS enabled; table direct access revoked; authenticated execution granted to explicit RPCs.
- Cancel RPC requires auth, matches parcel id and customer id, and only cancels rows with `status='requested'`; no-match produces an error.
- UI calls create/list/cancel RPCs, awaits list response, displays backend status and addresses, and catches RPC errors.
- Cancel button is rendered only for `requested` status.

## Added regression assertions
Static test asserts cancellation ownership/state guards, RPC grant, tracking field rendering, and no phone display in the customer tracking loader.

## Not verified
- Authenticated runtime create/list/cancel test.
- Driver acceptance and parcel status transitions beyond customer request/cancel; current migration is customer-side persistence.
- Real tracking/notifications/payment/OTP and mobile device behavior.
- Migration deployment to intended QA endpoint; app configured endpoint is not the QA project noted in the readiness audit.

## Safety
No SQL applied, no orders created, no endpoint changed, Main/Production untouched.
