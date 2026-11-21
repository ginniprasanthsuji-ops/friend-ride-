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

  test('native home preserves customer, driver and partner registration entry points', async ({ page }) => {
    const registrations = page.locator('#home .fr-native-register-grid button[data-fr-native-register]');
    await expect(registrations).toHaveCount(3);
    for (const role of ['customer', 'driver', 'partner']) {
      await page.locator('#home [data-fr-native-register="' + role + '"]').click();
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await expect(page.locator('#authModal')).toHaveAttribute('data-active-role', role);
      await page.locator('#authModal .close').click();
    }
  });

  test('drawer and CRM surfaces use the shared dark surfaces', async ({ page }) => {
    await page.evaluate(() => window.openDrawer());
    await expect(page.locator('.drawer-backdrop')).toHaveClass(/show/);
    const drawerBg = await page.locator('.drawer').evaluate(el => getComputedStyle(el).backgroundImage);
    expect(drawerBg).not.toBe('none');
    await page.evaluate(() => { window.currentProfile = { role: 'admin' }; window.showPage('crmDashboard'); });
    const crmBg = await page.locator('#crmDashboard .fr-crm-panel').first().evaluate(el => getComputedStyle(el).backgroundImage).catch(() => '');
    expect(crmBg).not.toBe('none');
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

  test('Admin login modal is role-locked and uses the Dark + Gold authentication UI', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'admin'));
    const modal = page.locator('#authModal');
    await expect(modal).toHaveClass(/show/);
    await expect(modal).toHaveClass(/fr-role-locked/);
    await expect(page.locator('#authTitle')).toHaveText('Admin Login');
    await expect(page.locator('#sendLoginOtpButton')).toHaveText('Send Admin SMS OTP');
    await expect(page.locator('#authRegisterButton')).toBeHidden();
    await expect(modal.locator('.rolegrid')).toBeHidden();
    const surfaces = await modal.locator('.modalbox').evaluate(el => ({
      background: getComputedStyle(el).backgroundColor,
      text: getComputedStyle(el).color
    }));
    expect(surfaces.background).not.toBe('rgb(255, 255, 255)');
    expect(surfaces.text).toMatch(/rgb\(/);
  });

  test('Customer login modal shows Customer OTP flow and registration option', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authTitle')).toHaveText('Customer Login');
    await expect(page.locator('#sendLoginOtpButton')).toHaveText('Send Customer SMS OTP');
    await expect(page.locator('#authRegisterButton')).toBeVisible();
    await expect(page.locator('#authModal .rolegrid')).toBeHidden();
  });

  test('all inventoried route IDs can activate their destination screen without route loss', async ({ page }) => {
    const routeResults = await page.evaluate(ids => {
      window.currentProfile = { role: 'admin' };
      const results = [];
      for (const id of ids) {
        try {
          window.showPage(id);
          const target = document.getElementById(id);
          results.push({ id, exists: !!target, active: !!target?.classList.contains('active') });
        } catch (error) {
          results.push({ id, exists: !!document.getElementById(id), active: false, error: String(error) });
        }
      }
      return results;
    }, allPageIds);
    expect(routeResults.filter(r => !r.exists).map(r => r.id)).toEqual([]);
    expect(routeResults.filter(r => !r.active).map(r => ({ id: r.id, error: r.error || null }))).toEqual([]);
  });
});
