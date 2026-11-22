const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE current premium home regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      const url = route.request().url();
      if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          url.includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('home renders current premium theme and main sections', async ({ page }) => {
    await expect(page.locator('#home')).toHaveClass(/active/);
    await expect(page.locator('#home .home-banner')).toBeVisible();
    await expect(page.locator('#home .join-card')).toBeVisible();
    await expect(page.locator('#home .home-service-grid')).toBeAttached();
    await expect(page.locator('#home .cab-feature')).toBeAttached();
    const theme = await page.evaluate(() => ({
      purple: getComputedStyle(document.documentElement).getPropertyValue('--purple').trim(),
      background: getComputedStyle(document.body).backgroundImage,
      topbar: getComputedStyle(document.querySelector('.topbar')).backgroundImage
    }));
    expect(theme.purple).toBeTruthy();
    expect(theme.background).not.toBe('none');
    expect(theme.topbar).not.toBe('none');
  });

  test('customer, driver and partner registration entry points remain present', async ({ page }) => {
    const buttons = page.locator('#home .join-card .tile');
    await expect(buttons).toHaveCount(3);
    await expect(buttons.nth(0)).toContainText('Customer Registration');
    await expect(buttons.nth(1)).toContainText('Driver Registration');
    await expect(buttons.nth(2)).toContainText('Partner Registration');
  });

  test('ride, shop, food and home-service shortcuts have correct route handlers', async ({ page }) => {
    const routes = await page.locator('#home button').evaluateAll(buttons =>
      buttons.map(button => button.getAttribute('onclick') || '').filter(Boolean));
    expect(routes.some(route => route.includes("showPage('ride')"))).toBeTruthy();
    expect(routes.some(route => route.includes("showPage('shops')"))).toBeTruthy();
    expect(routes.some(route => route.includes("showPage('food')"))).toBeTruthy();
    expect(routes.some(route => route.includes("showPage('homeServices')"))).toBeTruthy();
    await expect(page.locator('#home .home-pro-service')).toHaveCount(8);
  });

  test('TASKO/GIGGER, Laundry and cycle delivery remain visible', async ({ page }) => {
    await expect(page.locator('#home .fr-poster')).toContainText('TASKO / GIGGER');
    await expect(page.locator('#home .fr-poster')).toContainText('FRIEND RIDE LAUNDRY');
    await expect(page.locator('#home .cycle-delivery-home-card')).toBeAttached();
  });
});
