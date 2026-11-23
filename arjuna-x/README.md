# ARJUNA X — Implementation Foundation

Isolated implementation workspace for the ARJUNA X assistant engine.

**Safety boundary:** This branch is isolated from `main`. No live deployment, FRIEND RIDE backend/auth/payment/schema changes, or production integration has been performed.

## Implemented core
- Task model and guarded state transitions
- Permission tiers (0–2 safe/read/draft; 3 explicit confirmation; 4 special approval)
- Session context isolation with bounded message/fact context
- Orchestrator plan creation, plan validation, and action authorization
- Telugu/English initial intent routing
- AI-provider abstraction and mock provider for tests
- Assistant runtime with fallback behavior
- Sequential guarded task execution with bounded retries (0–3)
- Action ID/description/tier validation, duplicate rejection, cancellation reporting
- Node test suite and GitHub Actions build/test workflow

## Phase 6 readiness checks
- [x] Build/typecheck workflow
- [x] Permission gates
- [x] Session isolation and context limits
- [x] Intent/runtime fallback
- [x] Sequential execution, retry bounds
- [x] Plan/action validation
- [x] Cancellation behavior\n- [x] Cancellation emits one terminal result (no duplicate FAILED/SKIPPED records)
- [x] Tests and CI success on isolated branch

## Not implemented yet
- Production AI provider credentials or live provider integration
- Voice input/output engine
- GPS/location and journey engine
- FRIEND RIDE app integration
- Production executor adapters for real bookings/payments
- Production deployment

## Setup
```bash
npm install
npm run build
npm test
``

## Safety model
The core intentionally uses test/mock providers and abstract executors. Any real-world action adapter must be separately reviewed, enforce user identity and permissions server-side, and require explicit confirmation for tier-3 actions and special approval for tier-4 actions. Never put provider secrets in client code.
