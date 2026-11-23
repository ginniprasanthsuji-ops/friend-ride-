import test from "node:test";
import assert from "node:assert/strict";
import { isApprovedDependency, validateFeatureDependencies } from "../core/approved-stack-guard.js";

test("only the approved stack is recognized", () => {
  for (const allowed of ["GitHub", "Supabase", "Firebase", "SQL"]) assert.equal(isApprovedDependency(allowed), true);
  for (const denied of ["Zoom", "Cashfree", "OpenAI API", "Google Maps", "CIBIL API", "WhatsApp API", ""]) assert.equal(isApprovedDependency(denied), false);
});

test("manual and disabled declarations are allowed without claiming integrations", () => {
  assert.deepEqual(validateFeatureDependencies([
    { feature: "UPI instruction", dependency: "SQL", mode: "manual" },
    { feature: "External classroom", dependency: "GitHub", mode: "disabled" },
  ]), { valid: true, errors: [] });
});

test("integrated dependencies must be verified", () => {
  assert.equal(validateFeatureDependencies([
    { feature: "Push", dependency: "Firebase", mode: "integrated" },
  ]).valid, false);
  assert.equal(validateFeatureDependencies([
    { feature: "Push", dependency: "Firebase", mode: "integrated", verified: true },
  ]).valid, true);
});

test("unapproved dependencies and malformed declarations fail closed", () => {
  const result = validateFeatureDependencies([
    { feature: "AI tutor", dependency: "AI provider", mode: "integrated", verified: true },
    { feature: "", dependency: "SQL", mode: "manual" },
  ]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("Unapproved dependency")));
  assert.ok(result.errors.some((error) => error.includes("Feature name is required")));
});
