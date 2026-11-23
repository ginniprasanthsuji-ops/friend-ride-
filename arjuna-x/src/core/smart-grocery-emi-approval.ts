export type GroceryEmiApplicationStatus = "draft" | "identity-pending" | "identity-verified" | "credit-consent-pending" | "credit-check-pending" | "under-review" | "approved" | "rejected" | "expired";
export type GroceryEmiApplication = { status: GroceryEmiApplicationStatus; applicantId: string; identityVerifiedViaDigiLocker: boolean; digiLockerConsent: boolean; creditBureauConsent: boolean; creditCheckStatus: "not-started" | "pending" | "completed" | "failed"; lenderDecision: "pending" | "approved" | "rejected"; approvedLimitPaise?: number; currency: "INR"; decisionReference?: string };
export type GroceryEmiGateResult = { allowed: true; next: "identity" | "credit-consent" | "credit-check" | "lender-review" | "show-approved-limit" } | { allowed: false; reason: "identity-not-verified" | "digiLocker-consent-missing" | "credit-consent-missing" | "credit-check-not-complete" | "lender-approval-required" | "invalid-limit" };
/** Eligibility/flow gates only. No credit score calculation or lender decision is made here. */
export function evaluateGroceryEmiApprovalGate(application: GroceryEmiApplication): GroceryEmiGateResult {
  if (!application.digiLockerConsent) return { allowed: false, reason: "digiLocker-consent-missing" };
  if (!application.identityVerifiedViaDigiLocker) return { allowed: false, reason: "identity-not-verified" };
  if (!application.creditBureauConsent) return { allowed: false, reason: "credit-consent-missing" };
  if (application.creditCheckStatus !== "completed") return { allowed: false, reason: "credit-check-not-complete" };
  if (application.lenderDecision !== "approved") return { allowed: false, reason: "lender-approval-required" };
  if (!Number.isInteger(application.approvedLimitPaise) || (application.approvedLimitPaise ?? 0) <= 0) return { allowed: false, reason: "invalid-limit" };
  return { allowed: true, next: "show-approved-limit" };
}
export function getGroceryEmiApplicationNextStep(application: GroceryEmiApplication) {
  if (!application.digiLockerConsent || !application.identityVerifiedViaDigiLocker) return "identity" as const;
  if (!application.creditBureauConsent) return "credit-consent" as const;
  if (application.creditCheckStatus !== "completed") return "credit-check" as const;
  if (application.lenderDecision === "pending") return "lender-review" as const;
  return evaluateGroceryEmiApprovalGate(application).allowed ? "show-approved-limit" as const : "lender-review" as const;
}
/** Credit limit must come only from the approved lending partner's decision, never from an AI/CIBIL score estimate. */
export function formatGroceryEmiApprovedLimit(application: GroceryEmiApplication) {
  const gate = evaluateGroceryEmiApprovalGate(application);
  if (!gate.allowed) return { visible: false as const, reason: gate.reason };
  return { visible: true as const, amountPaise: application.approvedLimitPaise!, currency: "INR" as const, reference: application.decisionReference };
}
