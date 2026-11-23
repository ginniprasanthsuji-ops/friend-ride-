import type { FeatureDependencyDeclaration } from "./approved-stack-guard.js";
import { permissionDecision, type PermissionRequest } from "./permissions.js";

/**
 * Phase 7 safe-mode catalogue. Manual means the workflow may be shown/used
 * without claiming external integrations are active. Provider-dependent features
 * are explicitly disabled. This catalogue is not proof of runtime deactivation.
 */
export const phase7FeatureDependencyCatalog: FeatureDependencyDeclaration[] = [
  { feature: "Ride booking and lifecycle", dependency: "Supabase", mode: "manual" },
  { feature: "Driver onboarding and KYC review", dependency: "Supabase", mode: "manual" },
  { feature: "Partner orders and quotes", dependency: "Supabase", mode: "manual" },
  { feature: "Delivery, parcel, home services", dependency: "Supabase", mode: "manual" },
  { feature: "TASKO and Laundry lifecycle", dependency: "Supabase", mode: "manual" },
  { feature: "Learn/Teach records and homework", dependency: "Supabase", mode: "manual" },
  { feature: "Admin approvals and complaints", dependency: "Supabase", mode: "manual" },
  { feature: "Payment gateway processing", dependency: "GitHub", mode: "disabled" },
  { feature: "External AI tutor and model API", dependency: "GitHub", mode: "disabled" },
  { feature: "External voice provider", dependency: "GitHub", mode: "disabled" },
  { feature: "Zoom classroom integration", dependency: "GitHub", mode: "disabled" },
  { feature: "CIBIL/bureau integration", dependency: "GitHub", mode: "disabled" },
  { feature: "DigiLocker integration", dependency: "GitHub", mode: "disabled" },
  { feature: "External maps/GPS provider integration", dependency: "GitHub", mode: "disabled" },
  { feature: "WhatsApp/calling integration", dependency: "GitHub", mode: "disabled" },
  { feature: "Lender/NBFC API and automated credit decisions", dependency: "GitHub", mode: "disabled" },
  { feature: "Firebase push delivery", dependency: "Firebase", mode: "manual" },
];

export type Phase7FeatureAccess = "allow-manual" | "allow-verified-integrated" | "deny-disabled" | "deny-unverified" | "deny-unknown";

/** Fail closed: only manual workflows or explicitly verified approved integrations are allowed. */
export function evaluatePhase7FeatureAccess(feature: string): Phase7FeatureAccess {
  const declaration = phase7FeatureDependencyCatalog.find((item) => item.feature === feature);
  if (!declaration) return "deny-unknown";
  if (declaration.mode === "disabled") return "deny-disabled";
  if (declaration.mode === "manual") return "allow-manual";
  if (declaration.mode === "integrated" && declaration.verified === true) return "allow-verified-integrated";
  return "deny-unverified";
}

export function isPhase7FeatureAllowed(feature: string): boolean {
  const access = evaluatePhase7FeatureAccess(feature);
  return access === "allow-manual" || access === "allow-verified-integrated";
}

export function getPhase7DependencyMode(feature: string): "integrated" | "manual" | "disabled" | "unknown" {
  const declaration = phase7FeatureDependencyCatalog.find((item) => item.feature === feature);
  return declaration?.mode ?? "unknown";
}


export type Phase7ActionDecision =
  | "ALLOW"
  | "DENY_FEATURE"
  | "REQUIRE_CONFIRMATION"
  | "REQUIRE_SPECIAL_APPROVAL";

/** Combine safe-mode feature gate with the existing tier-based permission system. */
export function evaluatePhase7Action(feature: string, request: PermissionRequest): Phase7ActionDecision {
  if (!isPhase7FeatureAllowed(feature)) return "DENY_FEATURE";
  const decision = permissionDecision(request);
  return decision;
}
