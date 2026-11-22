# Project Arjuna — Pickup/Drop Google Maps Autocomplete QA Gate

Date: 2026-11-22

## Scope
This QA-only branch is based on commit `bdddec1`. It does not merge, deploy, modify Main, or touch production database state.

## Finding
The ride booking UI has pickup and drop suggestion lists and selected-coordinate validation. The current implementation is backed by OpenStreetMap/Nominatim (not Google Places). Therefore it does **not** satisfy the user's explicit Google Maps autocomplete requirement yet.

## Non-negotiable acceptance gate
- Google Maps/Places autocomplete must be enabled for both Pickup and Drop; typing must produce place suggestions.
- A user must select a suggestion, not merely type an unvalidated string, to establish coordinates.
- Selection must store a valid latitude/longitude pair; editing the selected address must clear stale coordinates.
- Pickup can be initialized from GPS and reverse-geocoded; GPS permission denial must not block manual address entry.
- Drop map-pin selection must set validated coordinates and an address label.
- Both selected places must persist through ride payload creation.
- Google Maps load/API failure must leave an explicit, usable fallback: manual address + map-pin/coordinate validation, never fabricated coordinates.
- Debounce autocomplete requests, handle empty/error states, avoid duplicate submissions, and retain Telugu-first user messaging.
- Tests must cover pickup/drop suggestion selection, stale-coordinate clearing, GPS pickup, map-pin drop, payload serialization, API failure/manual fallback, mobile viewport and keyboard behavior.

## Required configuration
A valid Google Maps JavaScript API key with Maps JavaScript API and Places API (the current supported Places library/API) enabled, plus appropriate billing and HTTP referrer restrictions, is required to validate live Google suggestions. The key must be provided via secure deployment configuration and must not be committed in source or test artifacts. No key was found/provided during this QA pass, so live Google Places cannot be enabled or claimed as tested.

## Next action
Implement a small, isolated Google Places adapter in the QA code branch only, with key loading from a secure runtime configuration. Keep the current manual/map-pin fallback available. Run static, unit, Playwright browser, and mobile-viewport regressions. Do not merge/deploy until live Google autocomplete is tested with a restricted key and the release gates pass.
