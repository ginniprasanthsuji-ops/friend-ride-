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
    await page.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<main><div id="deliveryHost"></div></main>'); });
    await page.evaluate(() => window.FriendRideDelivery.mount('deliveryHost','ride','00000000-0000-4000-8000-000000000001','driver'));
    await expect(page.getByText('Landmark / Nearby place')).toBeVisible();
    await expect(page.locator('#frDiLat')).toBeVisible();
    await expect(page.locator('#frDiLng')).toBeVisible();
    await expect(page.locator('#frDiArrival')).toBeVisible();
    await expect(page.locator('#frDiOtp')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify Delivery OTP' })).toBeVisible();
  });

  test('shows customer OTP issue action and hides driver-only controls', async ({ page }) => {
    await page.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<main><div id="deliveryHost"></div></main>'); });
    await page.evaluate(() => window.FriendRideDelivery.mount('deliveryHost','ride','00000000-0000-4000-8000-000000000001','customer'));
    await expect(page.getByRole('button', { name: 'Send OTP to Customer' })).toBeVisible();
    await expect(page.locator('#frDiDriver')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Verify Delivery OTP' })).toHaveCount(0);
  });

  test('does not expose customer OTP issue action in driver mode', async ({ page }) => {
    await page.evaluate(() => { document.body.insertAdjacentHTML('beforeend', '<main><div id="deliveryHost"></div></main>'); });
    await page.evaluate(() => window.FriendRideDelivery.mount('deliveryHost','parcel','00000000-0000-4000-8000-000000000001','driver'));
    await expect(page.locator('#frDiCustomerOtp')).toBeHidden();
  });
  test('supports all four delivery order types without changing their IDs', async ({ page }) => {
    const results = await page.evaluate(() => {
      const types = ['ride', 'parcel', 'food', 'shop'];
      return types.map((type, index) => {
        const host = document.createElement('div');
        host.id = 'deliveryHost_' + index;
        document.body.appendChild(host);
        const widget = window.FriendRideDelivery.mount(
          host.id, type, '00000000-0000-4000-8000-00000000000' + (index + 1), 'customer'
        );
        return { type, hostRendered: !!host.querySelector('[data-fr-delivery-widget]'), hasRefresh: typeof widget.refresh === 'function' };
      });
    });
    expect(results).toEqual([
      { type: 'ride', hostRendered: true, hasRefresh: true },
      { type: 'parcel', hostRendered: true, hasRefresh: true },
      { type: 'food', hostRendered: true, hasRefresh: true },
      { type: 'shop', hostRendered: true, hasRefresh: true }
    ]);
  });

  test('parcel booking and driver acceptance are wired to the delivery widget', async ({ page }) => {
    const wired = await page.evaluate(() => {
      const html = document.documentElement.innerHTML;
      return {
        customer: html.includes("FriendRideDelivery.mount('frParcelDeliveryInstructions','parcel'"),
        driver: html.includes("FriendRideDelivery.mount('frParcelDriverDeliveryInstructions','parcel'")
      };
    });
    expect(wired).toEqual({ customer: true, driver: true });
  });

});
