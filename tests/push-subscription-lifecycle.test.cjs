const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadLifecycle(navigator = { userAgent: "FR test" }) {
  const window = { navigator };
  vm.runInNewContext(fs.readFileSync("integrations/notifications/push-subscription-lifecycle.js", "utf8"), { window });
  return window.FRPushSubscriptionLifecycle;
}

test("enable requires auth and provider", async () => {
  const lifecycle = loadLifecycle();
  const result = await lifecycle.enable({});
  assert.equal(result.enabled, false);
  assert.equal(result.reason, "missing-auth-or-provider");
});

test("enable saves subscription only after granted permission and successful subscribe", async () => {
  const lifecycle = loadLifecycle();
  let upsertPayload = null, upsertOptions = null;
  const sb = { from: () => ({ upsert: async (payload, options) => { upsertPayload = payload; upsertOptions = options; return { error: null }; } }) };
  const provider = {
    requestPermission: async () => "granted",
    subscribe: async () => ({ subscribed: true, subscription: { endpoint: "https://push.example/sub", keys: { p256dh: "p", auth: "a" } } })
  };
  const result = await lifecycle.enable({ sb, user: { id: "user-uuid" }, provider, vapidPublicKey: "public" });
  assert.equal(result.enabled, true);
  assert.equal(upsertPayload.user_id, "user-uuid");
  assert.equal(upsertPayload.endpoint, "https://push.example/sub");
  assert.equal(upsertPayload.is_active, true);
  assert.equal(upsertOptions.onConflict, "endpoint");
});

test("enable does not write when permission denied", async () => {
  const lifecycle = loadLifecycle();
  let writes = 0;
  const sb = { from: () => ({ upsert: async () => { writes++; return { error: null }; } }) };
  const provider = { requestPermission: async () => "denied", subscribe: async () => ({ subscribed: true }) };
  const result = await lifecycle.enable({ sb, user: { id: "user-uuid" }, provider, vapidPublicKey: "public" });
  assert.equal(result.enabled, false);
  assert.equal(result.reason, "permission-not-granted");
  assert.equal(writes, 0);
});

test("enable cleans up browser subscription if DB upsert fails", async () => {
  const lifecycle = loadLifecycle();
  let unsubscribed = false;
  const sb = { from: () => ({ upsert: async () => ({ error: { message: "database unavailable" } }) }) };
  const provider = {
    requestPermission: async () => "granted",
    subscribe: async () => ({ subscribed: true, subscription: { endpoint: "https://push.example/sub", keys: { p256dh: "p", auth: "a" } } }),
    unsubscribe: async () => { unsubscribed = true; return { unsubscribed: true }; }
  };
  const result = await lifecycle.enable({ sb, user: { id: "user-uuid" }, provider, vapidPublicKey: "public" });
  assert.equal(result.enabled, false);
  assert.equal(result.reason, "subscription-save-failed");
  assert.equal(unsubscribed, true);
});

test("disable marks current endpoint inactive then unsubscribes browser", async () => {
  const lifecycle = loadLifecycle({ userAgent: "FR test", serviceWorker: { getRegistration: async () => ({ pushManager: { getSubscription: async () => ({ endpoint: "https://push.example/sub" }) } }) } });
  let updatePayload = null, filters = [];
  const sb = { from: () => ({ update: (payload) => { updatePayload = payload; const builder = { eq: (key, value) => { filters.push([key, value]); return builder; }, then: (resolve) => resolve({ error: null }) }; return builder; } }) };
  const provider = { unsubscribe: async () => ({ unsubscribed: true }) };
  const result = await lifecycle.disable({ sb, user: { id: "user-uuid" }, provider });
  assert.equal(result.disabled, true);
  assert.equal(result.databaseMarkedInactive, true);
  assert.equal(result.browserUnsubscribed, true);
  assert.equal(updatePayload.is_active, false);
  assert.deepEqual(filters, [["user_id", "user-uuid"], ["endpoint", "https://push.example/sub"]]);
});
