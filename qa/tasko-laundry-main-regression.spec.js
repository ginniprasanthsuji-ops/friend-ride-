const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE TASKO / Laundry main-branch integration', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
    await page.route('https://**/*', route => route.abort());
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
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

  test('TASKO category opens the existing TASKO booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('tasko_service');
    await expect.poll(() => page.evaluate(() => window.__frLastPage)).toBe('homeServices');
    await expect(page.locator('#homeServices #taskoGiggerLaunch')).toHaveCount(1);
  });

  test('Laundry category opens the existing Laundry booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('laundry_service');
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
