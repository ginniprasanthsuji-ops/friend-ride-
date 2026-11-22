# FRIEND RIDE QA recovery status — 2026-11-22

- Branch: `qa/ui-regression-recovery-2026-11-22`
- PR: #34 (Draft; targets `qa/navigation-isolation-fix-2026-11-21`, not main)
- Pre-test checkpoint: `4a3d20588479b4cf85384e6967eec4387f5e3060`
- UI changes: Fresh home service tiles, Cycle Delivery and VidyaSetu entries, notification/profile UI, removal of bottom navigation/FAB as requested.
- Recovery: invoice HTML string syntax corrected; home MutationObserver text updates guarded to prevent repeated DOM mutations.
- Branch safety: restored files from PR base (CNAME, manifests, service worker, assets, tests, docs, migrations); PR no longer deletes those files.
- Tests on this checkpoint: pending. Previous verified QA commit `cc0fb10aa8b7b879c7866beea399461ab9332a03` had 58/58 Playwright, 29 inline scripts, Node 4/4 and Vitest 5/5 PASS, but this is not current-head evidence.
- Release gate: do not merge or deploy until regression and integration checks pass on current head. Main is not modified by this QA branch.
