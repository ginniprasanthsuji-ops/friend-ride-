const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadEvents() {
  const w = {};
  vm.runInNewContext(fs.readFileSync("integrations/notifications/notification-events.js", "utf8"), { window: w });
  return w.FRNotificationEvents;
}

test("catalog retains core ride/order/delivery roles", () => {
  const events = loadEvents();
  assert.equal(events.getRoles("ride.accepted").join(","), "customer");
  assert.equal(events.getRoles("ride.requested").join(","), "driver");
  assert.equal(events.getRoles("order.received").join(","), "customer,partner");
  assert.equal(events.getRoles("delivery.completed").join(","), "customer,driver");
  assert.equal(events.getRoles("admin.complaint").join(","), "admin");
});

test("catalog includes Home, Work/Task and Market/local-store notifications", () => {
  const events = loadEvents();
  assert.equal(events.getRoles("home.service.requested").join(","), "customer,partner");
  assert.equal(events.getRoles("home.service.assigned").join(","), "customer,partner");
  assert.equal(events.getRoles("work.task.assigned").join(","), "customer,partner");
  assert.equal(events.getRoles("work.task.completed").join(","), "customer,partner");
  assert.equal(events.getRoles("market.order.received").join(","), "customer,partner");
  assert.equal(events.getRoles("market.order.status").join(","), "customer");
});

test("build returns Telugu template and permits safe contextual fields", () => {
  const events = loadEvents();
  const base = events.build("ride.completed");
  assert.equal(base.title, "రైడ్ పూర్తయింది");
  assert.equal(base.roles.join(","), "customer,driver");
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
  const result = await events.dispatchLocal(provider, "made.up.event", { optIn: true });
  assert.equal(result.sent, false);
  assert.equal(result.reason, "unknown-event");
  assert.equal(sent, 0);
});

test("dispatcher requires explicit opt-in", async () => {
  const events = loadEvents();
  let sent = 0;
  const provider = { sendLocal: async () => { sent++; return { sent: true }; } };
  const blocked = await events.dispatchLocal(provider, "ride.accepted");
  assert.equal(blocked.sent, false);
  assert.equal(blocked.reason, "user-opt-in-required");
  assert.equal(sent, 0);
  const result = await events.dispatchLocal(provider, "ride.accepted", { optIn: true });
  assert.equal(result.sent, true);
  assert.equal(sent, 1);
});
