import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePhase7IdentityAction } from "../core/phase7-identity-gate.js";

const request = { tier: 2 as const, action: "read record" };
const base = { authenticated: true, actorId: "user-1", sessionActorId: "user-1", role: "customer" as const };

test("identity gate allows authenticated matching session for manual feature", () => {
  assert.equal(evaluatePhase7IdentityAction("Ride booking and lifecycle", base, request), "ALLOW");
});

test("identity gate denies unauthenticated actors", () => {
  assert.equal(evaluatePhase7IdentityAction("Ride booking and lifecycle", { ...base, authenticated: false }, request), "DENY_IDENTITY");
});

test("identity gate denies session actor mismatch", () => {
  assert.equal(evaluatePhase7IdentityAction("Ride booking and lifecycle", { ...base, sessionActorId: "other-user" }, request), "DENY_IDENTITY");
});

test("identity gate denies admin-only feature for non-admin roles", () => {
  assert.equal(evaluatePhase7IdentityAction("Admin approvals and complaints", base, request), "DENY_ROLE");
});

test("identity gate still blocks disabled external features for admin", () => {
  assert.equal(evaluatePhase7IdentityAction("Payment gateway processing", { ...base, role: "admin" }, request), "DENY_FEATURE");
});
