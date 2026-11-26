const { test, expect } = require('@playwright/test');

const adminRoutes = [
  'users','driverApprovals','driverDocumentReviews','partnerApprovals',
  'adminOrders','referralApprovals','cashRewardApprovals','paymentApprovals',
  'reports','frReferralAdmin','frStoreReviewAdmin','frCampaignAdmin','settings',
  'crmDashboard','adminDashboard'
];
const partnerRoutes = [
  'partnerOrders','partnerPaymentSettings','catalogue','products','inventory',
  'subscription','referrals','gst','partnerReports','frDirectCouponReview'
];

test.describe('Phase 13 protected-route authorization regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      if (route.request().url().includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          route.request().url().includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.loadPartnerOrders=()=>{};
      window.loadPartnerPaymentSettings=()=>{};
      window.loadPartnerApprovals=()=>{};
      window.loadDriverApprovals=()=>{};
      window.loadDriverDocumentReviews=()=>{};
      window.loadPlatformDetails=async()=>{};
    });
  });

  test('dashboard destinations are role-locked on direct showPage calls', async ({ page }) => {
    const pairs=[['customer','customerDashboard'],['driver','driverDashboard'],['partner','partnerDashboard'],['admin','adminDashboard']];
    for(const [role,route] of pairs){
      await page.evaluate(r=>{currentUser={id:'qa-'+r};currentProfile={role:r};selectedRole=r;},role);
      await page.evaluate(id=>window.showPage(id),route);
      await expect(page.locator('#'+route)).toHaveClass(/active/);
      for(const [,other] of pairs.filter(([r])=>r!==role)){
        await page.evaluate(id=>window.showPage(id),other);
        await expect(page.locator('#'+other)).not.toHaveClass(/active/);
      }
    }
    expect(await page.evaluate(()=>window.dashboardFor('invalid-role'))).toBeNull();
  });

  test('customer cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-customer' }; currentProfile = { role: 'customer' }; selectedRole='customer'; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/, { message: 'Customer direct access blocked: ' + route });
    }
  });

  test('driver cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-driver' }; currentProfile = { role: 'driver' }; selectedRole='driver'; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('partner cannot activate admin-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-partner' }; currentProfile = { role: 'partner' }; selectedRole='partner'; });
    for (const route of adminRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('customer cannot activate partner-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-customer' }; currentProfile = { role: 'customer' }; selectedRole='customer'; });
    for (const route of partnerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('driver cannot activate partner-only route by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-driver' }; currentProfile = { role: 'driver' }; selectedRole='driver'; });
    for (const route of partnerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).not.toHaveClass(/active/);
    }
  });

  test('customer and driver cannot access partner/admin coupon review, partner and admin can', async ({ page }) => {
    for (const role of ['customer','driver']) {
      await page.evaluate(r => { currentUser={id:'qa-'+r}; currentProfile={role:r}; selectedRole=r; }, role);
      await page.evaluate(() => window.showPage('frDirectCouponReview'));
      await expect(page.locator('#frDirectCouponReview')).not.toHaveClass(/active/);
    }
    for (const role of ['partner','admin']) {
      await page.evaluate(r => { currentUser={id:'qa-'+r}; currentProfile={role:r}; selectedRole=r; }, role);
      await page.evaluate(() => window.showPage('frDirectCouponReview'));
      await expect(page.locator('#frDirectCouponReview')).toHaveClass(/active/);
    }
  });

  test('approved partner can access partner routes by direct showPage call', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-partner' }; currentProfile = { role: 'partner', partner_approval_status: 'approved' }; selectedRole='partner'; });
    for (const route of partnerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).toHaveClass(/active/);
    }
  });

  test('admin can access admin routes and partner routes where the existing exception is intended', async ({ page }) => {
    await page.evaluate(() => { currentUser = { id: 'qa-admin' }; currentProfile = { role: 'admin' }; selectedRole='admin'; });
    for (const route of [...adminRoutes, ...partnerRoutes]) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).toHaveClass(/active/);
    }
  });
});
