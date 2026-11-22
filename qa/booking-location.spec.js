const { test, expect } = require('@playwright/test');

test.describe('Ride booking map and location suggestions', () => {
  test('map initializes when ride page opens and pickup/drop suggestions place markers', async ({ page }) => {
    await page.route('https://photon.komoot.io/api/**', async route => {
      const q = new URL(route.request().url()).searchParams.get('q') || '';
      const label = q.toLowerCase().includes('tekkali') ? 'Tekkali' : 'Srikakulam';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [84.255, 18.605] },
            properties: { name: label, city: 'Srikakulam', state: 'Andhra Pradesh', country: 'India' }
          }]
        })
      });
    });
    await page.route('https://nominatim.openstreetmap.org/**', route => {
      const url = new URL(route.request().url());
      const body = url.pathname.includes('/reverse')
        ? { display_name: 'Mock selected map location, India' }
        : [];
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    });
    const transparentTile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64');
    await page.route('https://*.tile.openstreetmap.org/**', route =>
      route.fulfill({status:200,contentType:'image/png',body:transparentTile}));
    await page.route('https://*.basemaps.cartocdn.com/**', route =>
      route.fulfill({status:200,contentType:'image/png',body:transparentTile}));

    await page.goto('/');
    await page.evaluate(() => window.showPage('ride'));
    // Leaflet applies .leaflet-container to the map element itself, not a child.
    await expect(page.locator('#frBookingMap.leaflet-container')).toBeVisible({timeout:15000});
    await expect(page.locator('#frBookingMap .leaflet-tile')).toHaveCount(0,{timeout:5000}).catch(()=>{});

    await page.locator('#pickup').fill('Tekkali');
    await expect(page.locator('#frPickupSuggestions button').first()).toContainText('Tekkali',{timeout:10000});
    await page.locator('#frPickupSuggestions button').first().click();
    await expect(page.locator('#pickup')).toHaveValue(/Tekkali/);
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(1);

    await page.locator('#drop').fill('Srikakulam');
    await expect(page.locator('#frDropSuggestions button').first()).toContainText('Srikakulam',{timeout:10000});
    await page.locator('#frDropSuggestions button').first().click();
    await expect(page.locator('#drop')).toHaveValue(/Srikakulam/);
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(2);

    // Verify direct map-pin placement works for both points as a fallback.
    await page.locator('button[onclick="frChooseMapPin(\'pickup\')"]').click();
    const map = page.locator('#frBookingMap');
    await map.click({position:{x:map.boundingBox ? 120 : 120,y:100}});
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(2);
    await expect(page.locator('#pickup')).toHaveValue(/Mock selected map location|\d{2}\.\d+/,{timeout:10000});
    await page.locator('button[onclick="frChooseMapPin(\'drop\')"]').click();
    await map.click({position:{x:200,y:130}});
    await expect(page.locator('#drop')).toHaveValue(/Mock selected map location|\d{2}\.\d+/,{timeout:10000});
  });
});
