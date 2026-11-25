# Phase 13 — Core Ride Payment/QR Draft Static Review (2026-11-26)

## Live QA observations (read-only)
- Dedicated QA project is ACTIVE_HEALTHY.
- `profiles.provider_qr_path` exists.
- `fr_ride_payments` table is absent.
- `provider-payment-qr` Storage bucket is absent; the only current bucket is private `road-ride-driver-photos`.
- Six payment/QR RPCs called by current `index.html` are absent from QA.

## QA-branch draft artifact
`qa/phase13-core-ride-payment-qr-backend-draft.sql` proposes:
- private QR bucket with PNG/JPEG/WebP and 2 MB limit;
- payment table, participant-only SELECT RLS, no client write;
- driver-own-folder QR upload and exact-QR read for a customer's completed ride;
- six RPCs matching current frontend calls;
- 15-minute QR session, UTR uniqueness, customer submission, and assigned-driver manual confirmation;
- contact fallback restricted to assigned-ride status allowlist.

## Static contract assertions executed
The fetched UI and draft text were checked; all listed assertions were true:
- all six RPC names occur in both current UI source and draft;
- private bucket insert/update text exists;
- 15-minute session interval exists;
- UTR unique index text exists;
- customer/approved-driver role guards exist;
- submitted-UTR gate for driver confirmation exists;
- participant-only payment-row read RLS exists;
- contact status allowlist exists.

These checks only verify text/contract presence. They do **not** validate SQL syntax, apply the draft, execute RPCs, test role impersonation, or prove behavior. No SQL was applied.
