export const approvedDependencyNames = ["GitHub", "Supabase", "Firebase", "SQL"] as const;
export type ApprovedDependency = (typeof approvedDependencyNames)[number];

export type DependencyMode = "integrated" | "manual" | "disabled";

export interface FeatureDependencyDeclaration {
  feature: string;
  dependency: string;
  mode: DependencyMode;
  verified?: boolean;
}

/** Fail closed: integrations must use an approved technology and be explicitly declared. */
export function isApprovedDependency(dependency: unknown): dependency is ApprovedDependency {
  return typeof dependency === "string" && approvedDependencyNames.includes(dependency as ApprovedDependency);
}

export function validateFeatureDependencies(declarations: FeatureDependencyDeclaration[]): {
  valid: boolean;
  errors: string[];
} {
  if (!Array.isArray(declarations)) throw new Error("Dependency declarations must be an array");
  const errors: string[] = [];
  for (const declaration of declarations) {
    if (!declaration || typeof declaration !== "object") {
      errors.push("Invalid dependency declaration");
      continue;
    }
    if (typeof declaration.feature !== "string" || !declaration.feature.trim()) {
      errors.push("Feature name is required");
    }
    if (!isApprovedDependency(declaration.dependency)) {
      errors.push(`Unapproved dependency for feature: ${declaration.feature || "unknown"}`);
    }
    if (!["integrated", "manual", "disabled"].includes(declaration.mode)) {
      errors.push(`Invalid dependency mode for feature: ${declaration.feature || "unknown"}`);
    }
    if (declaration.mode === "integrated" && declaration.verified !== true) {
      errors.push(`Integrated dependency must be verified: ${declaration.feature || "unknown"}`);
    }
  }
  return { valid: errors.length === 0, errors };
}
