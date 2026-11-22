const { test, expect } = require('@playwright/test');

const pickupResult = {
  lat: 18.3, lon: 84.2,
  display_name: 'Tekkali, Srikakulam, Andhra Pradesh, India'
};
const dropResult = {
  lat: 18.25, lon: 84.35,
  display_name: 'Naupada, Andhra Pradesh, India'
};

function photonFeature(result) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [result.lon, result.lat] },
    properties: { name: result.display_name, city: 'Tekkali', state: 'Andhra Pradesh', country: 'India' }
  };
}

test.describe('Project Arjuna cab pickup/drop regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://photon.komoot.io/**', async route => {
      const url = new URL(route.request().url());
      const result = url.searchParams.get('q')?.toLowerCase().includes('nau') ? dropResult : pickupResult;
      await route.fulfill({
        json: { type: 'FeatureCollection', features: [photonFeature(result)] }
      });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => showPage('ride'));
  });

  test('pickup and drop autocomplete set address and coordinate state', async ({ page }) => {
    await page.locator('#pickup').fill('Tekkali');
    await expect(page.locator('#frPickupSuggestions button').first()).toContainText('Tekkali', { timeout: 10000 });
    await page.locator('#frPickupSuggestions button').first().click();
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-address', /Tekkali/);
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lat', '18.3');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lon', '84.2');

    await page.locator('#drop').fill('Naupada');
    await expect(page.locator('#frDropSuggestions button').first()).toContainText('Naupada', { timeout: 10000 });
    await page.locator('#frDropSuggestions button').first().click();
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-address', /Naupada/);
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-lat', '18.25');
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-lon', '84.35');
  });

  test('editing a selected pickup clears address and stale coordinates', async ({ page }) => {
    await page.locator('#pickup').fill('Tekkali');
    await expect(page.locator('#frPickupSuggestions button').first()).toContainText('Tekkali', { timeout: 10000 });
    await page.locator('#frPickupSuggestions button').first().click();
    await page.locator('#pickup').fill('New pickup');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-address', '');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lat', '');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lon', '');
  });

  test('GPS button reverse-geocodes and sets pickup address and coordinates', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 18.3, longitude: 84.2 });
    await page.locator('#ride button[onclick="frUseMyLocation()"]').click();
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-address', /Tekkali/, { timeout: 10000 });
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lat', '18.3');
    await expect(page.locator('#pickup')).toHaveAttribute('data-selected-lon', '84.2');
  });

  test('GPS/map-pin handlers and booking map are available', async ({ page }) => {
    const handlers = await page.evaluate(() => ({
      gps: typeof window.frUseMyLocation === 'function',
      pin: typeof window.frChooseMapPin === 'function',
      map: !!document.getElementById('frBookingMap')
    }));
    expect(handlers).toEqual({ gps: true, pin: true, map: true });
  });

  test('Find Drivers sends selected coordinates in the ride request payload', async ({ page }) => {
    let submitted = null;
    await page.route('https://pqsangtvietawkfgpgfu.supabase.co/rest/v1/rides**', async route => {
      if (route.request().method() === 'POST') {
        submitted = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          headers: { 'content-type': 'application/json', 'content-range': '0-0/1' },
          body: JSON.stringify([{ id: 'qa-ride-001' }])
        });
      } else await route.continue();
    });
    await page.locator('#pickup').fill('Tekkali');
    await expect(page.locator('#frPickupSuggestions button').first()).toContainText('Tekkali', { timeout: 10000 });
    await page.locator('#frPickupSuggestions button').first().click();
    await page.locator('#drop').fill('Naupada');
    await expect(page.locator('#frDropSuggestions button').first()).toContainText('Naupada', { timeout: 10000 });
    await page.locator('#frDropSuggestions button').first().click();
    await page.evaluate(() => {
      currentUser = { id: '11111111-1111-4111-8111-111111111111' };
      currentProfile = { role: 'customer' };
      rideVehicle = 'Auto';
    });
    await page.locator('#ride button[onclick="saveRideRequest()"]').click();
    await expect(page.locator('#message')).toContainText('successfully', { timeout: 10000 });
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
