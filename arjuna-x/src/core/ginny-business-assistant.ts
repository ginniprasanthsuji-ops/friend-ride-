export type GinnyBusinessRole = "shop-owner" | "partner" | "driver" | "delivery-partner" | "admin" | "customer";
export type GinnyBusinessIntent = "orders" | "earnings" | "sales" | "delivery-status" | "business-insights" | "support" | "admin-overview" | "unknown";
export type GinnyBusinessRequest = { role: GinnyBusinessRole; message: string; authorizedDataScopes: readonly string[] };
export type GinnyBusinessRouting = { intent: GinnyBusinessIntent; allowed: boolean; requiredScope?: string; reason?: "role-not-authorized" | "scope-missing" | "unknown-intent"; normalizedMessage: string };
const ROLE_INTENTS: Record<GinnyBusinessRole, readonly GinnyBusinessIntent[]> = {
  "shop-owner": ["orders", "sales", "business-insights", "support"],
  partner: ["orders", "earnings", "delivery-status", "business-insights", "support"],
  driver: ["earnings", "delivery-status", "support"],
  "delivery-partner": ["orders", "earnings", "delivery-status", "support"],
  admin: ["orders", "earnings", "sales", "delivery-status", "business-insights", "support", "admin-overview"],
  customer: ["support"],
};
const SCOPE_BY_INTENT: Partial<Record<GinnyBusinessIntent, string>> = {
  orders: "orders.read", earnings: "earnings.read", sales: "sales.read", "delivery-status": "delivery.read", "business-insights": "business-insights.read", "admin-overview": "admin.reports.read", support: "support.read",
};
const PATTERNS: Array<[GinnyBusinessIntent, RegExp]> = [
  ["admin-overview", /admin|overall|platform|అడ్మిన్|మొత్తం|पूरे प्लेटफॉर्म/i],
  ["earnings", /earning|income|commission|profit|వచ్చిన డబ్బు|ఆదాయం|कमाई/i],
  ["delivery-status", /delivery|delivered|tracking|డెలివరీ|ట్రాకింగ్|पहुंच|डिलीवरी/i],
  ["sales", /sales|sold|revenue|విక్రయ|అమ్మకాలు|बिक्री/i],
  ["orders", /order|orders|pending|completed|ఆర్డర్|ऑर्डर/i],
  ["business-insights", /suggest|improve|business|insight|recommend|మెరుగుపర|సలహా|व्यापार|सुझाव/i],
  ["support", /help|support|complaint|issue|సహాయం|సమస్య|मदद|समस्या/i],
];
/** Intent routing + role/scope authorization only. It neither fetches business data nor calls AI. */
export function routeGinnyBusinessRequest(request: GinnyBusinessRequest): GinnyBusinessRouting {
  const normalizedMessage = request.message.trim().slice(0, 2000);
  const intent = PATTERNS.find(([, pattern]) => pattern.test(normalizedMessage))?.[0] ?? "unknown";
  if (intent === "unknown") return { intent, allowed: false, reason: "unknown-intent", normalizedMessage };
  if (!ROLE_INTENTS[request.role].includes(intent)) return { intent, allowed: false, reason: "role-not-authorized", normalizedMessage };
  const requiredScope = SCOPE_BY_INTENT[intent];
  if (requiredScope && !request.authorizedDataScopes.includes(requiredScope)) return { intent, allowed: false, requiredScope, reason: "scope-missing", normalizedMessage };
  return { intent, allowed: true, requiredScope, normalizedMessage };
}

export type GinnyBusinessSummary = { orders?: number; pendingOrders?: number; completedOrders?: number; earningsPaise?: number; salesPaise?: number; currency?: string };
/** Sanitized, compact summary builder; raw customer identifiers and personal data are never accepted. */
export function buildGinnyBusinessSummary(input: GinnyBusinessSummary) {
  const safeCount = (v?: number) => Number.isFinite(v) && v! >= 0 ? Math.floor(v!) : undefined;
  const safeMoney = (v?: number) => Number.isFinite(v) && v! >= 0 ? Math.floor(v!) : undefined;
  return { orders: safeCount(input.orders), pendingOrders: safeCount(input.pendingOrders), completedOrders: safeCount(input.completedOrders), earningsPaise: safeMoney(input.earningsPaise), salesPaise: safeMoney(input.salesPaise), currency: input.currency?.trim().slice(0, 3) || "INR" };
}
