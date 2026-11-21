/* FCM background support, sharing the site's existing PWA service worker. */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'AIzaSyAlFAYAjcV1pR1dzeUjUH9sQaxV19UM',authDomain:'friend-ride-app.firebaseapp.com',projectId:'friend-ride-app',storageBucket:'friend-ride-app.firebasestorage.app',messagingSenderId:'986949278576',appId:'1:986949278576:web:7da92fc7889d7eb168db5'});
const fcmMessaging=firebase.messaging();
fcmMessaging.onBackgroundMessage(payload=>{
  const n=payload.notification||{};
  const d=payload.data||{};
  self.registration.showNotification(n.title||d.title||'FRIEND RIDE',{body:n.body||d.body||d.message||'మీకు కొత్త update ఉంది.',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',data:{url:d.url||'./'}});
});

/* FRIEND RIDE PWA Service Worker — Web Push + Telugu event alerts */
self.addEventListener('install', event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { title: 'FRIEND RIDE', body: event.data ? event.data.text() : 'మీకు కొత్త update ఉంది.' }; }

  if (data.notification || data.from || data.fcmMessageId || data.messageId) return; // FCM SDK handles its own payload
  const role = String(data.role || '').toLowerCase();
  const raw = String([data.notification_type, data.title, data.body, data.message].join(' ')).toLowerCase();
  const isOrder = /order|store|market|food|ఆర్డర్|షాప్|ఫుడ్/.test(raw);
  const isRide = /ride|booking|trip|రైడ్|బుకింగ్/.test(raw);
  const isDelivery = /delivery|parcel|డెలివరీ|పార్సెల్/.test(raw);
  let title = data.title || 'FRIEND RIDE';
  let body = data.body || data.message || 'మీకు కొత్త update ఉంది.';
  let vibration = [100, 60, 100];
  let requireInteraction = false;

  if (role === 'partner' && isOrder) {
    title = '🛍️ కొత్త ఆర్డర్ వచ్చింది';
    body = 'మీ షాప్‌కు కొత్త ఆర్డర్ వచ్చింది. ' + body;
    vibration = [260, 120, 260, 120, 480];
    requireInteraction = true;
  } else if (role === 'driver' && isRide) {
    title = '🛵 కొత్త రైడ్ వచ్చింది';
    body = 'మీకు కొత్త రైడ్ రిక్వెస్ట్ వచ్చింది. ' + body;
    vibration = [180, 90, 180, 90, 420];
    requireInteraction = true;
  } else if (isDelivery) {
    title = '📦 డెలివరీ అప్‌డేట్';
    vibration = [120, 70, 220];
  } else if (role === 'customer' && isOrder) {
    title = '🛍️ మీ ఆర్డర్ అప్‌డేట్';
    vibration = [100, 60, 100, 60, 180];
  } else if (role === 'customer' && isRide) {
    title = '🛵 మీ రైడ్ అప్‌డేట్';
    vibration = [140, 80, 140];
  } else if (/payment|చెల్లింపు/.test(raw)) {
    title = '💳 చెల్లింపు అప్‌డేట్';
    vibration = [100, 60, 260];
  }

  const options = {
    body,
    icon: data.icon || './icons/icon-192.png',
    badge: data.badge || './icons/icon-192.png',
    tag: data.tag || ('fr-push-' + (data.ride_id || data.id || Date.now())),
    data: { url: data.url || './', ride_id: data.ride_id || null },
    vibrate: vibration,
    renotify: true,
    requireInteraction,
    silent: false,
    timestamp: Date.now()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windows) {
      if ('focus' in client) {
        await client.focus();
        if ('navigate' in client) await client.navigate(target);
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
