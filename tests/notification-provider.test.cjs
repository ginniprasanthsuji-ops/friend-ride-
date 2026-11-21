const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadProvider(mockWindow) {
  const context = { window: mockWindow };
  vm.runInNewContext(fs.readFileSync("integrations/notifications/notification-provider.js", "utf8"), context);
  return mockWindow.FRNotificationProvider;
}

test("notification adapter loads without requesting permission", async () => {
  let requested = 0;
  const w = { Notification: { permission: "default", requestPermission: async () => { requested++; return "granted"; } }, navigator: {} };
  const p = loadProvider(w);
  assert.equal((await p.initialize()).permission, "default");
  assert.equal(requested, 0);
  assert.equal(await p.requestPermission(), "granted");
  assert.equal(requested, 1);
});

test("local notification is blocked until permission granted", async () => {
  const w = { Notification: { permission: "default", requestPermission: async () => "default" }, navigator: {} };
  const p = loadProvider(w);
  assert.deepEqual(await p.sendLocal({ body: "test" }), { sent: false, reason: "permission-not-granted" });
});

test("local notification uses service worker when available", async () => {
  let shown = 0;
  const w = {
    Notification: { permission: "granted" },
    navigator: { serviceWorker: { getRegistration: async () => ({ showNotification: async () => { shown++; } }) } }
  };
  const p = loadProvider(w);
  const result = await p.sendLocal({ title: "Ride update", url: "./" });
  assert.equal(result.sent, true);
  assert.equal(result.method, "service-worker");
  assert.equal(shown, 1);
});

test("push subscribe reports missing VAPID key safely", async () => {
  const w = {
    Notification: { permission: "granted" },
    PushManager: {},
    navigator: { serviceWorker: { ready: Promise.resolve({ pushManager: { subscribe: async () => ({}) } }) } }
  };
  const p = loadProvider(w);
  assert.deepEqual(await p.subscribe({}), { subscribed: false, reason: "missing-or-invalid-vapid-public-key" });
});
