import { describe, expect, it } from "vitest";
import { routeGinnyBusinessRequest, buildGinnyBusinessSummary } from "../core/ginny-business-assistant";
describe("Ginny business assistant role and scope routing", () => {
  it("allows shop-owner orders only with orders scope", () => {
    expect(routeGinnyBusinessRequest({ role: "shop-owner", message: "show my orders", authorizedDataScopes: ["orders.read"] })).toMatchObject({ intent: "orders", allowed: true });
    expect(routeGinnyBusinessRequest({ role: "shop-owner", message: "show my orders", authorizedDataScopes: [] })).toMatchObject({ allowed: false, reason: "scope-missing" });
  });
  it("blocks unauthorized earnings/admin overview for customer", () => {
    expect(routeGinnyBusinessRequest({ role: "customer", message: "my earnings", authorizedDataScopes: ["earnings.read"] })).toMatchObject({ allowed: false, reason: "role-not-authorized" });
    expect(routeGinnyBusinessRequest({ role: "customer", message: "admin overall platform", authorizedDataScopes: ["admin.reports.read"] })).toMatchObject({ allowed: false, reason: "role-not-authorized" });
  });
  it("routes supported intents and rejects unknown text", () => {
    expect(routeGinnyBusinessRequest({ role: "driver", message: "delivery tracking", authorizedDataScopes: ["delivery.read"] })).toMatchObject({ intent: "delivery-status", allowed: true });
    expect(routeGinnyBusinessRequest({ role: "partner", message: "what is the weather", authorizedDataScopes: [] })).toMatchObject({ intent: "unknown", allowed: false });
  });
  it("sanitizes numeric summary fields and defaults currency", () => {
    expect(buildGinnyBusinessSummary({ orders: 2.7, pendingOrders: -3, earningsPaise: 50000, currency: " INR " })).toEqual({ orders: 2, pendingOrders: undefined, completedOrders: undefined, earningsPaise: 50000, salesPaise: undefined, currency: "INR" });
  });
});
