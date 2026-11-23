import test from "node:test";
import assert from "node:assert/strict";
import { permissionDecision } from "../core/permissions.js";

test("tiers 0-2 are allowed without confirmation", () => {
  for (const tier of [0, 1, 2] as const) assert.equal(permissionDecision({ tier, action: "read" }), "ALLOW");
});

test("tier 3 requires explicit user confirmation", () => {
  assert.equal(permissionDecision({ tier: 3, action: "booking" }), "REQUIRE_CONFIRMATION");
  assert.equal(permissionDecision({ tier: 3, action: "booking", userConfirmed: true }), "ALLOW");
});

test("tier 4 requires special approval and cannot use normal confirmation", () => {
  assert.equal(permissionDecision({ tier: 4, action: "sensitive", userConfirmed: true }), "REQUIRE_SPECIAL_APPROVAL");
  assert.equal(permissionDecision({ tier: 4, action: "sensitive", specialApproval: true }), "ALLOW");
});

test("invalid permission tier and empty action are rejected", () => {
  assert.throws(() => permissionDecision({ tier: -1 as 0, action: "x" }), /Invalid permission tier/);
  assert.throws(() => permissionDecision({ tier: 5 as 4, action: "x" }), /Invalid permission tier/);
  assert.throws(() => permissionDecision({ tier: 0, action: " " }), /action is required/);
});
