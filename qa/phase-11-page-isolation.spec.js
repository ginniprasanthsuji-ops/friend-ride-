const { test, expect } = require('./local-only-fixture.cjs');

test.describe('Phase 11 single-page dashboard isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./', { waitUntil: 'load' });
    await page.waitForFunction(() => typeof window.showPage === 'function', { timeout: 10000 });
  });

  test('showPage leaves exactly one active page and marks other pages hidden/inert', async ({ page }) => {
    await page.evaluate(() => window.showPage('ride'));
    await expect(page.locator('main .page.active')).toHaveCount(1);
    await expect(page.locator('#ride')).toHaveAttribute('aria-hidden', 'false');
    const hiddenState = await page.locator('main .page:not(.active)').evaluateAll(nodes =>
      nodes.every(n => n.getAttribute('aria-hidden') === 'true' && (n.inert === true))
    );
    expect(hiddenState).toBe(true);
    await page.evaluate(() => window.showPage('home'));
    await expect(page.locator('main .page.active')).toHaveCount(1);
    await expect(page.locator('#home')).toHaveAttribute('aria-hidden', 'false');
  });
});
