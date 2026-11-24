const { test, expect } = require('@playwright/test');

test.describe('Phase 11 role-specific registration isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('Customer registration shows customer-only photo and hides driver/partner documents', async ({ page }) => {
    await page.evaluate(() => openAuth('register', 'customer'));
    await expect(page.locator('#customerRegPhotoFields')).toBeVisible();
    await expect(page.locator('#driverRegDocs')).toBeHidden();
    await expect(page.locator('#partnerRegFields')).toBeHidden();
    await expect(page.locator('#regDriverLicense')).toBeDisabled();
    await expect(page.locator('#regPartnerCategory')).toBeDisabled();
  });

  test('Driver registration exposes required driver document controls only', async ({ page }) => {
    await page.evaluate(() => openAuth('register', 'driver'));
    await expect(page.locator('#driverRegDocs')).toBeVisible();
    await expect(page.locator('#partnerRegFields')).toBeHidden();
    await expect(page.locator('#customerRegPhotoFields')).toBeHidden();
    await expect(page.locator('#regDriverPhoto')).toBeEnabled();
    await expect(page.locator('#regDriverLicense')).toBeEnabled();
    await expect(page.locator('#regPartnerCategory')).toBeDisabled();
  });

  test('Partner registration exposes partner controls and keeps driver document inputs disabled', async ({ page }) => {
    await page.evaluate(() => openAuth('register', 'partner'));
    await expect(page.locator('#partnerRegFields')).toBeVisible();
    await expect(page.locator('#driverRegDocs')).toBeHidden();
    await expect(page.locator('#customerRegPhotoFields')).toBeHidden();
    await expect(page.locator('#regPartnerPhoto')).toBeEnabled();
    await expect(page.locator('#regPartnerCategory')).toBeEnabled();
    await expect(page.locator('#regDriverLicense')).toBeDisabled();
  });

  test('Admin registration mode does not expose customer, driver, or partner registration fields', async ({ page }) => {
    await page.evaluate(() => openAuth('register', 'admin'));
    await expect(page.locator('#customerRegPhotoFields')).toBeHidden();
    await expect(page.locator('#driverRegDocs')).toBeHidden();
    await expect(page.locator('#partnerRegFields')).toBeHidden();
    await expect(page.locator('#regCustomerPhoto')).toBeDisabled();
    await expect(page.locator('#regDriverLicense')).toBeDisabled();
    await expect(page.locator('#regPartnerCategory')).toBeDisabled();
  });
});
