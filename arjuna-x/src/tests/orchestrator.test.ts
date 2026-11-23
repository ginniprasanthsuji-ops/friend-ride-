import test from "node:test";
import assert from "node:assert/strict";
import { createPlan, authorizeAction, transitionTask } from "../core/orchestrator.js";

const validAction = { id: "a1", description: "Read data", permissionTier: 1 as const };

test("createPlan trims identifiers and descriptions and defaults retrySafe false", () => {
  const plan = createPlan(" session ", " request ", [{ ...validAction, id: " a1 ", description: " Read data " }]);
  assert.equal(plan.sessionId, "session");
  assert.equal(plan.request, "request");
  assert.equal(plan.actions[0]?.id, "a1");
  assert.equal(plan.actions[0]?.description, "Read data");
  assert.equal(plan.actions[0]?.retrySafe, false);
  assert.equal(plan.actions[0]?.status, "QUEUED");
});

test("createPlan rejects malformed action input and duplicate IDs", () => {
  assert.throws(() => createPlan("s", "r", [null as never]), /Action must be an object/);
  assert.throws(() => createPlan("s", "r", [{ ...validAction, retrySafe: "yes" } as never]), /retrySafe must be a boolean/);
  assert.throws(() => createPlan("s", "r", [validAction, validAction]), /Duplicate action id/);
  assert.throws(() => createPlan("s", "r", [{ ...validAction, permissionTier: 5 as never }]), /Invalid permission tier/);
});

test("authorization returns distinct approval states by tier", () => {
  assert.equal(authorizeAction(2), "ALLOW");
  assert.equal(authorizeAction(3), "REQUIRE_CONFIRMATION");
  assert.equal(authorizeAction(4, true), "REQUIRE_SPECIAL_APPROVAL");
  assert.equal(authorizeAction(4, false, true), "ALLOW");
});

test("transitionTask rejects illegal transitions and leaves original immutable", () => {
  const task = { id: "t1", sessionId: "s1", status: "QUEUED" as const, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
  assert.throws(() => transitionTask(task, "COMPLETED"), /Invalid task transition/);
  assert.equal(task.status, "QUEUED");
});
