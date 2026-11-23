# FRIEND RIDE — Global technology restriction (user-confirmed)

## Approved technologies only
- GitHub: source code, UI, app logic, tests, CI/workflows.
- Supabase: existing project, database, SQL, Auth, RLS, existing Edge Functions and storage.
- Firebase: existing project/configuration and already available features only.
- SQL is allowed as the database language inside the existing Supabase database.

## Strict exclusion
Do not introduce, integrate, retain as an active dependency, or require any other provider, API, SDK, subscription, paid service, external account, or purchase. Examples to de-scope include AI model APIs, voice providers, Zoom, DigiLocker, CIBIL/bureau APIs, lender/NBFC APIs, SMS/OTP providers beyond already-existing Supabase Auth/Firebase-supported setup, external map/GPS APIs, payment gateway integrations such as Cashfree, and third-party WhatsApp/calling services.

Existing integrations that depend on other providers are to be reviewed and disabled/de-scoped in app code/UI, not silently represented as operational. Manual UPI or external-link instructions may only remain as plain user-entered/manual workflows if they do not require an integration; clearly label these as manual and do not claim verification.

## Preserve existing data and migrations
- Preserve all already-applied SQL migrations, production/QA data, tables, policies, functions, triggers, and storage objects unless the user separately authorizes a specific safe migration.
- Do not delete or rewrite migration history.
- No production SQL execution, merge to main, or deployment without explicit user approval.

## Page 1–7 / whole-app audit rule
Apply this restriction to the entire FRIEND RIDE app, all pages/routes, admin panels, role workflows, notifications, payment, ride, delivery, education, TASKO, laundry, and ARJUNA X. Any feature requiring a prohibited external dependency must be disabled/de-scoped or redesigned to use only the approved stack. Retain only functionality that is feasible with GitHub code and the existing Supabase/Firebase setup.

