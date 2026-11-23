import type { Phase7Role } from "./phase7-identity-gate.js";
import { isPhase7FeatureAllowed } from "./phase7-dependency-catalog.js";

/** Conservative Phase 7 role-feature allowlist; not a replacement for database RLS. */
const roleFeatureAllowlist: Record<string, readonly Phase7Role[]> = {
  "Ride booking and lifecycle": ["customer", "driver", "admin"],
  "Driver onboarding and KYC review": ["driver", "admin"],
  "Partner orders and quotes": ["partner", "customer", "admin"],
  "Delivery, parcel, home services": ["customer", "driver", "partner", "admin"],
  "TASKO and Laundry lifecycle": ["customer", "partner", "admin"],
  "Learn/Teach records and homework": ["teacher", "student", "admin"],
  "Admin approvals and complaints": ["admin"],
  "Firebase push delivery": ["customer", "driver", "partner", "teacher", "student", "admin"],
};

export type Phase7RoleFeatureDecision = "ALLOW_ROLE_FEATURE" | "DENY_ROLE_FEATURE" | "DENY_DISABLED_FEATURE" | "DENY_UNKNOWN_FEATURE";

export function evaluatePhase7RoleFeature(role: Phase7Role, feature: string): Phase7RoleFeatureDecision {
  if (!isPhase7FeatureAllowed(feature)) return "DENY_DISABLED_FEATURE";
  const allowedRoles = roleFeatureAllowlist[feature];
  if (!allowedRoles) return "DENY_UNKNOWN_FEATURE";
  return allowedRoles.includes(role) ? "ALLOW_ROLE_FEATURE" : "DENY_ROLE_FEATURE";
}

export function getPhase7RoleFeatureAllowlist(): Record<string, readonly Phase7Role[]> {
  return Object.fromEntries(Object.entries(roleFeatureAllowlist).map(([feature, roles]) => [feature, [...roles]]));
}
