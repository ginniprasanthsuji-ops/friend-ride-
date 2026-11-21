const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE TASKO / Laundry main-branch integration', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.route('https://**/*', route => route.abort());
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => typeof window.frHandleShopCategoryChange === 'function', null, { timeout: 15000 });
    await page.evaluate(() => {
      window.currentUser = { id: 'playwright-test-user' };
      window.requireLogin = (callback) => callback();
      // Isolate navigation from unrelated global auth/role state in this legacy single-file app.
      window.__frLastPage = null;
      window.showPage = (id) => { window.__frLastPage = id; };
      document.querySelectorAll('.page').forEach(section => section.classList.toggle('active', section.id === 'shops'));
    });
  });

  test('Store Category exposes TASKO / GIGGER and Laundry', async ({ page }) => {
    const options = await page.locator('#shopCategory option').allTextContents();
    expect(options).toContain('TASKO / GIGGER Services');
    expect(options).toContain('Laundry Services');
  });

  // The legacy app can make the category selector inert behind a startup overlay.
  // Test the routing handler directly, without relying on Playwright's user-action
  //ability to interact with an inert element.
  async function routeCategory(page, value) {
    await page.evaluate((category) => {
      const select = document.querySelector('#shopCategory');
      select.value = category;
      window.frHandleShopCategoryChange();
    }, value);
  }

  test('TASKO category opens the existing TASKO booking page', async ({ page }) => {
    await routeCategory(page, 'tasko_service');
    await expect.poll(() => page.evaluate(() => window.__frLastPage)).toBe('homeServices');
    await expect(page.locator('#homeServices #taskoGiggerLaunch')).toHaveCount(1);
  });

  test('Laundry category opens the existing Laundry booking page', async ({ page }) => {
    await routeCategory(page, 'laundry_service');
    await expect.poll(() => page.evaluate(() => window.__frLastPage)).toBe('laundryServices');
    await expect(page.locator('#laundryServices #laundryServiceLaunch')).toHaveCount(1);
  });

  test('Admin regression keeps both TASKO and Laundry control centres available', async ({ page }) => {
    await expect(page.locator('#taskoAdminPanel')).toHaveCount(1);
    await expect(page.locator('#laundryAdminPanel')).toHaveCount(1);
    const handlers = await page.evaluate(() => ({
      tasko: typeof window.frAdminLoadTasko === 'function',
      laundry: typeof window.frAdminLoadLaundry === 'function'
    }));
    expect(handlers.tasko).toBe(true);
    expect(handlers.laundry).toBe(true);
  });
});


test.describe('FRIEND RIDE native screen navigation', () => {

  test('bottom tabs navigate between app root screens without scroll-style navigation', async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.route('https://**/*', route => route.abort());
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('.premium-bottom button[data-page="shops"]').click();
    await expect(page.locator('#shops')).toHaveClass(/active/);
    await expect(page.locator('.fr-native-back')).not.toBeVisible();
    await expect(page.locator('.premium-bottom button[data-page="shops"]')).toHaveClass(/active/);
    await page.locator('.premium-bottom button[data-page="food"]').click();
    await expect(page.locator('#food')).toHaveClass(/active/);
  });
  test('sub-page transition shows back control and returns to previous screen', async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.route('https://**/*', route => route.abort());
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => { window.showPage('profile'); });
    await expect(page.locator('#profile')).toHaveClass(/active/);
    const back = page.locator('.fr-native-back');
    await expect(back).toBeVisible();
    await back.click();
    await expect(page.locator('#home')).toHaveClass(/active/);
  });
});
