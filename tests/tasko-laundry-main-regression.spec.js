const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE TASKO / Laundry main-branch integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      window.requireLogin = (callback) => callback();
      if (typeof window.showPage === 'function') window.showPage('shops');
    });
  });

  test('Store Category exposes TASKO / GIGGER and Laundry', async ({ page }) => {
    const options = await page.locator('#shopCategory option').allTextContents();
    expect(options).toContain('TASKO / GIGGER Services');
    expect(options).toContain('Laundry Services');
  });

  test('TASKO category opens the existing TASKO booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('tasko_service');
    await expect(page.locator('#homeServices')).toHaveClass(/active/);
    await expect(page.locator('#taskoGiggerLaunch')).toBeVisible();
  });

  test('Laundry category opens the existing Laundry booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('laundry_service');
    await expect(page.locator('#laundryServices')).toHaveClass(/active/);
    await expect(page.locator('#laundryServiceLaunch')).toBeVisible();
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
