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

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => {
    const url = route.request().url();
    if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') || url.includes('unpkg.com/leaflet@1.9.4/') || url.includes('www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js') || url.includes('www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js')) return route.continue();
    return route.abort();
  });
});

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
    currentProfile = { role: 'admin' };
    currentUser = null;
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


test('ARJUNA X PWA smoke: manifest, icons and service worker resolve on isolated localhost', async ({ page }) => {
  await page.goto('./', { waitUntil: 'load' });
  await page.waitForFunction(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return registrations.some(reg => reg.active?.scriptURL.endsWith('/service-worker.js'));
  }, null, { timeout: 20000 });

  const registration = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return { scope: reg.scope, activeScript: reg.active?.scriptURL };
  });
  expect(registration.activeScript).toMatch(/\/service-worker\.js$/);
  expect(registration.scope).toBe(new URL('./', location.href).toString());

  const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestLink).toBe('./manifest.webmanifest');
  const response = await page.request.get(manifestLink);
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.name).toBe('FRIEND RIDE');
  expect(manifest.start_url).toBe('./');
  expect(manifest.scope).toBe('./');
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some(icon => icon.sizes === '192x192')).toBeTruthy();
  expect(manifest.icons.some(icon => icon.sizes === '512x512')).toBeTruthy();
  const iconResponses = await Promise.all(manifest.icons.map(icon => page.request.get(icon.src)));
  expect(iconResponses.every(icon => icon.ok())).toBeTruthy();
});
