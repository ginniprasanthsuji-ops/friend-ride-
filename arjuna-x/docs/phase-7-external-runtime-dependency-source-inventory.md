# Phase 7 — External runtime dependency inventory (static source scan)

Date: 2026-11-23. QA branch source scan only; no runtime network test and no production changes.

## Unique URL literals/templates found in root index.html
- unpkg.com — Leaflet CSS/JS distribution CDN
- cdn.jsdelivr.net — Supabase JS library distribution CDN
- fineducation.space — external financial services link
- fineducationinstitute.online — external business link
- fglyplxcczdjtfwobtzh.supabase.co — production Supabase project URL literal in source
- nominatim.openstreetmap.org — geocoding/reverse-geocoding API
- `{s}.tile.openstreetmap.org` — map tile service
- wa.me — manual WhatsApp links/contact share
- W3C SVG namespace — XML namespace, not an API integration

## Restrictions alignment / review
- Production Supabase URL literal is an important environment isolation issue. Confirm runtime config uses QA endpoint in QA builds and production endpoint only in production release; never run writes against production during this audit.
- Nominatim and OSM tile services are external map/geocoding dependencies. They are currently source-present, but user restriction disallows external map APIs; requires a product decision to disable/de-scope map/geocoding features or approved alternative, not silent removal that breaks ride flow.
- WhatsApp URLs are manual contact/share links (no API automation evidence in this static scan); nevertheless manual links are a restricted feature and should be explicitly disabled or relabeled as manual-only per approved scope.
- Leaflet and Supabase JS CDNs are distribution dependencies; removing them without bundling/local alternative would break runtime. Document as dependencies for policy review.
- Financial external links are navigational links; review whether user wants these modules active.
- Static URL scan cannot reveal dynamic URLs, imported modules, secrets, all external calls, or runtime network requests.

## Follow-up
1. Confirm QA/prod Supabase endpoint separation through build config, without exposing secrets.
2. Identify geocoding/map code paths and mark external-provider calls disabled/manual where restriction requires.
3. Preserve ride-booking functionality and no backend/schema changes.
4. Run network/runtime tests only in QA after user approval and with approved services.

## Status
Source static scan done. No code changes in this checkpoint. No SQL, storage writes, deployment, or production modifications.
