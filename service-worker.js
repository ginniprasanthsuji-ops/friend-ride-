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

  const title = data.title || 'FRIEND RIDE';

  const options = {
    body: data.body || data.message || 'మీకు కొత్త update ఉంది.',
    icon: data.icon || './icons/icon-192.png',
    badge: data.badge || './icons/icon-192.png',
    tag: data.tag || ('fr-push-' + (data.ride_id || Date.now())),
    data: {
      url: data.url || './',
      ride_id: data.ride_id || null
    },
    vibrate: [150, 70, 150],
    renotify: true
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
    self.location.origin
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
