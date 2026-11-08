/* FRIEND RIDE PWA Service Worker — Web Push + Telugu event alerts */
self.addEventListener('install', event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { title: 'FRIEND RIDE', body: event.data ? event.data.text() : 'మీకు కొత్త update ఉంది.' }; }

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
