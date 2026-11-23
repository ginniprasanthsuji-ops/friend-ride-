# ARJUNA X — Implementation Foundation

This is an isolated implementation workspace for the ARJUNA X assistant engine.

> Safety boundary: this branch is separate from `main`. No production deployment, FRIEND RIDE backend, authentication, payment, or database changes are made here.

## Current scaffold
- TypeScript core package
- Task lifecycle model
- Permission tier model and gate
- Orchestrator state-transition guard
- Minimal build/typecheck setup

## Status
Foundation scaffold only. Voice, AI-provider, location, service adapters, UI integration, and runtime execution are not implemented yet.

## Setup
```bash
npm install
npm run typecheck
```

## Next
1. Add unit tests for permission and state transitions.
2. Implement context/session isolation.
3. Add provider adapter interface and mock.
4. Add task planner and bounded recovery.
5. Integrate with FRIEND RIDE only on a separately reviewed integration branch.
