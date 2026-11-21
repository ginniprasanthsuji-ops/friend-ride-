const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
function loadBrowserScript(relativePath, windowObject = {}) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  const context = { window: windowObject };
  vm.runInNewContext(source, context, { filename: relativePath });
  return windowObject;
}

test("integration registry exposes safe defaults and disabled optional features", () => {
  const w = loadBrowserScript("integration-config.js");
  assert.equal(w.FRIntegration.getProvider("database"), "supabase");
  assert.equal(w.FRIntegration.getProvider("cache"), "none");
  assert.equal(w.FRIntegration.getProvider("unknown"), "disabled");
  assert.equal(w.FRIntegration.isEnabled("pushNotifications"), false);
  assert.equal(w.FRIntegration.isEnabled("groceryEmi"), false);
});

test("provider contract validates required provider methods", () => {
  const w = loadBrowserScript("integrations/provider-contract.js");
  const contract = w.FRIntegrationContracts.createProviderContract("sample", {
    connect: true,
    disconnect: true
  });
  assert.equal(contract.validate({ connect() {}, disconnect() {} }), true);
  assert.equal(contract.validate({ connect() {} }), false);
  assert.deepEqual(Array.from(contract.methods), ["connect", "disconnect"]);
});

test("notification scaffold is inert and does not claim sends succeeded", async () => {
  const w = loadBrowserScript("integrations/notifications/notification-provider.js");
  assert.equal((await w.FRNotificationProviderScaffold.initialize()).enabled, false);
  assert.equal((await w.FRNotificationProviderScaffold.sendPush()).sent, false);
  assert.equal(await w.FRNotificationProviderScaffold.subscribe(), null);
});

test("cache scaffold never stores data and reports unavailable", async () => {
  const w = loadBrowserScript("integrations/cache/cache-provider.js");
  assert.equal(await w.FRCacheProviderScaffold.get("key"), null);
  assert.equal(await w.FRCacheProviderScaffold.set("key", "value", 10), false);
  assert.equal(await w.FRCacheProviderScaffold.delete("key"), false);
});
