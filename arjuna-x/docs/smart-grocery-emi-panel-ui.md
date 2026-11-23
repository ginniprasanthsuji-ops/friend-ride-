# Smart Grocery EMI panel UI module

New reusable UI assets:
- `assets/smart-grocery-emi-panel.js`: exposes `window.FRIEND_RIDE_EMI_PANEL.mount(container)` and `unmount()`.
- `styles/smart-grocery-emi-panel.css`: panel styles.

Panel includes DigiLocker explainer + official external link, CIBIL free-report link, optional score/report date entry, consent checkbox, and an unverified score card. It creates the score card using DOM text nodes to avoid rendering user input as HTML.

Integration steps for a route/page: include stylesheet and script, create a mount container, then call `FRIEND_RIDE_EMI_PANEL.mount(container)`. This module is not yet wired to the production navigation or application route. Score currently remains only in panel DOM state and is not persisted or sent to the backend. Consent shown here is for this local capture UX only; actual application data storage/use needs backend consent records and privacy notice.
