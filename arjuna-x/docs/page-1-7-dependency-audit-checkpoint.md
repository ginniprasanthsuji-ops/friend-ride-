# ARJUNA X Phase 7 — Page 1–7 dependency audit (checkpoint)

## Scope decision
Work only with GitHub code, existing Supabase (including existing SQL/migrations), and existing Firebase project/config. No new API, paid provider, subscription, account, or purchase. No production SQL, merge, or deploy.

## Confirmed repo audit findings
- ARJUNA X isolated package is `arjuna-x/package.json`; it uses TypeScript and Node test runner. No runtime AI SDK/provider dependency listed.
- AI provider/runtime modules are present in the Phase 7 scaffold and must be deactivated or removed from active execution paths: `src/core/ai-provider.ts`, `assistant-runtime.ts`, Ginny voice/session/speech modules, business-assistant and assistant chat/intent modules where they imply live AI.
- CIBIL/DigiLocker/Smart Grocery EMI Phase 7 modules are present. De-scope credit bureau/identity/lender integrations and any automated credit decisions. If existing FR database workflows can support manual admin quotations, they may remain strictly manual and labeled unverified.
- Rider safety logic is local state/data logic. Keep manual safe-status, ETA, and records where supported by existing DB/app; de-scope automatic calls/SMS/push escalation unless already operational with existing configured Firebase.
- Existing Firebase project is referenced in `FCM-WEB-PUSH-SETUP.md` (project ID `friend-ride-app`). Setup document says web apiKey/appId are placeholders and token-registration/Edge Function payload needs verification. Thus Firebase is existing, but this branch cannot claim background push is active without tests.
- Root README documents current frontend features and explicitly says background push is not fully activated by frontend files alone; server-side sender, subscription/token storage, and payload verification are required.
- Supabase production and QA migration histories were previously read-only inspected. Preserve all applied migrations and existing tables, policies, data, triggers, functions, and app workflows. No migration changes or SQL execution in this checkpoint.

## Page 1–7 audit status
| Page | Audit disposition |
|---|---|
| Page 1 | Keep existing app/database-backed functionality. Remove/deactivate new paid AI/API dependencies. |
| Page 2 | Keep existing SQL-supported workflows, auth/RLS and existing configured integrations only. |
| Page 3 | Prior audit reported core ride/service navigation, booking validation, location manual/GPS flows; GPS/map service additions remain outside Phase 7 scope unless existing app integration already configured. |
| Page 4 | Pending source-by-source audit against existing app and DB. |
| Page 5 | Pending source-by-source audit against existing app and DB. |
| Page 6 | Keep only the previously built local lifecycle/orchestrator/task/permission/state-machine logic if provider-free; audit its call graph for AI/voice/external service references. |
| Page 7 | Scope reset confirmed; AI/voice/CIBIL/DigiLocker/lender/paid-service scaffolds are not eligible for active features. Cleanup and tests pending. |

## Next cleanup steps (non-destructive)
1. Search all Phase 7 modules for provider imports, network calls, voice APIs, external service links, CIBIL/DigiLocker/Zoom, and paid-service wording.
2. Remove/deactivate those from active exports and UI paths without touching FRIEND RIDE existing features or applied SQL.
3. Keep provider-free core task/state/permission modules and manual SQL-backed workflows only.
4. Run TypeScript build and native tests; then report exact failures/results.
5. Firebase push is treated as “existing but unverified/partially configured,” not “working,” until QA proves delivery.

## Guardrails
- QA branch only.
- Preserve SQL migration history and production data.
- No production SQL, main merge, or deployment.
- No new external service or purchase.
