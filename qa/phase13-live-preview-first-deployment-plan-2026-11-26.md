# FRIEND RIDE — QA Preview Deployment Preparation

**Date:** 2026-11-26  
**Dedicated preview branch:** `phase14-qa-live-preview`  
**Purpose:** Let the user visually inspect the current app using QA database only before resuming Phase 13/14 completion work.

## Changes committed on the dedicated preview branch
1. Changed frontend Supabase URL from production project `fglyplxcczdjtfwobtzh` to QA project `pqsangtvietawkfgpgfu`.
2. Changed publishable key to the QA project's publishable key.
3. Added GitHub Pages deployment workflow, push-triggered on this preview branch and manual dispatch.
4. Workflow stages only the app entry and required app assets/scripts into a `site/` folder; it excludes the repository QA reports and other repository files from the published artifact.
5. No database writes, schema migrations, production configuration edits, or production deployments were made.

## Deployment verification status
- Workflow source committed: yes.
- Automatic push trigger is configured: yes.
- GitHub Pages project/repository setting confirmed enabled: no.
- Actions runner execution/status confirmed through available connected tools: no.
- Public preview URL confirmed live: no.

**Do not claim deployment success until GitHub Actions shows a successful Pages deploy.** If Pages is not enabled for this repository with GitHub Actions as the source, the workflow may fail or require repository Settings > Pages configuration.

## Safety
- This preview branch points only to the separate QA Supabase project.
- QA project has fewer tables/migrations than production; some screens/workflows may show missing data or incomplete behavior.
- Public preview is a frontend QA view, not release certification. Use test accounts/data only.
- Production project remains untouched.

## Next
1. Verify GitHub Actions run and Pages URL (manual confirmation is required because connected tools cannot confirm the deployment status).
2. Open the preview on mobile and inspect appearance/navigation/features.
3. Record user feedback and remove/deactivate unwanted features or correct UI issues on preview branch.
4. Resume Phase 13 completion after live preview feedback; Phase 14 remains paused at its SQL audit roadmap baseline until Phase 13 is closed.

**Current status: QA-only preview branch/config/workflow prepared; actual live deployment not yet verified.**
