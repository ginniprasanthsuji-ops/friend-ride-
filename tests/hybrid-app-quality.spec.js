const { test, expect } = require('@playwright/test');

test.describe('Hybrid app cross-device quality smoke', () => {
  test('SPA boots without uncaught JavaScript exceptions', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toBeEmpty();
    await page.waitForLoadState('load');
    expect(pageErrors, 'uncaught page errors').toEqual([]);
  });

  test('PWA metadata and service-worker assets are reachable', async ({ page, request }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toHaveCount(1);
    const viewport = await viewportMeta.getAttribute('content');
    expect(viewport || '').toMatch(/width=device-width/i);
    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestHref).toBeTruthy();
    const manifestResponse = await request.get(new URL(manifestHref, page.url()).toString());
    expect(manifestResponse.ok()).toBeTruthy();
    const swResponse = await request.get(new URL('/service-worker.js', page.url()).toString());
    expect(swResponse.ok()).toBeTruthy();
  });

  test('app has a navigation surface and no horizontal viewport overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const navItems = page.locator('[data-page]');
    expect(await navItems.count(), 'navigation controls should exist').toBeGreaterThanOrEqual(3);
    const overflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(overflow.content, 'horizontal overflow detected').toBeLessThanOrEqual(overflow.viewport + 1);
  });
});
