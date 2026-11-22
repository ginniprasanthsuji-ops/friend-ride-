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
  await expect(page.locator('#ride')).toHaveJSProperty('inert', false);
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

test('Route transitions clear inert from the active page and keep inactive routes inert', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  for (const route of ['home', 'ride', 'tracking', 'homeServices', 'laundryServices', 'frSupportFeedback']) {
    await page.evaluate(id => window.showPage(id), route);
    await expect(page.locator(`main .page#${route}`)).toHaveClass(/active/);
    await expect(page.locator(`main .page#${route}`)).toHaveJSProperty('inert', false);
    const inactiveInert = await page.locator('main .page:not(.active)').evaluateAll(nodes => nodes.every(node => node.inert));
    expect(inactiveInert, `inactive routes must be inert after opening ${route}`).toBe(true);
  }
});

test('GPS pickup uses simulated device coordinates and mocked reverse-geocoded place', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 18.605, longitude: 84.23 });
  await page.route('https://nominatim.openstreetmap.org/reverse?*', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ display_name: 'Mock GPS Address, Tekkali, Andhra Pradesh', address: { city: 'Tekkali', state: 'Andhra Pradesh', country: 'India' } })
  }));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { window.initRideMap = () => {}; window.frInitBookingMap = () => null; window.showPage('ride'); });
  await page.locator('#ride button[onclick="frUseMyLocation()"]').click();
  await expect(page.locator('#pickup')).toHaveValue(/Mock GPS Address, Tekkali, Andhra Pradesh/, { timeout: 15000 });
});

test('Ride insert succeeds and saved booking is retrievable in My Ride using mocked Supabase REST', async ({ page }) => {
  const savedRide = {
    id: 'qa-ride-001', customer_id: 'qa-user-1', vehicle_type: 'Bike',
    pickup_text: 'QA Pickup, Tekkali', drop_text: 'QA Drop, Srikakulam',
    pickup: 'QA Pickup, Tekkali', drop: 'QA Drop, Srikakulam',
    fare_offer: 125, agreed_fare: null, status: 'requested', driver_id: null,
    notes: 'QA booking insert and retrieval', created_at: '2026-11-22T05:00:00Z'
  };
  let insertedRow = null;
  await page.route('**/rest/v1/rides*', async route => {
    const method = route.request().method();
    if (method === 'POST') {
      insertedRow = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 201, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify({ id: savedRide.id, status: savedRide.status }) });
    } else if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/1' }, body: JSON.stringify([savedRide]) });
    } else {
      await route.continue();
    }
  });
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    currentUser = { id: 'qa-user-1' };
    currentProfile = { role: 'customer', address: 'Registered Home, Tekkali' };
    selectedRole = 'customer';
    window.frParsePickupCoords = () => null;
    window.frEnsureTrackingMap = () => {};
    window.refreshNearbyDrivers = async () => {};
    if (window.frNearbyTimer) clearInterval(window.frNearbyTimer);
    window.showPage('ride');
  });
  await expect(page.locator('#ride')).toHaveJSProperty('inert', false);
  await page.locator('#pickup').fill(savedRide.pickup);
  await page.locator('#drop').fill(savedRide.drop);
  await page.locator('#fare').fill('125');
  await page.locator('#rideNotes').fill(savedRide.notes);
  await page.locator('#ride button[onclick="saveRideRequest()"]').click();
  await expect(page.locator('#liveRideStatus')).toContainText('Active Ride ID: qa-ride-001');
  await expect(page.locator('#trackingStatus')).toContainText('Ride Request');
  expect(insertedRow).toMatchObject({ customer_id: 'qa-user-1', pickup: savedRide.pickup, drop: savedRide.drop, fare_offer: 125, status: 'requested' });
  await page.evaluate(() => window.loadMyRideTracking());
  await expect(page.locator('#liveRideStatus')).toContainText('QA Pickup, Tekkali');
  await expect(page.locator('#liveRideStatus')).toContainText('QA Drop, Srikakulam');
  await expect(page.locator('#liveRideStatus')).toContainText('qa-ride-001');
});
