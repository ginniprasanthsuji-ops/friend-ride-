# Ginny AI H1 Assistant Integration

## Product identity
- AI H1's user-facing name is **Ginny**.
- Assistant greeting: Telugu default, Hindi for Hindi locale/selection, English when selected.
- Keep ARJUNA X as the product/project identity; Ginny is the AI assistant identity only.

## Welcome strings
- Telugu: **Ginny మీ కోసం!** / **హాయ్! Ginny మీ కోసం. ఈరోజు మీకు ఏం సహాయం చేయాలి?**
- Hindi: **Ginny आपके लिए!** / **नमस्ते! Ginny आपके लिए है। आज मैं आपकी क्या मदद करूँ?**
- English: **Ginny is here for you!** / **Hi! Ginny is here for you. How can I help today?**

## UI integration requirements
1. Replace visible AI H1 assistant label with **Ginny**; do not rename the ARJUNA X app/project.
2. Use getGinnyCopy(locale) for welcome, short welcome, text input placeholder, voice listening prompt and language label. Do not duplicate hard-coded copy in UI.
3. Locale detection supports te, te-IN, hi, hi-IN, en and en-*; unknown or missing locale falls back to Telugu.
4. Greeting may include the user's display name only when it is available and non-empty; do not invent a name.
5. Language can be explicitly switched by the user. Persist selected language using the app's existing preferences mechanism; do not introduce a new storage dependency in this core module.
6. Voice recognition and spoken responses must use the selected language. If speech capability or language voice is unavailable, show a clear fallback and allow text chat.
7. Respect existing AI H1 permissions, safety confirmations, privacy and cancellation behavior; localization must not bypass those checks.
8. UI should show a friendly listening state using voicePrompt; only show listening after microphone permission and capture actually start.

## Acceptance checks
- [ ] Header/assistant branding says Ginny.
- [ ] Telugu default greeting renders on supported Indian locale / no locale.
- [ ] Hindi greeting renders for Hindi locale or explicit selection.
- [ ] English greeting renders for English locale/selection.
- [ ] Name personalization is optional and uses supplied profile display name only.
- [ ] Input placeholder, voice prompt and language label switch together.
- [ ] Text fallback works if speech is unsupported or denied.
- [ ] Existing safety/permission checks remain unchanged.
- [ ] Regression tests execute successfully in CI before merging.


## Avatar presentation update
- Ginny AI H1 uses a **male-presenting avatar**; assistant name stays Ginny.
- Visual theme: friendly South Asian male avatar, navy-and-gold outfit, headset, gold circular frame on deep navy background.
- Prefer masculine voice presentation when available, but voice selection follows language support and user preference.
- Localized avatar alt text is provided by `ginny-avatar-profile.ts`.
- Generated avatar concept exists in this conversation; image asset has not yet been uploaded into the repository or wired into UI.


## Product brand boundary
- The app name remains **FRIEND RIDE**.
- AI assistant name is **Ginny**; assistant UI label is **Ginny AI**.
- Avatar presentation is male; avatar/app visuals follow navy + gold theme.
- Never replace the app's FRIEND RIDE name with Ginny in product chrome, app launcher, or store identity.


## Language preference and speech fallback
- Resolve valid explicit saved choice (`te`, `hi`, `en`) before device locale.
- Invalid saved preference falls back to device locale; missing/unknown locale falls back to Telugu.
- Speech recognition and synthesis locale tags: `te-IN`, `hi-IN`, `en-IN`.
- If requested speech locale is unavailable, use text fallback; do not silently switch spoken language.
- Preference module is pure and does not introduce storage or permission side effects; UI must use existing settings persistence and microphone permission flow.


## Voice readiness and microphone safety
- Evaluate microphone permission, speech recognition availability, and requested locale before presenting voice as available.
- Evaluate synthesis support and locale independently.
- If either side is unavailable, text chat remains available and UI presents a text-fallback state.
- Never display a listening animation until the platform confirms capture has started.
- Permission request, capture start, stop, and failure are separate UI states.
- Core readiness helpers do not request permissions, access microphone, or start speech; UI/platform adapter owns those actions.


## Voice session controller
- Session state helper manages request/permission/capture/listening/stop/error transitions as a pure reducer-like module.
- Requests are blocked when readiness checks fail.
- Transcript updates are accepted only while state is listening and capped at 4,000 characters.
- This core does not initiate microphone capture, persist transcripts, or transmit audio/text; platform adapter and UI must enforce consent, privacy and backend access rules.


## Chat request privacy validation
- Validate trimmed non-empty message, max 4,000 chars, non-empty session ID, and explicit consent before any external AI request.
- Optional display name is trimmed and capped at 80 chars.
- Display text strips control characters and caps at 8,000 chars.
- Core validator performs no network requests; API/UI integration must respect consent, safety and cancellation.


## Speech output policy
- Speak only when the selected Indian locale voice is available.
- Sensitive responses remain text-only by default; UI may allow a user-requested readout only after an explicit review/confirmation design.
- Cancelled and empty outputs are suppressed.
- Output is trimmed and capped at 4,000 characters before TTS.
- Policy helper does not invoke a speech engine; native/web TTS integration is still required.
