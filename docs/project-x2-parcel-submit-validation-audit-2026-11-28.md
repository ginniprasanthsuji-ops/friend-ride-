# Project X2 Parcel request submission QA — 2026-11-28

Branch: `yt-test-1-to-15`.

## Source verified
- Required parcel fields are checked before RPC.
- Sender and receiver mobile values are digit-normalized and validated as 10 digits.
- Customer role/login is required.
- Weight is bounded to >0 and <=100 kg (UI input step/min and server constraint).
- Submit button is disabled during the request and restored in finally.
- UI awaits `fr_customer_create_parcel_request`, validates returned parcel ID/tracking ID, then refreshes tracking and navigates.
- Regression checks added for these source contracts.

## Remaining risks
- Parcel creation RPC has no request idempotency key; a network retry after the backend inserted a row but before the client received response can create duplicate parcel requests. Backend request-key/idempotency design is needed before real-order release.
- Driver acceptance, payment collection, OTP issuance, delivered/completed transitions are not implemented in this migration. Current Parcel migration is customer persistence/list/cancel only.
- No authenticated runtime/device test performed.
- No migration applied or backend changed in this continuation.
