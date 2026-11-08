# FRIEND RIDE – gradual TypeScript migration

## Safety rules
- Keep the existing GitHub Pages application and its current HTML/JavaScript behavior intact during the migration.
- Do not replace the production entry point or modify Supabase schema, policies, RPCs, or stored data as part of frontend scaffolding.
- Build new, independently testable TypeScript modules alongside the legacy application.
- Move one feature at a time only after its current behavior is captured by regression tests.
- Keep credentials and privileged Supabase keys out of browser code.

## Layers
- `src/core`: shared primitives and runtime validation.
- `src/domain`: typed business rules, added only after existing rules are verified.
- `src/features`: isolated feature modules (rides, marketplace, partner, admin, support).
- `src/services`: adapters for Supabase and external services.
- `tests/unit`: fast isolated tests.
- `qa`: existing Playwright browser regression suite.

## Migration sequence
1. Establish strict TypeScript checks and unit-test runner.
2. Capture existing behavior with tests before extracting each feature.
3. Extract pure business logic first; keep DOM and Supabase side effects behind adapters.
4. Integrate a migrated module through a small compatibility boundary.
5. Run typecheck, unit tests, existing browser regression, and manual device checks before release.

The first commit intentionally adds tooling and neutral utilities only. It does not change production app behavior.
