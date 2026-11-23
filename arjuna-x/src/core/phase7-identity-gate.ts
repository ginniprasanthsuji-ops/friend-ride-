import { evaluatePhase7Action, type Phase7ActionDecision } from "./phase7-dependency-catalog.js";
import type { PermissionRequest } from "./permissions.js";

export type Phase7Role = "customer" | "driver" | "partner" | "admin" | "teacher" | "student";

export interface Phase7IdentityContext {
  authenticated: boolean;
  actorId: string;
  sessionActorId: string;
  role: Phase7Role;
}

export type Phase7IdentityActionDecision = Phase7ActionDecision | "DENY_IDENTITY" | "DENY_ROLE";

/**
 * Identity-bound Phase 7 gate. This is a core policy helper, not yet wired into
 * application routes. It fails closed for missing auth, mismatched session actor,
 * and roles outside the explicit allow-list.
 */
export function evaluatePhase7IdentityAction(
  feature: string,
  identity: Phase7IdentityContext,
  request: PermissionRequest,
): Phase7IdentityActionDecision {
  if (!identity || identity.authenticated !== true ||
      typeof identity.actorId !== "string" || !identity.actorId.trim() ||
      typeof identity.sessionActorId !== "string" || !identity.sessionActorId.trim() ||
      identity.actorId !== identity.sessionActorId) return "DENY_IDENTITY";
  if (!["customer", "driver", "partner", "admin", "teacher", "student"].includes(identity.role)) return "DENY_ROLE";
  if (feature === "Admin approvals and complaints" && identity.role !== "admin") return "DENY_ROLE";
  return evaluatePhase7Action(feature, request);
}
