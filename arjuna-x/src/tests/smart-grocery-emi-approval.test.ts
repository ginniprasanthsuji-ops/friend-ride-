import { describe, expect, it } from "vitest";
import { evaluateGroceryEmiApprovalGate, getGroceryEmiApplicationNextStep, formatGroceryEmiApprovedLimit, type GroceryEmiApplication } from "../core/smart-grocery-emi-approval";
const base: GroceryEmiApplication = { status: "under-review", applicantId: "app-1", identityVerifiedViaDigiLocker: true, digiLockerConsent: true, creditBureauConsent: true, creditCheckStatus: "completed", lenderDecision: "approved", approvedLimitPaise: 500000, currency: "INR", decisionReference: "lender-ref" };
const adminApproved: GroceryEmiApplication = { ...base, lenderDecision: "pending", approvedLimitPaise: undefined, adminDecision: "approved", adminApprovedLimitPaise: 250000, adminApproverId: "admin-7", adminDecisionReference: "admin-ref-9" };
describe("Smart Grocery EMI approval gates", () => {
  it("shows limit after identity, consents, credit check, and lender approval", () => {
    expect(evaluateGroceryEmiApprovalGate(base)).toEqual({ allowed: true, next: "show-approved-limit" });
    expect(formatGroceryEmiApprovedLimit(base)).toMatchObject({ visible: true, amountPaise: 500000, currency: "INR", approvalSource: "lender" });
  });
  it("supports separate authorized admin approval", () => {
    expect(evaluateGroceryEmiApprovalGate(adminApproved)).toMatchObject({ allowed: true });
    expect(formatGroceryEmiApprovedLimit(adminApproved)).toMatchObject({ visible: true, amountPaise: 250000, approvalSource: "admin", approverId: "admin-7" });
  });
  it("requires admin approver ID and audit reference", () => {
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, adminApproverId: "" })).toMatchObject({ allowed: false, reason: "admin-approval-incomplete" });
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, adminDecisionReference: "" })).toMatchObject({ allowed: false, reason: "admin-approval-incomplete" });
  });
  it("blocks if identity/consent/check gates are missing regardless of admin decision", () => {
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, digiLockerConsent: false })).toMatchObject({ allowed: false, reason: "digiLocker-consent-missing" });
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, identityVerifiedViaDigiLocker: false })).toMatchObject({ allowed: false, reason: "identity-not-verified" });
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, creditBureauConsent: false })).toMatchObject({ allowed: false, reason: "credit-consent-missing" });
    expect(evaluateGroceryEmiApprovalGate({ ...adminApproved, creditCheckStatus: "pending" })).toMatchObject({ allowed: false, reason: "credit-check-not-complete" });
  });
  it("does not reveal limit when neither approval pathway is complete", () => {
    expect(formatGroceryEmiApprovedLimit({ ...base, lenderDecision: "pending" })).toMatchObject({ visible: false, reason: "approval-required" });
    expect(formatGroceryEmiApprovedLimit({ ...base, approvedLimitPaise: 0 })).toMatchObject({ visible: false, reason: "approval-required" });
  });
  it("returns next onboarding step", () => {
    expect(getGroceryEmiApplicationNextStep({ ...base, identityVerifiedViaDigiLocker: false })).toBe("identity");
    expect(getGroceryEmiApplicationNextStep({ ...base, creditBureauConsent: false })).toBe("credit-consent");
    expect(getGroceryEmiApplicationNextStep({ ...base, creditCheckStatus: "pending" })).toBe("credit-check");
    expect(getGroceryEmiApplicationNextStep({ ...base, lenderDecision: "pending" })).toBe("lender-review");
  });
});
