import test from "node:test";
import assert from "node:assert/strict";
import { validateFeatureDependencies } from "../core/approved-stack-guard.js";
import { phase7FeatureDependencyCatalog, getPhase7DependencyMode } from "../core/phase7-dependency-catalog.js";

test("Phase 7 catalog declarations all use approved dependency names and valid modes", () => {
  const result = validateFeatureDependencies(phase7FeatureDependencyCatalog);
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("external-provider features are disabled under approved-stack restriction", () => {
  const disabledFeatures = [
    "Payment gateway processing",
    "External AI tutor and model API",
    "External voice provider",
    "Zoom classroom integration",
    "CIBIL/bureau integration",
    "DigiLocker integration",
    "External maps/GPS provider integration",
    "WhatsApp/calling integration",
    "Lender/NBFC API and automated credit decisions",
  ];
  for (const feature of disabledFeatures) assert.equal(getPhase7DependencyMode(feature), "disabled", feature);
});

test("workflow features are preserved as manual pending integration verification", () => {
  const manualFeatures = [
    "Ride booking and lifecycle",
    "Driver onboarding and KYC review",
    "Partner orders and quotes",
    "Delivery, parcel, home services",
    "TASKO and Laundry lifecycle",
    "Learn/Teach records and homework",
    "Admin approvals and complaints",
    "Firebase push delivery",
  ];
  for (const feature of manualFeatures) assert.equal(getPhase7DependencyMode(feature), "manual", feature);
});

test("unknown feature names fail closed to unknown mode", () => {
  assert.equal(getPhase7DependencyMode("unlisted integration"), "unknown");
});
