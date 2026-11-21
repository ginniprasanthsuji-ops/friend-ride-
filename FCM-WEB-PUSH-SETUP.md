# FRIEND RIDE FCM Web Push Integration

## Firebase project
- Project ID: friend-ride-app
- Sender ID: 986949278576
- Public VAPID key: BOYoqlhqA2JZzKxqRUcfPC1Dw7QV7ldMZFzU7aS_gwhyJrerEQNaIP3DuH46BV9z_bLmi5jHliVY3AD6riknmkM

## Required Firebase Web app config
Firebase Console > Project settings > General > Your apps > Web app. Copy the public Web config fields apiKey and appId (other fields can be verified there). Do not copy any service-account private key here.

## Setup
1. Add the Web app config to the site Firebase Messaging initialization.
2. Register /firebase-messaging-sw.js at root scope.
3. Ask for Notification permission only after a user taps an opt-in button.
4. Generate an FCM token using getToken({ vapidKey: PUBLIC_VAPID_KEY, serviceWorkerRegistration }).
5. Send token to fr-notification-register-token with the authenticated session / expected payload schema.
6. Test foreground and background push delivery, token refresh, permission-denied handling, and invalid token cleanup.

## Current limitation
The service worker includes placeholders for apiKey and appId. Do not deploy it as functional until these are filled and the website token-registration payload is verified against the deployed Edge Function.
