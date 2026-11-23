# Phase 7 — approved-stack enforcement checkpoint

This checkpoint continues the app's established role and task workflow while applying the user-confirmed technology restriction globally.

## Fail-closed dependency policy
- Only GitHub, existing Supabase, existing Firebase, and SQL are approved.
- External integrations must not be represented as operational.
- Manual and disabled feature modes are permitted, but integrated mode requires explicit verification.
- The guard is a policy primitive; it does not itself scan app source or prove runtime integrations.
- No schema/migration changes, production SQL, main merge, or deployment in this checkpoint.

## Workflow
1. Feature and role scope is declared.
2. Dependency is classified as approved or blocked.
3. Integrated features require verification evidence.
4. If integration is not available, the feature stays manual or disabled.
5. QA is branch-only; production actions require separate user approval.
