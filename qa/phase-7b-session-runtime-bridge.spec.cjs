const { test, expect } = require('./local-only-fixture.cjs');
const { SessionFlowHarness } = require('./session-flow-harness.cjs');

test('Phase 7B bridge: local app boot is isolated while synthetic A-to-B session race is guarded', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/FRIEND RIDE/i);
  await expect(page.locator('#roleLauncher')).toBeAttached();
  const roleRoutes = await page.evaluate(() => ['customer', 'driver', 'partner', 'admin'].map(role => [role, window.dashboardFor(role)]));
  expect(roleRoutes).toEqual([
    ['customer', 'customerDashboard'],
    ['driver', 'driverDashboard'],
    ['partner', 'partnerDashboard'],
    ['admin', 'adminDashboard']
  ]);

  const harness = new SessionFlowHarness();
  let releaseA;
  const pendingA = harness.signIn('fixture-user-a', {
    profile: () => new Promise(resolve => { releaseA = resolve; })
  });
  await harness.signIn('fixture-user-b', {
    profile: async () => ({ role: 'partner' }),
    adminMembership: async () => false
  });
  releaseA({ role: 'admin' });
  const staleA = await pendingA;
  expect(staleA.accepted).toBe(false);
  expect(staleA.reason).toBe('stale-profile');
  expect(harness.snapshot().identity).toBe('fixture-user-b');
  expect(harness.snapshot().role).toBe('partner');
  expect(harness.snapshot().admin).toBe(false);
  expect(errors).toEqual([]);
});

test('Phase 7B bridge: stale fixture notifications cannot cross identity switch', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const harness = new SessionFlowHarness();
  await harness.signIn('fixture-user-a');
  let releaseRows;
  const pendingRows = harness.loadNotifications(() => new Promise(resolve => { releaseRows = resolve; }));
  await harness.signIn('fixture-user-b');
  releaseRows([{ userId: 'fixture-user-a', marker: 'fixture-private-A' }]);
  const result = await pendingRows;
  expect(result.accepted).toBe(false);
  expect(harness.snapshot().identity).toBe('fixture-user-b');
  expect(harness.snapshot().notifications).toEqual([]);
});
