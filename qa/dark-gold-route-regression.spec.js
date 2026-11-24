const { test, expect } = require('@playwright/test');

const allPageIds = ["home","cycleDelivery","explore","eventServices","serviceProviderRegister","bankingServices","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","technicianRegister","parcelRelease","orders","tracking","wallet","offers","customerDashboard","driverDashboard","partnerDashboard","partnerOrders","products","inventory","gst","catalogue","subscription","referrals","partnerReports","adminDashboard","crmDashboard","users","referralApprovals","cashRewardApprovals","paymentApprovals","partnerPaymentSettings","platformBusinessSettings","driverApprovals","driverDocumentReviews","partnerApprovals","adminOrders","reports","settings","profile","notifications","support","about","cart","frSupportFeedback","learnTeach","frSuperHub"];

test.describe('FRIEND RIDE Phase 12 motion and route safety', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      const url = route.request().url();
      if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') || url.includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('all inventoried page targets exist', async ({ page }) => {
    const missing = await page.evaluate(ids => ids.filter(id => !document.getElementById(id)), allPageIds);
    expect(missing).toEqual([]);
  });

  test('all inventoried page targets activate without route loss', async ({ page }) => {
    const results = await page.evaluate(ids => {
      window.currentProfile = { role: 'admin' };
      return ids.map(id => {
        try { window.showPage(id); return { id, exists: !!document.getElementById(id), active: !!document.getElementById(id)?.classList.contains('active') }; }
        catch (e) { return { id, exists: !!document.getElementById(id), active: false, error: String(e) }; }
      });
    }, allPageIds);
    expect(results.filter(r => !r.exists || !r.active)).toEqual([]);
  });

  test('reduced motion preference is respected by the browser and stylesheet', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const result = await page.evaluate(() => ({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, stylesheetRule: [...document.styleSheets].some(sheet => { try { return [...sheet.cssRules].some(rule => rule.cssText.includes('prefers-reduced-motion')); } catch { return false; } }) }));
    expect(result.matches).toBe(true);
    expect(result.stylesheetRule).toBe(true);
  });

  test('360px viewport has no significant horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    expect(widths.page).toBeLessThanOrEqual(widths.viewport + 8);
  });

  test('repeated route switching keeps one active page and replays entry motion', async ({ page }) => {
    const sequence = ['home', 'ride', 'shops', 'wallet', 'home', 'tracking', 'home'];
    const checks = await page.evaluate(ids => {
      window.currentProfile = { role: 'customer' };
      return ids.map(id => {
        window.showPage(id);
        const activePages = [...document.querySelectorAll('.page.active')].map(el => el.id);
        const page = document.getElementById(id);
        const animation = getComputedStyle(page).animationName;
        return { id, activePages, animation };
      });
    }, sequence);
    expect(checks.every(c => c.activePages.length === 1 && c.activePages[0] === c.id)).toBe(true);
    expect(checks.every(c => c.animation.includes('fr12-page-enter'))).toBe(true);
  });

  test('route visibility semantics match active state', async ({ page }) => {
    const result = await page.evaluate(() => {
      window.currentProfile = { role: 'customer' };
      window.showPage('ride');
      return [...document.querySelectorAll('main .page')].map(p => ({
        id: p.id,
        active: p.classList.contains('active'),
        ariaHidden: p.getAttribute('aria-hidden'),
        inert: 'inert' in p ? p.inert : null
      }));
    });
    expect(result.filter(p => p.active)).toHaveLength(1);
    expect(result.find(p => p.id === 'ride')).toMatchObject({ active: true, ariaHidden: 'false', inert: false });
    expect(result.filter(p => !p.active).every(p => p.ariaHidden === 'true' && p.inert === true)).toBe(true);
  });

  test('customer auth entry opens modal without losing role context', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login', 'customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    const role = await page.evaluate(() => localStorage.getItem('friendride_selected_role'));
    expect(role).toBe('customer');
  });
});