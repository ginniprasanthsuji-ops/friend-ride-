# Phase 7B — AI Function Deployment Mismatch Investigation
Date: 2026-11-25
Branch: arjuna-x/phase-7-ai-intelligence-safety
QA Supabase project: pqsangtvietawkfgpgfu

## Investigation results
- GitHub search finds only the release-gate documentation reference to `friend-ride-ai-assistant`; no deployable source file was identified by the scoped searches.
- Read-only QA Supabase Edge Function inventory lists six ACTIVE functions and does not include `friend-ride-ai-assistant`.
- Direct read-only lookup of `friend-ride-ai-assistant` in QA returned NotFoundException / Function not found.
- Therefore the repository release-gate note about an active function and recent 503 invocation logs is not corroborated by current QA function inventory or direct lookup. This may reflect stale documentation, a different project/environment, or a missing deployment; cannot determine which from current evidence.
- No secret values were read or revealed.

## Decision
- AI runtime tests cannot proceed because the target function and source are unavailable in the inspected QA project/repository scope.
- Do not deploy a guessed function, configure secrets, or modify frontend/backend without explicit approval and confirmed source.

## Test status
- Function presence: FAIL / NOT FOUND in QA.
- Source review: BLOCKED.
- Authenticated AI prompt test: NOT RUN.
- Quota/error/role-context checks: NOT RUN.
- Session isolation, cancellation, timeout, Telugu intent, redaction, output isolation: NOT TESTED.

## Changes
- Documentation checkpoint only.
- Code / SQL / secrets / configuration changes: 0.
- Production untouched.
- Phase 7B remains 75%; no implementation or runtime-test evidence added.

## Recommended next action
User/owner must confirm whether AI Assistant is intended to be enabled in QA. If yes, provide/confirm the authoritative function source and approve a QA-only deployment/configuration plan. Then inspect source and build tests before any deploy.