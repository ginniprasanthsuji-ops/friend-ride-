import test from "node:test";
import assert from "node:assert/strict";
import { SessionContextStore } from "../dist/core/session-context.js";
import { createPlan, authorizeAction } from "../dist/core/orchestrator.js";

test("session context remains isolated by session ID", () => {
  const store = new SessionContextStore();
  store.create("session-A");
  store.create("session-B");
  store.appendMessage("session-A", "user", "Book a cab");
  store.setFact("session-A", "pickup", "Tekkali");
  assert.equal(store.get("session-B")?.messages.length, 0);
  assert.equal(store.get("session-B")?.facts.pickup, undefined);
});

test("duplicate sessions are rejected and unknown session writes fail", () => {
  const store = new SessionContextStore();
  store.create("one");
  assert.throws(() => store.create("one"), /already exists/);
  assert.throws(() => store.appendMessage("missing", "user", "hello"), /Unknown session/);
});

test("planner creates queued action plan and authorization gates", () => {
  const plan = createPlan("s1", "Book ride", [{ id: "a1", description: "Search ride", permissionTier: 1 }]);
  assert.equal(plan.actions[0].status, "QUEUED");
  assert.equal(authorizeAction(3), "REQUIRE_CONFIRMATION");
  assert.equal(authorizeAction(3, true), "ALLOW");
});
test("plan creation rejects invalid or duplicate action records", () => {
  assert.throws(() => createPlan("s1", "request", [{ id: "x", description: "ok", permissionTier: 9 }]), /Invalid permission tier/);
  assert.throws(() => createPlan("s1", "request", [{ id: "x", description: "ok", permissionTier: 1 }, { id: "x", description: "duplicate", permissionTier: 1 }]), /Duplicate action id/);
  assert.throws(() => createPlan("s1", "request", [{ id: " ", description: "ok", permissionTier: 1 }]), /Action id is required/);
  assert.throws(() => createPlan("s1", "request", [{ id: "x", description: " ", permissionTier: 1 }]), /Action description is required/);
});

test("plan creation normalizes identifiers and descriptions safely", () => {
  const plan = createPlan(" s1 ", " Book a ride ", [{ id: " a1 ", description: " Search options ", permissionTier: 1 }]);
  assert.equal(plan.sessionId, "s1");
  assert.equal(plan.request, "Book a ride");
  assert.equal(plan.actions[0].id, "a1");
  assert.equal(plan.actions[0].description, "Search options");
  assert.equal(plan.actions[0].status, "QUEUED");
});
