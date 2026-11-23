import type { FeatureDependencyDeclaration } from "./approved-stack-guard.js";

/**
 * Phase 7 safe-mode catalogue for feature workflow dependencies.
 * Existing workflows are preserved; this catalog does not claim backend integrations are verified.
 * External-provider-dependent capability is disabled or clearly manual.
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

export function getPhase7DependencyMode(feature: string): "integrated" | "manual" | "disabled" | "unknown" {
  const declaration = phase7FeatureDependencyCatalog.find((item) => item.feature === feature);
  return declaration?.mode ?? "unknown";
}
