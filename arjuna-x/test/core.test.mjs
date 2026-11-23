import test from "node:test";
import assert from "node:assert/strict";
import { permissionDecision } from "../dist/core/permissions.js";
import { canTransition, assertTransition } from "../dist/core/state-machine.js";

test("tier 3 actions require explicit confirmation", () => {
  assert.equal(permissionDecision({ tier: 3, action: "booking" }), "REQUIRE_CONFIRMATION");
  assert.equal(permissionDecision({ tier: 3, action: "booking", userConfirmed: true }), "ALLOW");
});

test("tier 4 requires special approval", () => {
  assert.equal(permissionDecision({ tier: 4, action: "sensitive" }), "REQUIRE_SPECIAL_APPROVAL");
  assert.equal(permissionDecision({ tier: 4, action: "sensitive", specialApproval: true }), "ALLOW");
});

test("task transitions reject unsafe jumps", () => {
  assert.equal(canTransition("QUEUED", "READY"), true);
  assert.equal(canTransition("QUEUED", "COMPLETED"), false);
  assert.throws(() => assertTransition("QUEUED", "COMPLETED"), /Invalid task transition/);
});
