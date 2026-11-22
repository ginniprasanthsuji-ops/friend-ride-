const { test, expect } = require('@playwright/test');

test('Ride booking button is wired to the live rides insert handler, not the validation-only stub', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#ride')).toBeAttached();
  await expect(page.locator('#pickup')).toBeAttached();
  await expect(page.locator('#drop')).toBeAttached();
  await expect(page.locator('#frBookingMap')).toBeAttached();
  const handler = await page.evaluate(() => window.saveRideRequest?.toString() || '');
  expect(handler).toContain("sb.from('rides').insert(row)");
  expect(handler).toContain("select('id,status').single()");
  expect(handler).toContain("frActiveRideId=data.id");
  expect(handler).not.toContain('Live booking insert');
  expect(handler).not.toContain('mapping required');
});

test('Ride page pre-fills pickup from the customer registered address when pickup is blank', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => {
    currentProfile={role:'customer',address:'Registered Home, Tekkali, Srikakulam, Andhra Pradesh'};
    document.getElementById('pickup').value='';
    window.showPage('ride');
    return document.getElementById('pickup').value;
  });
  expect(result).toBe('Registered Home, Tekkali, Srikakulam, Andhra Pradesh');
});

test('Ride booking exposes pickup/drop suggestions, location map and registration address field', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#pickup')).toBeAttached();
  await expect(page.locator('#drop')).toBeAttached();
  await expect(page.locator('#frPickupSuggestions')).toBeAttached();
  await expect(page.locator('#frDropSuggestions')).toBeAttached();
  await expect(page.locator('#regAddress')).toBeAttached();
  await expect(page.locator('#frBookingMap')).toBeAttached();
});
