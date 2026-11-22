# FRIEND RIDE Fresh Teal + Royal Blue UI direction

## Design goal
A welcoming, premium, light-mode interface for the local-services super app. Keep existing routes, role behavior, backend integrations, auth, payments, and business logic unchanged.

## Palette
- Brand primary / actions: Teal `#0F766E`
- Primary hover: `#115E59`
- Secondary / links: Royal Blue `#2563EB`
- Background: Soft White `#F8FAFC`
- Cards: White `#FFFFFF`
- Text: Deep Navy `#0F172A`
- Muted: Slate `#64748B`
- Borders: `#E2E8F0`

## Service accent guidance
- Rides, Auto, Car: blue
- Bike and Cycle Delivery: teal/green
- Food: orange
- Local shopping: violet
- Parcel/Goods: indigo
- Home Services: cyan
- Laundry: pink
- TASKO/GIGGER: amber
- VidyaSetu: blue-violet

Use colors as small icon/illustration accents, not full-bleed card backgrounds. All cards should remain white with subtle borders/shadows, accessible contrast, consistent rounded corners, and readable Telugu/English text.

## UI principles
- Light mode default; no dark/gold scheme.
- Top header: brand, notification bell, profile avatar.
- Location row: GPS-derived current location and manual change action.
- Search: clear, high-contrast search field.
- Quick ride options followed by a consistent service grid.
- Bottom nav: Home, Orders, Services, Profile.
- Avoid oversized decorative gradients, developer-facing copy, or hard-coded fallback locations.
- Preserve all existing functionality and role access.

## Status
The design tokens are added in `styles/friend-ride-fresh-teal-blue.css` but are intentionally scoped under `.fr-fresh-ui` and not yet linked/applied to the existing app. Integration into the main HTML requires a safely reviewable source diff; the repository connector currently returns the oversized `index.html` with no readable content, so this first commit is design groundwork only, not a live UI change.
