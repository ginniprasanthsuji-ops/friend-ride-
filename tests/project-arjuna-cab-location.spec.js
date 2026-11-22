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

  test('map-pin selection reverse-geocodes and writes drop coordinates', async ({ page }) => {
    await page.route('https://photon.komoot.io/reverse**', async route => {
      await route.fulfill({ json: { type: 'FeatureCollection', features: [photonFeature(dropResult)] } });
    });
    await page.evaluate(() => window.frChooseMapPin('drop'));
    await expect(page.locator('#frDropHint')).toContainText('tap', { timeout: 5000 }).catch(() => {});
    const pinReady = await page.evaluate(() => typeof window.__frArjunaPinClick === 'function');
    expect(pinReady).toBeTruthy();
    await page.evaluate(async () => {
      await window.__frArjunaPinClick({ latlng: { lat: 18.25, lng: 84.35 } });
    });
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-address', /Naupada/);
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-lat', '18.25');
    await expect(page.locator('#drop')).toHaveAttribute('data-selected-lon', '84.35');
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
    // Intercept the real Supabase REST insert request. The app's Supabase client
    // is a lexical const, so replacing window.sb does not mock it.
    await page.route('**/rest/v1/rides**', async route => {
      // The app may read the rides table before booking. Only mock the INSERT POST.
      if (route.request().method() !== 'POST') return route.continue();
      const payload = route.request().postDataJSON();
      await page.evaluate(p => { window.__qaRidePayload = { table: 'rides', payload: p }; }, payload);
      // PostgREST .single() returns one JSON object, not an array.
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        headers: { 'content-range': '0-0/1' },
        body: JSON.stringify({ id: 'qa-ride-001' })
      });
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
    const diagnostics = await page.evaluate(() => ({
      saveFunction: typeof saveRideRequest,
      userId: currentUser?.id,
      role: currentProfile?.role,
      pickup: (() => { const el = document.getElementById('pickup'); return el ? { address: el.dataset.selectedAddress, lat: el.dataset.selectedLat, lon: el.dataset.selectedLon, value: el.value } : null; })(),
      drop: (() => { const el = document.getElementById('drop'); return el ? { address: el.dataset.selectedAddress, lat: el.dataset.selectedLat, lon: el.dataset.selectedLon, value: el.value } : null; })(),
      fare: document.getElementById('fare')?.value ?? null,
      buttonExists: !!document.querySelector('#ride button[onclick="saveRideRequest()"]')
    }));
    expect(diagnostics.saveFunction).toBe('function');
    expect(diagnostics.userId).toBeTruthy();
    expect(diagnostics.pickup).not.toBeNull();
    expect(diagnostics.drop).not.toBeNull();
    expect(diagnostics.pickup.address).toContain('Tekkali');
    expect(diagnostics.drop.address).toContain('Naupada');
    await page.evaluate(() => { window.__qaRideGuardBefore = window.__frArjunaRideSubmitting; });
    expect(await page.evaluate(() => window.__qaRideGuardBefore)).not.toBeTruthy();
    await page.evaluate(() => { saveRideRequest(); });
    await page.waitForTimeout(250);
    const submitDiagnostics = await page.evaluate(() => ({
      guard: window.__frArjunaRideSubmitting,
      message: document.getElementById('message')?.textContent,
      payload: window.__qaRidePayload
    }));
    console.log('PROJECT_ARJUNA_SUBMIT_DIAGNOSTICS', JSON.stringify(submitDiagnostics));
    await expect(page.locator('#message'), 'Ride submit diagnostics: ' + JSON.stringify(submitDiagnostics))
      .toContainText('successfully', { timeout: 10000 });
    submitted = await page.evaluate(() => window.__qaRidePayload?.payload);
    expect(await page.evaluate(() => window.__qaRidePayload?.table)).toBe('rides');
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
