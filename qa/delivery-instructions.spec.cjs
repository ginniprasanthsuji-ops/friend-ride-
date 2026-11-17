const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE delivery instructions module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => !!window.FriendRideDelivery);
  });

  test('exposes delivery instruction API without breaking app startup', async ({ page }) => {
    const api = await page.evaluate(() => Object.keys(window.FriendRideDelivery).sort());
    expect(api).toEqual(['arrivalPhoto','get','mount','otp','save','upload','validateCoordinates'].sort());
  });

  test('accepts valid GPS latitude and longitude bounds', async ({ page }) => {
    const valid = await page.evaluate(() => {
      const v = window.FriendRideDelivery.validateCoordinates;
      return [v('17.7','83.2'),v('-90','-180'),v('90','180'),v('','')];
    });
    expect(valid).toEqual([true,true,true,true]);
  });

  test('rejects out-of-range and malformed GPS coordinates', async ({ page }) => {
    const invalid = await page.evaluate(() => {
      const v = window.FriendRideDelivery.validateCoordinates;
      return [v('91','83'),v('17','181'),v('north','east'),v('17','')];
    });
    expect(invalid).toEqual([false,false,false,false]);
  });

  test('renders landmark, GPS, media and driver proof/OTP controls', async ({ page }) => {
    await page.setContent('<main><div id="deliveryHost"></div></main>');
    await page.evaluate(() => window.FriendRideDelivery.mount('deliveryHost','ride','00000000-0000-4000-8000-000000000001','driver'));
    await expect(page.getByText('Landmark / Nearby place')).toBeVisible();
    await expect(page.locator('#frDiLat')).toBeVisible();
    await expect(page.locator('#frDiLng')).toBeVisible();
    await expect(page.locator('#frDiArrival')).toBeVisible();
    await expect(page.locator('#frDiOtp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify Delivery OTP' })).toBeVisible();
  });

  test('does not expose customer OTP issue action in driver mode', async ({ page }) => {
    await page.setContent('<main><div id="deliveryHost"></div></main>');
    await page.evaluate(() => window.FriendRideDelivery.mount('deliveryHost','parcel','00000000-0000-4000-8000-000000000001','driver'));
    await expect(page.getByRole('button', { name: 'Send OTP to Customer' })).toBeHidden();
  });
});
