import { describe, expect, it } from "vitest";
import { reviewGroceryEmiQuotation } from "../core/smart-grocery-emi-admin-review";
const quotation = { quotationId:"q-77", customerId:"cust-9", status:"submitted-to-admin" as const, totalPaise:185000, itemsSummary:"Rice, oil, dal" };
const base = { actorId:"admin-7", actorRole:"admin" as const, eventId:"evt-1", timestampIso:"2026-11-23T06:00:00.000Z", quotation };
describe("Smart Grocery EMI admin quotation review", () => {
  it("allows admin acceptance and returns an audit event", () => {
    expect(reviewGroceryEmiQuotation({...base, action:"accept"})).toMatchObject({accepted:true, quotation:{status:"admin-accepted"}, auditEvent:{action:"accept", previousStatus:"submitted-to-admin", newStatus:"admin-accepted", actorId:"admin-7"}});
  });
  it("requires admin role", () => {
    expect(reviewGroceryEmiQuotation({...base, actorRole:"customer", action:"accept"})).toMatchObject({accepted:false, reason:"admin-role-required"});
  });
  it("requires rejection reason", () => {
    expect(reviewGroceryEmiQuotation({...base, action:"reject"})).toMatchObject({accepted:false, reason:"rejection-reason-required"});
  });
  it("rejects non-pending quotations", () => {
    expect(reviewGroceryEmiQuotation({...base, action:"accept", quotation:{...quotation,status:"ordered"}})).toMatchObject({accepted:false, reason:"quotation-not-pending"});
  });
  it("records rejection reason in audit event", () => {
    expect(reviewGroceryEmiQuotation({...base, action:"reject", rejectionReason:"Out of stock"})).toMatchObject({accepted:true, quotation:{status:"rejected"}, auditEvent:{action:"reject", reason:"Out of stock", newStatus:"rejected"}});
  });
  it("validates review inputs", () => {
    expect(reviewGroceryEmiQuotation({...base, action:"accept", actorId:" "})).toMatchObject({accepted:false, reason:"invalid-review"});
  });
});
