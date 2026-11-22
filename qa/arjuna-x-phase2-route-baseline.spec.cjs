const { test, expect } = require('@playwright/test');

const routeIds = [
  "home",
  "cycleDelivery",
  "explore",
  "eventServices",
  "serviceProviderRegister",
  "bankingServices",
  "ride",
  "scheduled",
  "goods",
  "parcel",
  "food",
  "restaurantCatalogue",
  "shops",
  "shopping",
  "homeServices",
  "laundryServices",
  "storeBrowse",
  "customerCatalogue",
  "marketCart",
  "technicianRegister",
  "parcelRelease",
  "orders",
  "tracking",
  "wallet",
  "offers",
  "customerDashboard",
  "driverDashboard",
  "partnerDashboard",
  "partnerOrders",
  "products",
  "inventory",
  "gst",
  "catalogue",
  "subscription",
  "referrals",
  "partnerReports",
  "adminDashboard",
  "crmDashboard",
  "users",
  "referralApprovals",
  "cashRewardApprovals",
  "paymentApprovals",
  "partnerPaymentSettings",
  "platformBusinessSettings",
  "driverApprovals",
  "driverDocumentReviews",
  "partnerApprovals",
  "adminOrders",
  "reports",
  "settings",
  "profile",
  "notifications",
  "support",
  "about",
  "cart",
  "frSupportFeedback",
  "learnTeach",
  "frSuperHub"
];

test('ARJUNA X baseline: all 58 existing route IDs are present in the runtime page registry', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const audit = await page.evaluate(ids => {
    const pageElements = [...document.querySelectorAll('.page')];
    const actualIds = pageElements.map(el => el.id).filter(Boolean);
    return {
      actualCount: pageElements.length,
      missing: ids.filter(id => !document.getElementById(id)),
      extra: actualIds.filter(id => !ids.includes(id)),
      duplicatePageIds: actualIds.filter((id, index) => actualIds.indexOf(id) !== index)
    };
  }, routeIds);
  expect(audit.actualCount).toBe(58);
  expect(audit.missing).toEqual([]);
  expect(audit.extra).toEqual([]);
  expect(audit.duplicatePageIds).toEqual([]);
});

test('ARJUNA X baseline: every inventoried page can be activated by the existing router', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(ids => {
    window.currentProfile = { role: 'admin' };
    return ids.map(id => {
      try {
        window.showPage(id);
        return { id, active: !!document.getElementById(id)?.classList.contains('active') };
      } catch (error) {
        return { id, active: false, error: String(error) };
      }
    });
  }, routeIds);
  expect(result.filter(item => !item.active)).toEqual([]);
});
