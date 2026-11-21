const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadEvents() {
  const w = {};
  vm.runInNewContext(fs.readFileSync("integrations/notifications/notification-events.js", "utf8"), { window: w });
  return w.FRNotificationEvents;
}

test("event catalog maps core ride/order/delivery roles", () => {
  const events = loadEvents();
  assert.deepEqual(events.getRoles("ride.accepted"), ["customer"]);
  assert.deepEqual(events.getRoles("ride.requested"), ["driver"]);
  assert.deepEqual(events.getRoles("order.received"), ["customer", "partner"]);
  assert.deepEqual(events.getRoles("admin.complaint"), ["admin"]);
});

test("build returns stable Telugu template and allows safe context override", () => {
  const events = loadEvents();
  const base = events.build("ride.completed");
  assert.equal(base.title, "రైడ్ పూర్తయింది");
  assert.deepEqual(base.roles, ["customer", "driver"]);
  const custom = events.build("order.ready", { body: "Ready", url: "./orders", tag: "order-42" });
  assert.equal(custom.body, "Ready");
  assert.equal(custom.url, "./orders");
  assert.equal(custom.tag, "order-42");
});

test("unknown events return null and do not dispatch", async () => {
  const events = loadEvents();
  let sent = 0;
  const provider = { sendLocal: async () => { sent++; return { sent: true }; } };
  assert.equal(events.build("made.up.event"), null);
  assert.deepEqual(await events.dispatchLocal(provider, "made.up.event", { optIn: true }), { sent: false, reason: "unknown-event" });
  assert.equal(sent, 0);
});

test("dispatcher requires explicit opt-in", async () => {
  const events = loadEvents();
  let sent = 0;
  const provider = { sendLocal: async () => { sent++; return { sent: true }; } };
  assert.deepEqual(await events.dispatchLocal(provider, "ride.accepted"), { sent: false, reason: "user-opt-in-required" });
  assert.equal(sent, 0);
  assert.deepEqual(await events.dispatchLocal(provider, "ride.accepted", { optIn: true }), { sent: true });
  assert.equal(sent, 1);
});
