export type PermissionTier = 0 | 1 | 2 | 3 | 4;

export interface PermissionRequest {
  tier: PermissionTier;
  action: string;
  userConfirmed?: boolean;
  specialApproval?: boolean;
}

/**
 * Tier 0: information
 * Tier 1: search/read
 * Tier 2: prepare/draft
 * Tier 3: booking/transaction - explicit confirmation required
 * Tier 4: sensitive, destructive, or security-critical - special approval
 */
export function permissionDecision(request: PermissionRequest): "ALLOW" | "REQUIRE_CONFIRMATION" | "REQUIRE_SPECIAL_APPROVAL" {
  if (!Number.isInteger(request.tier) || ![0, 1, 2, 3, 4].includes(request.tier)) throw new Error("Invalid permission tier");
  if (typeof request.action !== "string" || !request.action.trim()) throw new Error("Permission action is required");
  if (request.tier <= 2) return "ALLOW";
  if (request.tier === 3) return request.userConfirmed ? "ALLOW" : "REQUIRE_CONFIRMATION";
  return request.specialApproval ? "ALLOW" : "REQUIRE_SPECIAL_APPROVAL";
}
