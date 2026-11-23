import { evaluateGroceryEmiApprovalGate, formatGroceryEmiApprovedLimit, type GroceryEmiApplication } from "./smart-grocery-emi-approval";

export type GroceryEmiQuotation = { quotationId: string; customerId: string; itemsSummary: string; totalPaise: number; status: "draft" | "submitted-to-admin" | "admin-accepted" | "rejected" | "ordered" | "delivered"; adminOrderReference?: string };
export type GroceryEmiCustomerMessage = { title: string; body: string; limitPaise?: number; deliveryPromiseDays?: number; quotationId?: string };

/** Customer congratulation appears only after an authoritative approval gate passes. */
export function buildGroceryEmiCongratulations(application: GroceryEmiApplication): GroceryEmiCustomerMessage | null {
  const approved = formatGroceryEmiApprovedLimit(application);
  if (!approved.visible) return null;
  const amount = (approved.amountPaise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  return { title: "🎉 Congratulations!", body: `మీ Smart Grocery EMI limit ₹${amount} approve అయింది. ఇప్పుడు FRIEND RIDE app ద్వారా groceries quotation పంపించవచ్చు.`, limitPaise: approved.amountPaise };
}

/** Customer submits a quotation request; admin procurement/order workflow follows. */
export function submitGroceryEmiQuotation(application: GroceryEmiApplication, quotation: GroceryEmiQuotation): { accepted: true; quotation: GroceryEmiQuotation; customerMessage: GroceryEmiCustomerMessage } | { accepted: false; reason: "approval-required" | "invalid-quotation" | "limit-exceeded" } {
  const approved = formatGroceryEmiApprovedLimit(application);
  if (!approved.visible) return { accepted: false, reason: "approval-required" };
  if (!quotation.quotationId.trim() || !quotation.customerId.trim() || !quotation.itemsSummary.trim() || !Number.isInteger(quotation.totalPaise) || quotation.totalPaise <= 0) return { accepted: false, reason: "invalid-quotation" };
  if (quotation.totalPaise > approved.amountPaise) return { accepted: false, reason: "limit-exceeded" };
  const submitted = { ...quotation, status: "submitted-to-admin" as const };
  return { accepted: true, quotation: submitted, customerMessage: { title: "Quotation received", body: "మీ quotation Admin కి పంపించబడింది. Admin ద్వారా సామాన్లు order చేసిన తర్వాత delivery సాధారణంగా 2 రోజుల్లో అందించే లక్ష్యం ఉంటుంది. Order confirmation తర్వాత delivery status updates వస్తాయి.", deliveryPromiseDays: 2, quotationId: quotation.quotationId } };
}

/** Admin acceptance creates the order; delivery target is two days after order confirmation, not a guarantee. */
export function confirmGroceryEmiAdminOrder(quotation: GroceryEmiQuotation, adminOrderReference: string): { quotation: GroceryEmiQuotation; customerMessage: GroceryEmiCustomerMessage } | null {
  if (quotation.status !== "submitted-to-admin" || !adminOrderReference.trim()) return null;
  const ordered = { ...quotation, status: "ordered" as const, adminOrderReference };
  return { quotation: ordered, customerMessage: { title: "Order confirmed", body: "మీ groceries quotation Admin accept చేసి order confirm చేశారు. Delivery target: order confirmation నుంచి 2 రోజుల్లో. Tracking/status updates app లో అందుబాటులో ఉంటాయి.", deliveryPromiseDays: 2, quotationId: quotation.quotationId } };
}
