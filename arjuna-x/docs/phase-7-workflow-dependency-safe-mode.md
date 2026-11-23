# Phase 7 — workflow dependency safe-mode catalog

## Workflow preservation
The catalog keeps FRIEND RIDE's existing role-based workflows represented: customer ride/order, driver lifecycle, partner quote/order, delivery/parcel/home services, TASKO, Laundry, Learn/Teach, and Admin approvals/complaints. These are marked **manual** pending direct integration verification; this is a safety label, not a claim that live runtime is disconnected or operational.

## Disabled provider-dependent features
Payment gateway processing, external AI/model APIs, external voice, Zoom, CIBIL/bureau APIs, DigiLocker, external maps/GPS providers, WhatsApp/calling providers, and lender/NBFC APIs or automated credit decisions are explicitly disabled in the Phase 7 catalog.

Firebase push delivery is manual/unverified. Do not claim push notifications are operational until the existing Firebase setup and trusted sender are tested.

## Validation
A typed catalog and unit test validate approved dependencies and fail-closed feature lookup. Tests are committed but have not been executed by GitHub Actions at this checkpoint.

No production SQL, migration changes, merge, or deployment.
