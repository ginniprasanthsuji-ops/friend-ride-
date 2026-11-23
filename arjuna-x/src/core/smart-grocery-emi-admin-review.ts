export type GroceryEmiAdminRole = "admin" | "customer" | "shop-owner" | "partner" | "driver";
export type GroceryEmiAdminAction = "accept" | "reject";
export type GroceryEmiAdminReview = {
  quotationId: string;
  customerId: string;
  status: "submitted-to-admin" | "admin-accepted" | "rejected" | "ordered" | "delivered";
  totalPaise: number;
  itemsSummary: string;
};
export type GroceryEmiAuditEvent = {
  eventId: string;
  quotationId: string;
  customerId: string;
  actorId: string;
  action: GroceryEmiAdminAction;
  previousStatus: GroceryEmiAdminReview["status"];
  newStatus: "admin-accepted" | "rejected";
  timestampIso: string;
  reason?: string;
};
export type GroceryEmiAdminReviewResult =
  | { accepted: true; quotation: GroceryEmiAdminReview; auditEvent: GroceryEmiAuditEvent }
  | { accepted: false; reason: "admin-role-required" | "invalid-review" | "quotation-not-pending" | "rejection-reason-required" };

/**
 * Pure review transition. Server authentication, authorization, persistence, and
 * audit-log durability must be enforced by the API/database layer, not this helper.
 */
export function reviewGroceryEmiQuotation(input: {
  actorId: string;
  actorRole: GroceryEmiAdminRole;
  action: GroceryEmiAdminAction;
  eventId: string;
  timestampIso: string;
  quotation: GroceryEmiAdminReview;
  rejectionReason?: string;
}): GroceryEmiAdminReviewResult {
  if (input.actorRole !== "admin") return { accepted: false, reason: "admin-role-required" };
  if (!input.actorId.trim() || !input.eventId.trim() || !input.quotation.quotationId.trim() || !input.quotation.customerId.trim() || !input.quotation.itemsSummary.trim() || !Number.isInteger(input.quotation.totalPaise) || input.quotation.totalPaise <= 0 || !Number.isFinite(Date.parse(input.timestampIso))) return { accepted: false, reason: "invalid-review" };
  if (input.quotation.status !== "submitted-to-admin") return { accepted: false, reason: "quotation-not-pending" };
  if (input.action === "reject" && !input.rejectionReason?.trim()) return { accepted: false, reason: "rejection-reason-required" };
  const nextStatus = input.action === "accept" ? "admin-accepted" as const : "rejected" as const;
  const quotation = { ...input.quotation, status: nextStatus };
  const auditEvent: GroceryEmiAuditEvent = {
    eventId: input.eventId,
    quotationId: input.quotation.quotationId,
    customerId: input.quotation.customerId,
    actorId: input.actorId,
    action: input.action,
    previousStatus: input.quotation.status,
    newStatus: nextStatus,
    timestampIso: input.timestampIso,
    ...(input.action === "reject" ? { reason: input.rejectionReason!.trim() } : {}),
  };
  return { accepted: true, quotation, auditEvent };
}
