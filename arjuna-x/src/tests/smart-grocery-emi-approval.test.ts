import { describe, expect, it } from "vitest";
import { evaluateGroceryEmiApprovalGate, getGroceryEmiApplicationNextStep, formatGroceryEmiApprovedLimit, type GroceryEmiApplication } from "../core/smart-grocery-emi-approval";
const base: GroceryEmiApplication = { status: "under-review", applicantId: "app-1", identityVerifiedViaDigiLocker: true, digiLockerConsent: true, creditBureauConsent: true, creditCheckStatus: "completed", lenderDecision: "approved", approvedLimitPaise: 500000, currency: "INR", decisionReference: "lender-ref" };
describe("Smart Grocery EMI approval gates", () => {
  it("shows limit only after identity, consents, credit check, and lender approval", () => {
    expect(evaluateGroceryEmiApprovalGate(base)).toEqual({ allowed: true, next: "show-approved-limit" });
    expect(formatGroceryEmiApprovedLimit(base)).toMatchObject({ visible: true, amountPaise: 500000, currency: "INR" });
  });
  it("blocks when DigiLocker consent/identity is missing", () => {
    expect(evaluateGroceryEmiApprovalGate({ ...base, digiLockerConsent: false })).toMatchObject({ allowed: false, reason: "digiLocker-consent-missing" });
    expect(evaluateGroceryEmiApprovalGate({ ...base, identityVerifiedViaDigiLocker: false })).toMatchObject({ allowed: false, reason: "identity-not-verified" });
  });
  it("blocks absent credit bureau consent and unfinished check", () => {
    expect(evaluateGroceryEmiApprovalGate({ ...base, creditBureauConsent: false })).toMatchObject({ allowed: false, reason: "credit-consent-missing" });
    expect(evaluateGroceryEmiApprovalGate({ ...base, creditCheckStatus: "pending" })).toMatchObject({ allowed: false, reason: "credit-check-not-complete" });
  });
  it("never reveals limit before lender approval or for invalid limits", () => {
    expect(formatGroceryEmiApprovedLimit({ ...base, lenderDecision: "pending" })).toMatchObject({ visible: false, reason: "lender-approval-required" });
    expect(formatGroceryEmiApprovedLimit({ ...base, approvedLimitPaise: 0 })).toMatchObject({ visible: false, reason: "invalid-limit" });
  });
  it("returns the next onboarding step", () => {
    expect(getGroceryEmiApplicationNextStep({ ...base, identityVerifiedViaDigiLocker: false })).toBe("identity");
    expect(getGroceryEmiApplicationNextStep({ ...base, creditBureauConsent: false })).toBe("credit-consent");
    expect(getGroceryEmiApplicationNextStep({ ...base, creditCheckStatus: "pending" })).toBe("credit-check");
    expect(getGroceryEmiApplicationNextStep({ ...base, lenderDecision: "pending" })).toBe("lender-review");
  });
});
