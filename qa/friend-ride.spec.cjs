const { test, expect } = require('@playwright/test');

test('FRIEND RIDE production page boots and exposes the four role entry points', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/FRIEND RIDE/i);
  await expect(page.locator('body')).toContainText(/FRIEND RIDE/i);
  await expect(page.locator('#roleLauncher')).toBeAttached();
  await expect(page.locator('.fr-role-card')).toHaveCount(4);
  expect(errors, 'Uncaught browser exceptions').toEqual([]);
});

test('local runtime diagnostics capture an injected test error without sending it off-device', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const badge = page.locator('#frDiagBadge');
  await expect(badge).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { message: 'QA injected diagnostic check' })));
  await expect(badge).toContainText(/issues \(1\)/);
  await badge.click();
  await expect(page.locator('#frDiagLog')).toContainText('QA injected diagnostic check');
});

test('automated QA page runs its checks and reports live-only constraints separately', async ({ page }) => {
  await page.goto('./test.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#duration')).not.toHaveText('—', { timeout: 30000 });
  await expect(page.locator('#results')).toContainText('SIM ·');
  await expect(page.locator('#coverage')).toContainText('LIVE ONLY');
  await expect(page.locator('#log')).toContainText('started');
  const audit = JSON.parse(await page.locator('#log').innerText());
  expect(audit.source.filter(x => /^\d{2} /.test(x.name))).toHaveLength(15);
  expect(audit.simulation.length).toBeGreaterThanOrEqual(10);
  expect(audit.simulation.every(x => x.ok === true), 'All deterministic mock workflow checks must pass').toBeTruthy();
  expect(audit.source.find(x => x.name.startsWith('13 Cashfree Payments'))?.ok).toBe(true);
  expect(audit.blocked.some(x => x.name.includes('Cashfree'))).toBe(true);
  expect(audit.blocked.some(x => x.name.includes('KYC'))).toBe(true);
});
