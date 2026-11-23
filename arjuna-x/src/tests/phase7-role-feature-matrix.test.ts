import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePhase7RoleFeature } from "../core/phase7-role-feature-matrix.js";

test("role matrix allows explicitly permitted manual features", () => {
  assert.equal(evaluatePhase7RoleFeature("customer", "Ride booking and lifecycle"), "ALLOW_ROLE_FEATURE");
  assert.equal(evaluatePhase7RoleFeature("teacher", "Learn/Teach records and homework"), "ALLOW_ROLE_FEATURE");
});

test("role matrix denies roles outside feature allowlist", () => {
  assert.equal(evaluatePhase7RoleFeature("student", "Ride booking and lifecycle"), "DENY_ROLE_FEATURE");
  assert.equal(evaluatePhase7RoleFeature("customer", "Admin approvals and complaints"), "DENY_ROLE_FEATURE");
});

test("disabled provider features are denied regardless of role", () => {
  assert.equal(evaluatePhase7RoleFeature("admin", "Payment gateway processing"), "DENY_DISABLED_FEATURE");
});

test("unknown feature names fail closed", () => {
  assert.equal(evaluatePhase7RoleFeature("admin", "unknown feature"), "DENY_DISABLED_FEATURE");
});
