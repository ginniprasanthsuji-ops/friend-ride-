# Phase 13C — Version 11.1 Menu Requirement (Exactly 8 Options)

Status: Requirement clarified and documented. Exact option labels still need verification from the V11.1 source/screenshot. No app code changes or runtime validation.

## Clarified requirement
The Version 11.1 menu must contain **exactly 8 menu options only**. Do not add extra menu entries beyond those eight. Preserve the existing V11.1 eight-option set; current updates/features should not cause the menu count to grow beyond eight unless the user explicitly approves a replacement/addition.

## Rules
- Menu count: exactly 8 options.
- Use the eight menu options from Version 11.1 as the source of truth.
- Do not invent option labels or claim to know the exact eight until the V11.1 menu source/screenshot is inspected.
- Current updated features must be retained, but should not be added as extra menu items beyond the eight without explicit approval; they may remain available through the appropriate existing menu/role screens.
- Keep role-specific routing correct (Customer, Driver, Partner, Admin, TASKO, Home Services); avoid dashboard cross-routing.
- Do not silently remove or rename any of the eight V11.1 options.

## Acceptance checklist (not yet tested)
- [ ] Verify the exact V11.1 menu source and record its eight labels.
- [ ] Confirm exactly 8 menu options are present.
- [ ] Confirm no extra options are added.
- [ ] Confirm all eight route to their correct screens/features.
- [ ] Confirm current updates remain accessible without increasing the menu beyond 8.
- [ ] Confirm role-based menu routing and access boundaries.
- [ ] QA navigation tests only after explicit safe testing authorization.

## Audit boundaries
Documentation only. No app code, SQL, migrations, deployment, runtime tests, or production/Main access. Frozen Phase 13 tracking remains unchanged: Planning/Checklist 88%, Overall Audit estimate 12%, progress graph frozen, Phase 13B Shared Ride Hardening 70% frozen.
