export type GroceryEmiApplicationStatus = "draft" | "identity-pending" | "identity-verified" | "credit-consent-pending" | "credit-check-pending" | "under-review" | "approved" | "rejected" | "expired";
export type GroceryEmiApplication = {
  status: GroceryEmiApplicationStatus; applicantId: string;
  identityVerifiedViaDigiLocker: boolean; digiLockerConsent: boolean; creditBureauConsent: boolean;
  creditCheckStatus: "not-started" | "pending" | "completed" | "failed";
  lenderDecision: "pending" | "approved" | "rejected"; approvedLimitPaise?: number;
  currency: "INR"; decisionReference?: string;
  adminDecision?: "pending" | "approved" | "rejected";
  adminApprovedLimitPaise?: number; adminApproverId?: string; adminDecisionReference?: string;
};
export type GroceryEmiGateResult = { allowed: true; next: "identity" | "credit-consent" | "credit-check" | "lender-review" | "show-approved-limit" } | { allowed: false; reason: "identity-not-verified" | "digiLocker-consent-missing" | "credit-consent-missing" | "credit-check-not-complete" | "approval-required" | "invalid-limit" | "admin-approval-incomplete" };
/** Gates only: the module does not calculate a score or issue lending decisions. */
export function evaluateGroceryEmiApprovalGate(application: GroceryEmiApplication): GroceryEmiGateResult {
  if (!application.digiLockerConsent) return { allowed: false, reason: "digiLocker-consent-missing" };
  if (!application.identityVerifiedViaDigiLocker) return { allowed: false, reason: "identity-not-verified" };
  if (!application.creditBureauConsent) return { allowed: false, reason: "credit-consent-missing" };
  if (application.creditCheckStatus !== "completed") return { allowed: false, reason: "credit-check-not-complete" };
  const lenderApproved = application.lenderDecision === "approved" && Number.isInteger(application.approvedLimitPaise) && (application.approvedLimitPaise ?? 0) > 0;
  const adminApproved = application.adminDecision === "approved" && Number.isInteger(application.adminApprovedLimitPaise) && (application.adminApprovedLimitPaise ?? 0) > 0 && !!application.adminApproverId?.trim() && !!application.adminDecisionReference?.trim();
  if (!lenderApproved && application.adminDecision === "approved" && !adminApproved) return { allowed: false, reason: "admin-approval-incomplete" };
  if (!lenderApproved && !adminApproved) return { allowed: false, reason: "approval-required" };
  return { allowed: true, next: "show-approved-limit" };
}
export function getGroceryEmiApplicationNextStep(application: GroceryEmiApplication) {
  if (!application.digiLockerConsent || !application.identityVerifiedViaDigiLocker) return "identity" as const;
  if (!application.creditBureauConsent) return "credit-consent" as const;
  if (application.creditCheckStatus !== "completed") return "credit-check" as const;
  if (application.lenderDecision === "pending" && application.adminDecision !== "approved") return "lender-review" as const;
  return evaluateGroceryEmiApprovalGate(application).allowed ? "show-approved-limit" as const : "lender-review" as const;
}
/** Displays a limit from lender OR authorized admin approval only; never AI-estimated. */
export function formatGroceryEmiApprovedLimit(application: GroceryEmiApplication) {
  const gate = evaluateGroceryEmiApprovalGate(application);
  if (!gate.allowed) return { visible: false as const, reason: gate.reason };
  if (application.lenderDecision === "approved" && (application.approvedLimitPaise ?? 0) > 0) return { visible: true as const, amountPaise: application.approvedLimitPaise!, currency: "INR" as const, approvalSource: "lender" as const, reference: application.decisionReference };
  return { visible: true as const, amountPaise: application.adminApprovedLimitPaise!, currency: "INR" as const, approvalSource: "admin" as const, reference: application.adminDecisionReference, approverId: application.adminApproverId };
}
