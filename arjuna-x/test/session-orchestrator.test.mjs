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
