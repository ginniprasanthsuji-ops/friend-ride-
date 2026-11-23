import { describe, expect, it } from "vitest";
import { buildGroceryEmiCongratulations, submitGroceryEmiQuotation, confirmGroceryEmiAdminOrder } from "../core/smart-grocery-emi-customer-flow";
import type { GroceryEmiApplication } from "../core/smart-grocery-emi-approval";
const approved: GroceryEmiApplication = { status:"approved", applicantId:"cust-1", identityVerifiedViaDigiLocker:true, digiLockerConsent:true, creditBureauConsent:true, creditCheckStatus:"completed", lenderDecision:"pending", currency:"INR", adminDecision:"approved", adminApprovedLimitPaise:500000, adminApproverId:"admin-1", adminDecisionReference:"approval-1" };
const quote={ quotationId:"q-1", customerId:"cust-1", itemsSummary:"Rice, dal, oil", totalPaise:350000, status:"draft" as const };
describe("Smart Grocery EMI customer flow",()=>{
 it("shows congratulations and ₹5000 only for approved limit",()=>{expect(buildGroceryEmiCongratulations(approved)).toMatchObject({title:"🎉 Congratulations!",limitPaise:500000}); expect(buildGroceryEmiCongratulations({...approved,adminDecision:"pending"})).toBeNull();});
 it("submits within approved limit and includes two-day delivery target",()=>{const result=submitGroceryEmiQuotation(approved,quote);expect(result).toMatchObject({accepted:true,quotation:{status:"submitted-to-admin"},customerMessage:{deliveryPromiseDays:2}});});
 it("blocks quotation over limit and without approval",()=>{expect(submitGroceryEmiQuotation(approved,{...quote,totalPaise:600000})).toMatchObject({accepted:false,reason:"limit-exceeded"});expect(submitGroceryEmiQuotation({...approved,adminDecision:"pending"},quote)).toMatchObject({accepted:false,reason:"approval-required"});});
 it("admin confirmation moves quotation to ordered and sends customer message",()=>{const submitted=submitGroceryEmiQuotation(approved,quote);if(!submitted.accepted) throw Error("expected accepted"); expect(confirmGroceryEmiAdminOrder(submitted.quotation,"ORD-123")).toMatchObject({quotation:{status:"ordered"},customerMessage:{deliveryPromiseDays:2}});});
});
