const { test, expect } = require('@playwright/test');

const allPageIds = ["home","cycleDelivery","explore","eventServices","serviceProviderRegister","bankingServices","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","technicianRegister","parcelRelease","orders","tracking","wallet","offers","customerDashboard","driverDashboard","partnerDashboard","partnerOrders","products","inventory","gst","catalogue","subscription","referrals","partnerReports","adminDashboard","crmDashboard","users","referralApprovals","cashRewardApprovals","paymentApprovals","partnerPaymentSettings","platformBusinessSettings","driverApprovals","driverDocumentReviews","partnerApprovals","adminOrders","reports","settings","profile","notifications","support","about","cart","frSupportFeedback","learnTeach","frSuperHub"];
const sharedCustomerRoutes = ["home","explore","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","orders","tracking","wallet","offers","profile","notifications","support","about","cart","frSupportFeedback","learnTeach","cycleDelivery","eventServices","serviceProviderRegister","bankingServices","technicianRegister","parcelRelease","frSuperHub"];

test.describe('FRIEND RIDE in-place Dark + Gold UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => route.abort());
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('every registered screen remains present and uses the shared design system', async ({ page }) => {
    const result = await page.evaluate(ids => ({
      missing: ids.filter(id => !document.getElementById(id)),
      designSystem: !!document.getElementById('fr-dark-gold-design-system'),
      themeMeta: document.querySelector('meta[name="theme-color"]')?.content,
      bodyBackground: getComputedStyle(document.body).backgroundImage,
      pageCount: document.querySelectorAll('main .page').length
    }), allPageIds);
    expect(result.missing).toEqual([]);
    expect(result.designSystem).toBe(true);
    expect(result.themeMeta).toBe('#050b17');
    expect(result.bodyBackground).not.toBe('none');
    expect(result.pageCount).toBe(allPageIds.length);
  });

  test('new home replaces the old home presentation and mirrors live location', async ({ page }) => {
    await expect(page.locator('#home .fr-native-home')).toBeAttached();
    await expect(page.locator('#home .home-banner')).toHaveCount(0);
    await expect(page.locator('#home .fr-native-location')).toBeAttached();
    await page.locator('#homeLocationText').evaluate(el => { el.textContent = 'QA GPS location'; });
    await expect(page.locator('#frNativeLocationText')).toHaveText('QA GPS location');
  });

  test('primary navigation has no duplicate legacy service tabs', async ({ page }) => {
    const nav = page.locator('.premium-bottom');
    await expect(nav.locator('button')).toHaveCount(5);
    await expect(nav).toContainText('Home');
    await expect(nav).toContainText('Services');
    await expect(nav).toContainText('Cart');
    await expect(nav).toContainText('Orders');
    await expect(nav).toContainText('Profile');
    await expect(nav).not.toContainText('Friend Mart');
    await expect(nav).not.toContainText('Food Delivery');
    await expect(nav).not.toContainText('విద్యా సేతు');
  });

  test('shared customer routes activate their existing destination screens', async ({ page }) => {
    for (const route of sharedCustomerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).toHaveClass(/active/);
    }
  });

  test('Admin dashboard role guard blocks non-admin and permits verified admin role', async ({ page }) => {
    await page.evaluate(() => { window.currentProfile = null; window.showPage('adminDashboard'); });
    await expect(page.locator('#home')).toHaveClass(/active/);
    await page.evaluate(() => { window.currentProfile = { role: 'admin' }; window.showPage('adminDashboard'); });
    await expect(page.locator('#adminDashboard')).toHaveClass(/active/);
  });

  test('customer OTP login modal is rendered with dark surfaces', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    const modal = page.locator('#authModal .modalbox');
    await expect(modal).toBeVisible();
    const style = await modal.evaluate(el => ({ bg: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).color }));
    expect(style.bg).not.toBe('none');
    expect(style.color).toMatch(/rgb\(246, 248, 255\)|rgb\(255, 255, 255\)/);
  });
});
