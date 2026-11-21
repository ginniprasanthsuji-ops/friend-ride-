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


test('native home has no duplicated legacy service sections and has five tabs', async ({ page }) => {
  const base = process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await expect(page.locator('.fr-native-home')).toBeVisible();
  await expect(page.locator('.fr-native-home .fr-native-service-grid .fr-native-service')).toHaveCount(6);
  await expect(page.locator('.fr-native-home .fr-native-quick .fr-native-service')).toHaveCount(9);
  await expect(page.locator('.premium-bottom button')).toHaveCount(5);
  await expect(page.locator('.premium-bottom button[data-page="home"]')).toBeVisible();
  await expect(page.locator('.premium-bottom button[data-page="explore"]')).toBeVisible();
  await expect(page.locator('.premium-bottom button[data-page="marketCart"]')).toBeVisible();
  await expect(page.locator('.premium-bottom button[data-page="orders"]')).toBeVisible();
  await expect(page.locator('.premium-bottom button[data-page="profile"]')).toBeVisible();
});

test('home header shows notification bell and avatar fallback without broken image', async ({ page }) => {
  const base = process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173/';
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await expect(page.locator('.fr-notify-bell')).toBeVisible();
  await expect(page.locator('#frHomeProfileButton')).toBeVisible();
  const image = page.locator('#frHomeProfileImage');
  if (await image.isVisible()) {
    const broken = await image.evaluate(el => !el.complete || el.naturalWidth === 0);
    expect(broken).toBe(false);
  }
  await expect(page.locator('#frHomeProfileAvatar')).toBeVisible();
});
