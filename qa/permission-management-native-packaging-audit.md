# FRIEND RIDE Permission Management & Native Packaging Audit

**Scope:** QA branch source/catalog review only. No production files, backend rows, SQL, or deployment changed.

## Verified repository findings
- `index.html` links `manifest.webmanifest` and contains a web/PWA frontend.
- `manifest.webmanifest` declares standalone display, scope/start URL, orientation, colors, and icons; it does not declare Android system permissions.
- `manifest.json` is also a web manifest-style file and contains no native permission declaration.
- Repository tree search did not identify an Android project, `AndroidManifest.xml`, Capacitor/Cordova wrapper, or native permission configuration.
- Frontend previously inspected: browser geolocation use exists; dedicated camera and microphone APIs were not identified in the reviewed source search; download/invoice workflow exists.
- `service-worker.js` supports Firebase messaging and web push notification events. It does not define native Android permissions.

## Requirement
First app use should explain permissions and provide **Allow / Not Now**:
- Location: when location-dependent feature is used.
- Camera: when camera capture is needed.
- Microphone: only if a voice feature needs it.
- Files/photos/downloads: use browser/platform file chooser and download APIs where supported.
- If denied, provide fallback and Settings guidance; do not block unrelated app features.
- Do not request all permissions aggressively on install/first open.

## Technical boundary
This repository appears to be a PWA/web frontend, not a verified native Android package. Browser permission requests are feature/context-based and do not configure Android APK-level permission declarations. Native system permission prompts require a verified Android packaging layer and its manifest/runtime permission code.

## Next implementation gate
1. Identify the actual Android distribution/package wrapper (if any) before adding native manifest permissions.
2. Add an additive permission-intro UI to the web/PWA with Allow / Not Now and denied-state guidance.
3. Request browser permissions only in user-initiated feature context; do not request microphone without an implemented voice feature.
4. Camera capture should use supported browser APIs only after user action; file-picker fallback must remain.
5. Add tests for prompt deferral, denied state, feature fallback, and settings guidance.
6. If a native wrapper is confirmed, separately implement and test Android manifest/runtime permission declarations in that wrapper.
7. Verify on real Android device before claiming system-level permissions are working.

## Status
**Audit findings documented. Permission UI and native permission implementation are NOT yet implemented.** No runtime/device verification. No production access or changes.
