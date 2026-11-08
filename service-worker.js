/* FRIEND RIDE PWA Service Worker — Background Web Push */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receive push notification
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: 'FRIEND RIDE',
      body: event.data
        ? event.data.text()
        : 'మీకు కొత్త update ఉంది.'
    };
  }

  const role = String(data.role || '').toLowerCase();
  const raw = String((data.title || '') + ' ' + (data.body || data.message || '')).toLowerCase();
  const isOrder = /order|store order|market order|ఆర్డర్|షాప్/.test(raw);
  const isRide = /ride|booking|trip|రైడ్|బుకింగ్/.test(raw);
  let title = data.title || 'FRIEND RIDE';
  let body = data.body || data.message || 'మీకు కొత్త update ఉంది.';
  let vibration = [120, 70, 120];
  let requireInteraction = false;
  if (role === 'partner' && isOrder) {
    title = 'కొత్త ఆర్డర్ వచ్చింది';
    body = 'మీ షాప్‌కు కొత్త ఆర్డర్ వచ్చింది. వెంటనే యాప్ తెరిచి చూడండి. ' + body;
    vibration = [250, 120, 250, 120, 450];
    requireInteraction = true;
  } else if (role === 'driver' && isRide) {
    title = 'కొత్త రైడ్ వచ్చింది';
    body = 'మీకు కొత్త రైడ్ రిక్వెస్ట్ వచ్చింది. వెంటనే యాప్ తెరిచి చూడండి. ' + body;
    vibration = [180, 100, 180, 100, 380];
    requireInteraction = true;
  } else if (role === 'customer' && (isOrder || isRide)) {
    title = isOrder ? 'మీ ఆర్డర్ అప్‌డేట్' : 'మీ రైడ్ అప్‌డేట్';
    vibration = [100, 60, 100];
  }
  const options = {
    body,
    icon: data.icon || './icons/icon-192.png',
    badge: data.badge || './icons/icon-192.png',
    tag: data.tag || ('fr-push-' + (data.ride_id || Date.now())),
    data: { url: data.url || './', ride_id: data.ride_id || null },
    vibrate: vibration,
    renotify: true,
    requireInteraction,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Open app when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || './',
    self.registration.scope
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const client of windows) {
        if ('focus' in client) {
          await client.focus();

          if ('navigate' in client) {
            await client.navigate(target);
          }

          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
