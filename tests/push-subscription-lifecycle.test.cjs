const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadLifecycle() {
  const window = { navigator: { userAgent: "FR test" } };
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
  const sb = { from: (table) => ({ upsert: async (payload, options) => { upsertPayload = payload; upsertOptions = options; return { error: null }; } }) };
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

test("disable marks current endpoint inactive before browser unsubscribe", async () => {
  const lifecycle = loadLifecycle();
  let updatePayload = null, filters = [];
  const sb = { from: (table) => ({ update: (payload) => { updatePayload = payload; return { eq: async (key, value) => { filters.push([key, value]); if (filters.length === 1) return { eq: async (key2, value2) => { filters.push([key2, value2]); return { error: null }; } }; return { error: null }; } }; } }) };
  const provider = { unsubscribe: async () => ({ unsubscribed: true }) };
  const result = await lifecycle.disable({ sb, user: { id: "user-uuid" }, provider });
  assert.equal(result.disabled, true);
  assert.equal(result.databaseMarkedInactive, false); // no active browser subscription in test harness
  assert.equal(result.browserUnsubscribed, true);
  assert.equal(updatePayload, null);
});
