/* FRIEND RIDE — Notification Provider Interface
 * Safe, non-operational scaffold. Runtime wiring and provider setup are deferred
 * until device/browser and release-build tests pass.
 */
(function (global) {
  "use strict";

  const contract = {
    name: "notifications",
    async initialize() { return { enabled: false, reason: "scaffold-only" }; },
    async requestPermission() { return "unsupported"; },
    async subscribe() { return null; },
    async unsubscribe() { return false; },
    async sendLocal() { return { sent: false, reason: "not-wired" }; },
    async sendPush() { return { sent: false, reason: "not-wired" }; }
  };

  global.FRNotificationProviderScaffold = Object.freeze(contract);
})(window);
