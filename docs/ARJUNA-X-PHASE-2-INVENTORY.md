# ARJUNA X — Phase 2 Repository & Assets Inventory

**Project:** ARJUNA X (internal codename) / FRIEND RIDE (app brand)  
**Phase:** 2 — Repository & Assets Inventory  
**Branch:** `arjuna-x/phase-2-repository-assets-inventory`  
**Source branch:** `arjuna-x/phase-1-scope-lock`  
**Inventory date:** 2026-11-22  
**Repository:** `ginniprasanthsuji-ops/friend-ride-`

## Scope and safety
This is a source-tree/config/documentation inventory only. No app runtime code, Supabase schema/data, auth, payment, main branch, or live deployment was changed. Findings describe file/config presence, not feature completion or runtime proof.

## Repository snapshot
- Recursive tracked-tree inventory returned **74 paths**.
- Root app entry: `index.html` (reported tree size ~1,026,144 bytes; connector cannot reliably provide readable full content due to size).
- Single-page frontend with modular TS/JS assets and Supabase integrations.
- PWA manifests: `manifest.webmanifest` and `manifest.json`; service-worker files: `service-worker.js`, `sw.js`, plus `firebase-messaging-sw.js`.
- Existing project docs include Blueprint, Clean Restart baseline/inventory, architecture migration, notification setup, QA release gate and service-specific QA docs.

## Asset / branding inventory
| Asset | Observed | Verification |
|---|---|---|
| `icons/icon-192.png` | Present, 2,852 bytes | Image content not visually inspected in this inventory |
| `icons/icon-512.png` | Present, 3,392 bytes | Image content not visually inspected in this inventory |
| `manifest.webmanifest` | Present; references 192 and 512 icons | Confirmed by source |
| `manifest.json` | Present; references root GitHub Pages path | Confirmed by source |
| User-uploaded FRIEND RIDE logo (FR/location-pin mark, Navy/Orange/White) | Supplied in conversation | Not yet copied to repo or confirmed as the current icon asset |
| Other logo/splash/role assets | No dedicated filenames found in listed tree | Need inspect existing icons and image references in HTML |

**Brand lock:** Official logo reference is the user-uploaded image; brand palette Navy Blue + Orange + White. The existing teal/royal-blue UI design document is legacy/conflicting guidance and must not override the locked ARJUNA X brand direction.

## App modules / source footprint
- `index.html`: large SPA entry; connector cannot return full readable source for a complete route inventory in this pass.
- Ride contact: `src/ride-contact.ts`, `assets/ride-contact.js`, `tests/ride-contact.test.cjs`.
- Driver KYC upload: `assets/driver-kyc-upload.js`.
- Education: `learn-teach.js`, `learn-teach.css`, marketplace Playwright spec.
- Core TypeScript: `src/core/result.ts`, `src/core/validation.ts`.
- TASKO/GIGGER and Laundry: SQL migrations, specs and checklists.
- Cycle-delivery pricing migration exists.
- Supabase migrations present: TASKO/GIGGER workflow, Laundry workflow, cycle delivery pricing, Learn/Teach marketplace and provider policies. No migrations applied during Phase 2.
- Service areas from scope: rides, food, grocery/local shops/catalog/multi-shop, parcel/goods, home services, TASKO/GIGGER, Laundry, VIDYA SETU, finance/digital service links, customer/driver/partner/provider/admin roles. Presence in scope does not mean current functionality is verified.

## Test infrastructure inventory
### Package scripts (observed)
- `npm test`: Playwright tests (configured testDir `qa`)
- `npm run test:unit`: Node test runner for `tests/*.test.cjs`
- `npm run typecheck`: TypeScript check of ride-contact module
- `npm run build:runtime`: build ride-contact runtime to `assets/ride-contact.js`
- `npm run test:core`: Vitest
- `npm run typecheck:core`: core TypeScript project check

### Playwright configuration (observed)
- `testDir: ./qa`
- Timeout 45s; retries 1; list + HTML reporters.
- Default `baseURL` points to GitHub Pages production unless `FRIEND_RIDE_BASE_URL` is supplied.
- Headless Chromium; trace retained on failure.
- **Safety finding:** For Phase 2/QA, set `FRIEND_RIDE_BASE_URL` explicitly to a local/isolated test server. Never run mutation-oriented tests against production by accidentally using the default.

