const { test, expect } = require('@playwright/test');

const pickupResult = {
  place_id: 101,
  lat: '18.300000',
  lon: '84.200000',
  display_name: 'Tekkali, Srikakulam, Andhra Pradesh, India'
};
const dropResult = {
  place_id: 102,
  lat: '18.250000',
  lon: '84.350000',
  display_name: 'Naupada, Andhra Pradesh, India'
};

test.describe('Project Arjuna cab pickup/drop regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://photon.komoot.io/**', async route => {
      const url = new URL(route.request().url());
      const result = url.searchParams.get('q')?.toLowerCase().includes('nau') ? dropResult : pickupResult;
      const feature = { type: 'Feature', geometry: { type: 'Point', coordinates: [Number(result.lon), Number(result.lat)] }, properties: { name: result.display_name, city: 'Tekkali', state: 'Andhra Pradesh', country: 'India' } };
      if (url.pathname.endsWith('/reverse')) {
        await route.fulfill({ json: { type: 'FeatureCollection', features: [feature] } });
      } else {
        await route.fulfill({ json: { type: 'FeatureCollection', features: [feature] } });
      }
    });
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => showPage('ride'));
  });

  test('pickup and drop autocomplete populate selected address and coordinates', async ({ page }) => {
    await page.locator('#pickup').fill('Tekkali');
    await expect(page.locator('#frPickupSuggestions button')).toContainText('Tekkali', { timeout: 5000 });
    await page.locator('#frPickupSuggestions button').first().click();
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-address', /Tekkali/);
    await expect(page.locator('#pickupCoords')).toContainText('18.300000');

    await page.locator('#drop').fill('Naupada');
    await expect(page.locator('#frDropSuggestions button')).toContainText('Naupada', { timeout: 5000 });
    await page.locator('#frDropSuggestions button').first().click();
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-address', /Naupada/);
    await expect(page.locator('#dropCoords')).toContainText('18.250000');
  });

  test('editing a selected address clears its saved coordinates and stale coordinate display', async ({ page }) => {
    await page.locator('#pickup').fill('Tekkali');
    await page.locator('#frPickupSuggestions button').first().click();
    await page.locator('#pickup').fill('New pickup');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-address', '');
    await expect(page.locator('#pickupCoords')).toHaveText('Coordinates not selected');
  });

  test('GPS and map-pin handlers are present and booking map is wired', async ({ page }) => {
    const handlers = await page.evaluate(() => ({
      gps: typeof window.frUseMyLocation === 'function',
      pin: typeof window.frChooseMapPin === 'function',
      map: !!document.getElementById('frBookingMap')
    }));
    expect(handlers).toEqual({ gps: true, pin: true, map: true });
  });

  test('Find Drivers submits selected coordinates to rides table', async ({ page }) => {
    let submitted = null;
    await page.route('https://pqsangtvietawkfgpgfu.supabase.co/rest/v1/rides**', async route => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({ status: 201, headers: { 'content-type': 'application/json', 'content-range': '0-0/1' }, body: JSON.stringify([{ id: 'qa-ride-001' }]) });
      } else {
        await route.continue();
      }
    });
    await page.locator('#pickup').fill('Tekkali');
    await page.locator('#frPickupSuggestions button').first().click();
    await page.locator('#drop').fill('Naupada');
    await page.locator('#frDropSuggestions button').first().click();
    await page.evaluate(() => { currentUser = { id: '11111111-1111-4111-8111-111111111111' }; rideVehicle = 'Auto'; });
    await page.locator('#ride button[onclick="saveRideRequest()"]').click();
    await expect(page.locator('#message')).toContainText('successfully', { timeout: 5000 });
    expect(submitted).toMatchObject({
      customer_id: '11111111-1111-4111-8111-111111111111',
      vehicle_type: 'Auto',
      pickup_lat: 18.3,
      pickup_lng: 84.2,
      drop_lat: 18.25,
      drop_lng: 84.35,
      status: 'requested'
    });
  });
});
