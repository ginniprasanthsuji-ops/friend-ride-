/* FRIEND RIDE Firebase Cloud Messaging service worker
 * Public web Firebase config must be filled from Firebase Project Settings > General > Web app.
 * Do NOT place service-account private keys or Supabase service-role keys in this file.
 */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'REPLACE_WITH_FIREBASE_WEB_API_KEY',
  authDomain: 'friend-ride-app.firebaseapp.com',
  projectId: 'friend-ride-app',
  storageBucket: 'friend-ride-app.appspot.com',
  messagingSenderId: '986949278576',
  appId: 'REPLACE_WITH_FIREBASE_WEB_APP_ID'
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'FRIEND RIDE';
  const options = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: payload.data || { url: '/' }
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    for (const win of windows) {
      if ('focus' in win) { win.focus(); if ('navigate' in win) win.navigate(target); return; }
    }
    return clients.openWindow(target);
  }));
});
