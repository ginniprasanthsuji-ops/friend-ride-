import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluatePhase7FeatureAccess,
  isPhase7FeatureAllowed,
  phase7FeatureDependencyCatalog,
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
