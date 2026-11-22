import { test, expect } from '@playwright/test';

const routes = [
  'home',
  'shops',
  'food',
  'marketCart',
  'explore',
  'learnTeach',
  'orders',
  'ride',
  'goods',
  'parcel',
  'homeServices',
  'laundryServices',
  'profile',
  'support',
];

test('every route opens only its own interface', async ({ page }) => {
  const base = process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  for (const route of routes) {
    await page.evaluate((id) => window.showPage?.(id), route);
    await expect(page.locator(`main .page#${route}`)).toHaveClass(/active/, { timeout: 5000 });
    await expect(page.locator('main .page.active')).toHaveCount(1);
    await expect(page.locator('main .page.active')).toHaveAttribute('aria-hidden', 'false');
    const otherActive = await page.locator('main .page.active').evaluateAll(nodes => nodes.map(n => n.id));
    expect(otherActive).toEqual([route]);
  }
});

test('bottom navigation click routes without retaining homepage underneath', async ({ page }) => {
  const base = process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  for (const route of ['home','shops','food','marketCart','explore','learnTeach','orders']) {
    const tab=page.locator(`.premium-bottom button[data-page="${route}"]`);
    if (await tab.count()) {
      await tab.click({ force: true });
      await expect(page.locator(`main .page#${route}`)).toHaveClass(/active/, { timeout: 5000 });
      await expect(page.locator('main .page.active')).toHaveCount(1);
    }
  }
});
