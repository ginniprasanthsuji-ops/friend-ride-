/* FRIEND RIDE — Browser Notification Adapter
 * Operational adapter, opt-in only. No permission prompt or subscription at load.
 * Push delivery requires a server-side sender and a public VAPID key; secrets stay server-side.
 */
(function (global) {
  "use strict";

  const DEFAULT_ICON = "./icons/icon-192.png";
  const supported = () => typeof global.Notification !== "undefined";
  const permission = () => supported() ? global.Notification.permission : "unsupported";

  function toBase64UrlBytes(value) {
    if (!value || typeof value !== "string") return null;
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    try {
      return Uint8Array.from(global.atob(padded), (c) => c.charCodeAt(0));
    } catch (_) { return null; }
  }

  const provider = {
    name: "browser-notifications",
    supported,
    getPermission: permission,
    async initialize() {
      return { supported: supported(), permission: permission(), enabled: permission() === "granted" };
    },
    async requestPermission() {
      if (!supported()) return "unsupported";
      if (global.Notification.permission !== "default") return global.Notification.permission;
      return global.Notification.requestPermission();
    },
    async sendLocal(payload = {}) {
      if (!supported()) return { sent: false, reason: "unsupported" };
      if (global.Notification.permission !== "granted") return { sent: false, reason: "permission-not-granted" };
      const title = String(payload.title || "FRIEND RIDE");
      const options = {
        body: String(payload.body || "మీ FRIEND RIDE అప్‌డేట్ ఉంది."),
        icon: payload.icon || DEFAULT_ICON,
        tag: payload.tag || undefined,
        data: { url: payload.url || "./" },
        renotify: Boolean(payload.renotify)
      };
      try {
        if (global.navigator && global.navigator.serviceWorker) {
          const registration = await global.navigator.serviceWorker.getRegistration();
          if (registration && registration.showNotification) {
            await registration.showNotification(title, options);
            return { sent: true, method: "service-worker" };
          }
        }
        new global.Notification(title, options);
        return { sent: true, method: "foreground" };
      } catch (error) {
        return { sent: false, reason: "notification-error", error: String(error && error.message || error) };
      }
    },
    async subscribe({ vapidPublicKey } = {}) {
      if (!global.navigator || !global.navigator.serviceWorker || !global.PushManager) {
        return { subscribed: false, reason: "push-unsupported" };
      }
      if (permission() !== "granted") return { subscribed: false, reason: "permission-not-granted" };
      const key = toBase64UrlBytes(vapidPublicKey);
      if (!key) return { subscribed: false, reason: "missing-or-invalid-vapid-public-key" };
      try {
        const registration = await global.navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        return { subscribed: true, subscription: subscription.toJSON ? subscription.toJSON() : subscription };
      } catch (error) {
        return { subscribed: false, reason: "subscribe-error", error: String(error && error.message || error) };
      }
    },
    async unsubscribe() {
      if (!global.navigator || !global.navigator.serviceWorker) return { unsubscribed: false, reason: "push-unsupported" };
      try {
        const registration = await global.navigator.serviceWorker.getRegistration();
        if (!registration || !registration.pushManager) return { unsubscribed: false, reason: "no-registration" };
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return { unsubscribed: true, alreadyUnsubscribed: true };
        return { unsubscribed: Boolean(await subscription.unsubscribe()) };
      } catch (error) {
        return { unsubscribed: false, reason: "unsubscribe-error", error: String(error && error.message || error) };
      }
    }
  };

  global.FRNotificationProvider = Object.freeze(provider);
})(window);
