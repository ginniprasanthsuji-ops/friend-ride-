const { test, expect } = require('@playwright/test');

test.describe('Admin regression — TASKO and Laundry Store Category entry points', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:4173/');
    // Bypass OTP for this UI-routing regression only; no backend writes are made.
    await page.evaluate(() => {
      window.requireLogin = (callback) => callback();
      if (typeof window.showPage === 'function') window.showPage('shops');
    });
  });

  test('Store Category lists TASKO / GIGGER and Laundry', async ({ page }) => {
    const category = page.locator('#shopCategory');
    await expect(category.locator('option[value="tasko_service"]')).toHaveText('TASKO / GIGGER Services');
    await expect(category.locator('option[value="laundry_service"]')).toHaveText('Laundry Services');
  });

  test('TASKO / GIGGER selection opens the TASKO booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('tasko_service');
    await expect(page.locator('#taskoServices')).toHaveClass(/active/);
  });

  test('Laundry selection opens the Laundry booking page', async ({ page }) => {
    await page.locator('#shopCategory').selectOption('laundry_service');
    await expect(page.locator('#laundryService')).toHaveClass(/active/);
  });

  test('Admin dashboard exposes TASKO & Laundry booking management', async ({ page }) => {
    await expect(page.locator('#adminDashboard')).toContainText('TASKO & Laundry Bookings');
    await expect(page.locator('#adminTaskoLaundryBookings')).toHaveCount(1);
    await expect(page.locator('#adminProviderKyc')).toHaveCount(1);
  });
});
