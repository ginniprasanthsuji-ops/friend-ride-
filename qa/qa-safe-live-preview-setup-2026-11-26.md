# FRIEND RIDE QA-safe Live Preview Setup — 2026-11-26

## Work completed
- Updated the QA branch's `index.html` Supabase endpoint and public client key to the FRIEND RIDE QA project only.
- Updated `fcm-web-push.js` Supabase endpoint and public client key to QA project only.
- Added `.github/workflows/qa-live-preview.yml` for GitHub Pages deployment on QA branch pushes and manual dispatch.
- Workflow includes a guard that fails if Production Supabase URL is found in the QA deployment files.

## QA backend
- Project ref: `pqsangtvietawkfgpgfu`
- Endpoint: `https://pqsangtvietawkfgpgfu.supabase.co`
- Production ref `fglyplxcczdjtfwobtzh` is intentionally not used by QA frontend or QA push integration.

## Commits
- Frontend QA backend isolation: `3ce4dbe8e96e72fc88ade38e46f7fdcc8740976d`
- Push integration QA backend isolation: `2796c06c073a8e9447f3d7001d836e246b62fe06`
- Pages workflow: `a6b47b46fce202d5068c80f460e7e110f90e66ba`

## Deployment status
- Workflow was added on the QA branch and branch push should trigger it.
- Deployment status / public URL has not yet been verified through a returned GitHub Actions run.
- GitHub Pages may need repository Pages settings to allow deployment from GitHub Actions.
- Do not claim live deployment succeeded until the workflow run is verified and the URL opens.

## Safety
- No production SQL or migration applied.
- No Production Supabase configuration changed.
- No production deployment performed.
- This setup targets QA only. User-facing test flows may still need QA test accounts, RLS/policy review, and device verification.

## Next
1. Verify GitHub Actions run and Pages deployment status.
2. If Pages settings are configured and workflow succeeds, open the QA preview and visually review app.
3. Capture feature/UI defects and user-approved changes.
4. Complete Phase 13 with remaining evidence, then continue Phase 14 backend SQL audit.
