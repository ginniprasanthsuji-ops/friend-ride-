const { test, expect } = require('@playwright/test');

const allPageIds = ["home","cycleDelivery","explore","eventServices","serviceProviderRegister","bankingServices","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","technicianRegister","parcelRelease","orders","tracking","wallet","offers","customerDashboard","driverDashboard","partnerDashboard","partnerOrders","products","inventory","gst","catalogue","subscription","referrals","partnerReports","adminDashboard","crmDashboard","users","referralApprovals","cashRewardApprovals","paymentApprovals","partnerPaymentSettings","platformBusinessSettings","driverApprovals","driverDocumentReviews","partnerApprovals","adminOrders","reports","settings","profile","notifications","support","about","cart","frSupportFeedback","learnTeach","frSuperHub","frCampaignAdmin","frReferralAdmin","frStoreReviewAdmin","frDirectCouponReview","frDriverSubscription"];
const sharedCustomerRoutes = ["home","explore","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","orders","tracking","wallet","offers","profile","notifications","support","about","cart","frSupportFeedback","learnTeach","cycleDelivery","eventServices","serviceProviderRegister","bankingServices","technicianRegister","parcelRelease","frSuperHub"];

test.describe('FRIEND RIDE current V11.1 UI regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      const url = route.request().url();
      // Allow required CDN libraries so the app initializes; block external APIs/maps.
      if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          url.includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('every registered screen remains present and uses the shared design system', async ({ page }) => {
    const result = await page.evaluate(ids => ({
      missing: ids.filter(id => !document.getElementById(id)),
      designSystem: !!document.querySelector('style') && document.documentElement.innerHTML.includes('--purple:') && document.documentElement.innerHTML.includes('--gold:'),
      themeMeta: document.querySelector('meta[name="theme-color"]')?.content,
      bodyBackground: getComputedStyle(document.body).backgroundImage,
      pageCount: document.querySelectorAll('.page').length
    }), allPageIds);
    expect(result.missing).toEqual([]);
    expect(result.designSystem).toBe(true);
    expect(result.themeMeta).toBe('#24105f');
    expect(result.bodyBackground).not.toBe('none');
    expect(result.pageCount).toBe(allPageIds.length);
  });

  test('driver subscription is ₹299 monthly, Razorpay-linked, and driver-only', async ({ page }) => {
    await expect(page.locator('#frDriverSubscriptionCard')).toContainText('₹299 / Month');
    await expect(page.locator('#frDriverSubscriptionCard button')).toBeAttached();

    // Anonymous, customer, partner and admin must not enter the driver-only page.
    for (const role of [null, 'customer', 'partner', 'admin']) {
      await page.evaluate(role => {
        currentUser = role ? { id: 'qa-' + role } : null;
        currentProfile = role ? { role } : null;
        selectedRole = role || 'customer';
        window.showPage('frDriverSubscription');
      }, role);
      await expect(page.locator('#home')).toHaveClass(/active/);
      await expect(page.locator('#frDriverSubscription')).not.toHaveClass(/active/);
    }

    await page.evaluate(() => {
      currentUser={id:'qa-driver'};
      currentProfile={role:'driver'};
      selectedRole='driver';
      window.showPage('frDriverSubscription');
    });
    await expect(page.locator('#frDriverSubscription')).toHaveClass(/active/);
    await expect(page.locator('#frDriverSubscription')).toContainText('₹299 / Month');
    const paymentLink = page.locator('#frDriverSubscription a[href="https://rzp.io/rzp/54cMN1g"]');
    await expect(paymentLink).toBeAttached();
    await expect(paymentLink).toHaveAttribute('target', '_blank');
    await expect(paymentLink).toHaveAttribute('rel', 'noopener');
  });

  test('new home replaces the old home presentation and mirrors live location', async ({ page }) => {
    await expect(page.locator('#home .fr-native-home')).toBeAttached();
    await expect(page.locator('#home .fr-native-home')).toBeVisible();
    await expect(page.locator('#home .home-banner')).toHaveCount(0);
    await expect(page.locator('#home .fr-native-location')).toBeAttached();
    await page.locator('#homeLocationText').evaluate(el => { el.textContent = 'QA GPS location'; });
    await expect(page.locator('#frNativeLocationText')).toHaveText('QA GPS location');
  });

  test('native home preserves customer, driver and partner registration entry points', async ({ page }) => {
    const registrations = page.locator('#home .fr-native-register-grid button[data-fr-native-register]');
    await expect(registrations).toHaveCount(3);
    for (const role of ['customer', 'driver', 'partner']) {
      // Re-activate Home after closing the previous role's auth modal and wait for its transition.
      await page.evaluate(() => window.showPage('home'));
      const entry = page.locator('#home [data-fr-native-register="' + role + '"]');
      await expect(page.locator('#home')).toHaveClass(/active/);
      await expect(entry).toBeVisible({ timeout: 10000 });
      await entry.click();
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await expect(page.locator('#authModal')).toHaveAttribute('data-active-role', role);
      await page.locator('#authModal .close').click();
      await expect(page.locator('#authModal')).not.toHaveClass(/show/);
    }
  });

  test('native home service cards navigate through real click handlers', async ({ page }) => {
    const routeButtons = page.locator('#home .fr-native-home [data-fr-native-route]');
    const expectedRoutes = ['ride','goods','shopping','food','homeServices','homeServices','shopping','laundryServices','homeServices','shops','learnTeach'];
    await expect(routeButtons).toHaveCount(expectedRoutes.length);
    for (let i = 0; i < expectedRoutes.length; i++) {
      await page.evaluate(() => window.showPage('home'));
      const button = routeButtons.nth(i);
      await expect(button).toBeVisible();
      await button.click();
      await expect(page.locator('#' + expectedRoutes[i])).toHaveClass(/active/);
    }
  });

  test('drawer and CRM surfaces use the shared dark surfaces', async ({ page }) => {
    await page.evaluate(() => window.openDrawer());
    await expect(page.locator('.drawer-backdrop')).toHaveClass(/show/);
    const drawerBg = await page.locator('.drawer').evaluate(el => getComputedStyle(el).backgroundImage);
    expect(drawerBg).not.toBe('none');
    await page.evaluate(() => { currentUser={id:'qa-admin'}; currentProfile={role:'admin'}; selectedRole='admin'; window.showPage('crmDashboard'); });
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
    await page.evaluate(() => { currentUser={id:'qa-customer'}; currentProfile={role:'customer'}; selectedRole='customer'; window.showPage('adminDashboard'); });
    await expect(page.locator('#home')).toHaveClass(/active/);
    await page.evaluate(() => { currentUser={id:'qa-admin'}; currentProfile={role:'admin'}; selectedRole='admin'; window.showPage('adminDashboard'); });
    await expect(page.locator('#adminDashboard')).toHaveClass(/active/);
  });

  test('customer OTP login modal uses the current role-specific flow', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    const modal = page.locator('#authModal .modalbox');
    await expect(modal).toBeVisible();
    const style = await modal.evaluate(el => ({ bg: getComputedStyle(el).backgroundImage, color: getComputedStyle(el).color }));
    expect(style.bg).not.toBe('none');
    expect(style.color).toMatch(/rgb\(246, 248, 255\)|rgb\(255, 255, 255\)/);
  });

  test('Admin login modal is role-locked with admin-specific OTP controls', async ({ page }) => {
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

  test('Customer login modal shows customer OTP flow and registration option', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authTitle')).toHaveText('Customer Login');
    await expect(page.locator('#sendLoginOtpButton')).toHaveText('Send Customer SMS OTP');
    await expect(page.locator('#authRegisterButton')).toBeVisible();
    await expect(page.locator('#authModal .rolegrid')).toBeHidden();
  });

  test('all inventoried route IDs have destination elements', async ({ page }) => {
    const missing = await page.evaluate(ids => ids.filter(id => !document.getElementById(id)), allPageIds);
    expect(missing).toEqual([]);
  });
});
