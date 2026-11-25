# Phase 13C — Version 11.1 Menu Preservation + Current Updates Requirement

Status: Requirement captured for implementation planning only. No app code changes or runtime validation.

## Requirement
Use Version 11.1 as the menu/options baseline: all menu options present in Version 11.1 must remain available. Keep the other features/options that have been updated or added in the current work as well.

## Rules
- Preserve every Version 11.1 menu item and option; do not remove or silently hide existing entries.
- Retain the current updated/new options in addition to the Version 11.1 baseline.
- Avoid replacing the V11.1 menu with a reduced menu.
- Reconcile duplicate options carefully: only consolidate if labels/navigation/behavior are confirmed equivalent; otherwise preserve both and flag for review.
- Menu options should continue to route to their correct role-specific screen and feature.
- No role/dashboard cross-routing (e.g., Driver, Partner, Admin, Customer, TASKO, Home Services).
- Any menu restructuring must preserve access to existing V11.1 functionality and newly updated features.

## Acceptance checklist (not yet tested)
- [ ] Compare current menu against Version 11.1 menu source/screenshot/code.
- [ ] Verify all V11.1 options remain.
- [ ] Verify all current updated/new options remain present.
- [ ] Verify menu options route to correct screens.
- [ ] Verify role-based menus do not expose unrelated role options.
- [ ] Verify no duplicate or conflicting menu entries; flag unresolved duplicates instead of deleting.
- [ ] Test menu navigation on QA only after explicit safe testing authorization.

## Audit boundaries
Documentation only. No app code, SQL, migrations, deployment, runtime tests, or production/Main access. Frozen Phase 13 tracking remains unchanged: Planning/Checklist 88%, Overall Audit estimate 12%, progress graph frozen, Phase 13B Shared Ride Hardening 70% frozen.