### Existing specs/files (observed)
- `qa/friend-ride.spec.cjs` — broad browser regression suite.
- `qa/tasko-laundry.spec.cjs`, `qa/tasko-laundry-main-regression.spec.js`, `tests/tasko-laundry-main-regression.spec.js`.
- `qa/dark-gold-route-regression.spec.js` and `qa/dark-gold-migration-checklist.md` — legacy theme-specific QA artifacts; not authoritative for the new Navy/Orange/White scope.
- `tests/learn-teach-marketplace.spec.js`.
- `tests/ride-contact.test.cjs`.
- `tests/unit/result.test.ts`, `tests/unit/validation.test.ts`.
- `qa/read-only-regression.sql` — SQL QA file; must be reviewed before use and remain read-only.
- `test.html` exists as a QA/demo page; inspect its mode/behavior before using.

## CI/workflow inventory
| Workflow | Trigger observed | Main concern |
|---|---|---|
| `quality.yml` | push main; PR main | typecheck, unit/core tests, runtime build, Playwright |
| `friend-ride-regression.yml` | push main and legacy dark-gold branch; manual; scheduled | local server and Playwright; trigger branch list is legacy/incomplete |
| `friend-ride-workflow-regression.yml` | push to old integration branch; PR main | inline JS and Learn/Teach syntax/source checks |
| `tasko-laundry-main-regression.yml` | push old integration branch; PR main with paths | targeted TASKO/Laundry/Admin Playwright |

**CI gap candidates:** trigger branch names are not aligned with the ARJUNA X branch; test suite names/coverage and safety controls need consolidation later. No workflows were executed in Phase 2, so no CI result is claimed.

## Notifications / PWA inventory
Observed files: `fcm-web-push.js`, `firebase-messaging-sw.js`, `fr-notification-fallback.js`, `service-worker.js`, `sw.js`, setup doc and two manifests.
- Multiple service-worker files create registration/version/scope duplication risk; actual registrations and precedence still need source-level audit.
- FCM setup document states web config placeholders and token-registration verification are required; background push not considered ready based on file presence.
- Need inventory registration sites, permission UX, token/subscription storage/cleanup, server dispatch path, fallback polling/realtime, deep links, Telugu voice capability and device-state matrix in dedicated notification audit.
- PWA manifest duplication and path/scope differences require reconciliation.

## Integration/config inventory
- Supabase integration and migrations documented; exact current runtime configuration/contract inventory requires full source access.
- Google Maps/Places is a requirement, but baseline document says current autocomplete uses Photon/OSM; secure Google Places setup and migration remain future work.
- SMS/APITXT, payment/Cashfree, maps, Firebase push, Zoom, finance/travel/health external links need integration-by-integration contract audit.
- Secrets must remain in environment/secret storage; no credentials copied into docs.

## Conflicts / legacy artifacts
1. Existing `docs/ui/fresh-teal-royal-blue-design.md` says Teal + Royal Blue; ARJUNA X locked branding is Navy + Orange + White. Treat teal doc as legacy and do not apply.
2. Theme-specific dark/gold tests/checklist are legacy and must not drive UI decisions.
3. Two manifests and multiple service-worker candidates exist.
4. Playwright default URL is production; local/isolated target must be explicit.
5. Root SPA source too large for full route/screen inventory from this connector pass; Phase 2 is not yet fully complete.

## Phase 2 completion checklist
- [x] Repository tree and tracked file count inventoried.
- [x] App entry and architecture footprint identified.
- [x] Existing test scripts and Playwright config reviewed.
- [x] CI workflows and trigger gaps inventoried.
- [x] PWA/manifests/service-worker files identified.
- [x] Branding/logo assets filenames inventoried; visual identity binary verification pending.
- [x] Legacy/conflicting UI and test docs identified.
- [ ] Full route/screen inventory from `index.html` (source too large for connector read; needs a safer local/source inspection method).
- [ ] Visual inspection of icon assets and confirmation whether uploaded logo is already present.
- [ ] Exact API/RPC/Edge Function and role-permission inventory.
- [ ] Notification registration/dispatch path audit.
- [ ] Phase 2 final review/acceptance.

## Current status
**Phase 2 — IN PROGRESS (inventory pass 1 committed).** This report records confirmed tree/config/doc findings and open inspection items. No runtime app code, backend, database, auth, payments, main, or live deployment was changed.
