const { test, expect } = require('@playwright/test');

const adminRoutes = [
  'users','driverApprovals','driverDocumentReviews','partnerApprovals',
  'adminOrders','referralApprovals','cashRewardApprovals','paymentApprovals',
  'reports','frReferralAdmin','frStoreReviewAdmin','frDirectCouponReview',
  'frCampaignAdmin','settings','frSuperHub'
];
const partnerRoutes = [
  'partnerOrders','partnerPaymentSettings','catalogue','products','inventory',
  'subscription','referrals','gst','partnerReports'
];

test.describe('Phase 13 protected-route authorization regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      if (route.request().url().includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          route.request().url().includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('customer cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-customer' }; window.currentProfile = { role: 'customer' }; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/, { message: 'Customer direct access blocked: ' + route });
    }
  });

  test('driver cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-driver' }; window.currentProfile = { role: 'driver' }; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('partner cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-partner' }; window.currentProfile = { role: 'partner' }; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('customer cannot activate partner-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-customer' }; window.currentProfile = { role: 'customer' }; });
    for (const route of partnerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('driver cannot activate partner-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-driver' }; window.currentProfile = { role: 'driver' }; });
    for (const route of partnerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('admin can access admin routes and partner routes where the existing exception is intended', async ({ page }) => {
    await page.evaluate(() => { window.currentUser = { id: 'qa-admin' }; window.currentProfile = { role: 'admin' }; });
    for (const route of [...adminRoutes, ...partnerRoutes]) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).toHaveClass(/active/);
    }
  });
});
