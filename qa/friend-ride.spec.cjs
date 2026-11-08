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

test('Help & Support routes to the working Complaints & Feedback form', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frSupportMenu')).toContainText(/Complaints & Feedback/);
  await expect(page.locator('#frSupportMenu')).toHaveAttribute('onclick', 'frOpenSupportPage()');
  await expect(page.locator('#support')).toContainText(/Open Complaints & Feedback/);
  await expect(page.locator('#support')).not.toContainText(/support table mapping/i);
  await expect(page.locator('#frSupportFeedback')).toBeAttached();
  await expect(page.locator('#frSupportMessage')).toBeAttached();
  expect(await page.evaluate(() => typeof window.frSubmitSupportFeedback)).toBe('function');
  expect(await page.evaluate(() => typeof window.frLoadAdminSupport)).toBe('function');
});

test('Friend Mart partner GPS registration, dashboard update and nearby store map are wired', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#friendMartMap')).toBeAttached();
  await expect(page.locator('#friendMartLocationStatus')).toBeAttached();
  await expect(page.locator('#partnerGpsSaveStatus')).toBeAttached();
  await expect(page.locator('#regBusinessLatitude')).toBeAttached();
  await expect(page.locator('#regBusinessLongitude')).toBeAttached();
  const functions = await page.evaluate(() => ({
    capturePartner: typeof window.frCapturePartnerLocation,
    savePartner: typeof window.frSavePartnerDashboardLocation,
    captureCustomer: typeof window.frCaptureCustomerMarketLocation,
    renderMap: typeof window.frRenderStoreMap
  }));
  expect(functions).toEqual({
    capturePartner: 'function',
    savePartner: 'function',
    captureCustomer: 'function',
    renderMap: 'function'
  });
  await expect(page.locator('#partnerDashboard')).toContainText('Store Map Location');
  await expect(page.locator('#storeBrowse')).toContainText('Use My Current Location');
});

test('Bank service enquiry is connected to customer submission and admin review', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#bankServiceSelected')).toBeAttached();
  await expect(page.locator('#bankEnquiryStatus')).toBeAttached();
  await expect(page.locator('#frAdminBankEnquiryList')).toBeAttached();
  const functions = await page.evaluate(() => ({
    submit: typeof window.frSubmitBankEnquiry,
    adminLoad: typeof window.frAdminLoadBankEnquiries,
    adminUpdate: typeof window.frAdminUpdateBankEnquiry
  }));
  expect(functions).toEqual({ submit: 'function', adminLoad: 'function', adminUpdate: 'function' });
});
