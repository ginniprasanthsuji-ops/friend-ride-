const CACHE_NAME = "friend-ride-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
    ])
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "FRIEND RIDE",
    body: "కొత్త Ride Request వచ్చింది.",
    url: "/friend-ride-/"
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (_) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/friend-ride-/icon-192.png",
      badge: "/friend-ride-/icon-192.png",
      data: { url: data.url || "/friend-ride-/" },
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/friend-ride-/",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
