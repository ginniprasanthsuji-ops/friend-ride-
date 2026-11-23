import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluatePhase7FeatureAccess,
  isPhase7FeatureAllowed,
  phase7FeatureDependencyCatalog,
  evaluatePhase7Action,
} from "../core/phase7-dependency-catalog.js";

test("manual Supabase workflow is allowed as manual-only", () => {
  assert.equal(evaluatePhase7FeatureAccess("Ride booking and lifecycle"), "allow-manual");
  assert.equal(isPhase7FeatureAllowed("Ride booking and lifecycle"), true);
});

test("provider-dependent features remain disabled", () => {
  for (const feature of [
    "Payment gateway processing", "External AI tutor and model API", "External voice provider",
    "Zoom classroom integration", "CIBIL/bureau integration", "DigiLocker integration",
    "External maps/GPS provider integration", "WhatsApp/calling integration",
    "Lender/NBFC API and automated credit decisions",
  ]) {
    assert.equal(evaluatePhase7FeatureAccess(feature), "deny-disabled", feature);
    assert.equal(isPhase7FeatureAllowed(feature), false, feature);
  }
});

test("unknown features fail closed", () => {
  assert.equal(evaluatePhase7FeatureAccess("Uncatalogued capability"), "deny-unknown");
  assert.equal(isPhase7FeatureAllowed("Uncatalogued capability"), false);
});

test("current catalog makes no integrated claims", () => {
  assert.ok(phase7FeatureDependencyCatalog.every((item) => item.mode !== "integrated"));
});

test("feature gate blocks disabled features before action permission checks", () => {
  assert.equal(evaluatePhase7Action("Payment gateway processing", { tier: 3, action: "pay", userConfirmed: true }), "DENY_FEATURE");
});

test("allowed manual feature still requires confirmation for transaction-tier actions", () => {
  assert.equal(evaluatePhase7Action("Ride booking and lifecycle", { tier: 3, action: "book ride" }), "REQUIRE_CONFIRMATION");
  assert.equal(evaluatePhase7Action("Ride booking and lifecycle", { tier: 3, action: "book ride", userConfirmed: true }), "ALLOW");
});

test("sensitive actions require special approval", () => {
  assert.equal(evaluatePhase7Action("Admin approvals and complaints", { tier: 4, action: "approve sensitive request" }), "REQUIRE_SPECIAL_APPROVAL");
  assert.equal(evaluatePhase7Action("Admin approvals and complaints", { tier: 4, action: "approve sensitive request", specialApproval: true }), "ALLOW");
});
