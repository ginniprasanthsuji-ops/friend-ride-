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
    await map.click({position:{x:120,y:100}});
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(2);
    await expect(page.locator('#pickup')).toHaveValue(/Mock selected map location|\d{2}\.\d+/,{timeout:10000});
    await page.locator('button[onclick="frChooseMapPin(\'drop\')"]').click();
    await map.click({position:{x:200,y:130}});
    await expect(page.locator('#drop')).toHaveValue(/Mock selected map location|\d{2}\.\d+/,{timeout:10000});
  });
  test('booking payload maps pickup and drop text, coordinates and fare to rides insert', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.showPage('ride'));
    await expect(page.locator('#frBookingMap.leaflet-container')).toBeVisible({timeout:15000});
    const captured = await page.evaluate(async () => {
      currentUser={id:'qa-customer-id'};
      currentProfile={role:'customer'};
      rideVehicle='Bike';
      frBookingSetPoint('pickup',18.605,84.255,'QA Pickup');
      frBookingSetPoint('drop',18.61,84.26,'QA Drop');
      document.querySelector('#pickup').value='QA Pickup';
      document.querySelector('#drop').value='QA Drop';
      document.querySelector('#fare').value='125';
      window.showPage=()=>{};
      window.frEnsureTrackingMap=()=>{};
      window.refreshNearbyDrivers=async()=>{};
      sb.from=(table)=>({
        insert(row){window.__qaRideInsert={table,row};return {select(){return {single:async()=>({data:{id:'qa-ride-id',status:'requested'},error:null})}}};}
      });
      await window.saveRideRequest();
      return window.__qaRideInsert;
    });
    expect(captured.table).toBe('rides');
    expect(captured.row.pickup).toBe('QA Pickup');
    expect(captured.row.drop).toBe('QA Drop');
    expect(captured.row.pickup_text).toBe('QA Pickup');
    expect(captured.row.drop_text).toBe('QA Drop');
    expect(captured.row.pickup_lat).toBe(18.605);
    expect(captured.row.pickup_lng).toBe(84.255);
    expect(captured.row.drop_lat).toBe(18.61);
    expect(captured.row.drop_lng).toBe(84.26);
    expect(captured.row.fare_offer).toBe(125);
    expect(captured.row.status).toBe('requested');
  });

  test('GPS pickup selection updates address and map marker; fare controls adjust offer', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({latitude:18.605,longitude:84.255});
    await page.route('https://nominatim.openstreetmap.org/**', route => {
      const url = new URL(route.request().url());
      const body = url.pathname.includes('/reverse')
        ? {display_name:'GPS Mock Location, Tekkali, India'}
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
    await expect(page.locator('#frBookingMap.leaflet-container')).toBeVisible({timeout:15000});
    await page.locator('button[onclick="frUseMyLocation()"]').click();
    await expect(page.locator('#pickup')).toHaveValue(/GPS Mock Location, Tekkali/,{timeout:15000});
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(1);
    await expect(page.locator('#frPickupHint')).toContainText('18.60500');
    const coords=await page.evaluate(()=>pickupCoords);
    expect(coords).toEqual({lat:18.605,lon:84.255});
    await expect(page.locator('#fare')).toHaveValue('100');
    await page.locator('button[onclick="adjustFare(10)"]').click();
    await expect(page.locator('#fare')).toHaveValue('110');
  });

  test('Nominatim fallback appears when Photon returns zero results', async ({ page }) => {
    await page.route('https://photon.komoot.io/api/**', route =>
      route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({features:[]})}));
    await page.route('https://nominatim.openstreetmap.org/**', route => {
      const url = new URL(route.request().url());
      const body = url.pathname.includes('/reverse')
        ? {display_name:'Fallback map point'}
        : [{lat:'18.605',lon:'84.255',display_name:'Fallback Address, Tekkali, India'}];
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
    });
    const transparentTile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64');
    await page.route('https://*.tile.openstreetmap.org/**', route =>
      route.fulfill({status:200,contentType:'image/png',body:transparentTile}));
    await page.route('https://*.basemaps.cartocdn.com/**', route =>
      route.fulfill({status:200,contentType:'image/png',body:transparentTile}));
    await page.goto('/');
    await page.evaluate(() => window.showPage('ride'));
    await expect(page.locator('#frBookingMap.leaflet-container')).toBeVisible({timeout:15000});
    await page.locator('#pickup').fill('Fallback Address');
    await expect(page.locator('#frPickupSuggestions button').first()).toContainText('Fallback Address, Tekkali, India',{timeout:15000});
    await page.locator('#frPickupSuggestions button').first().click();
    await expect(page.locator('#pickup')).toHaveValue(/Fallback Address, Tekkali/);
    await expect(page.locator('#frBookingMap .leaflet-marker-icon')).toHaveCount(1);
  });


  test('OSM tile failures trigger CARTO tile fallback', async ({ page }) => {
    let cartoRequests=0;
    await page.route('https://*.tile.openstreetmap.org/**',route=>route.fulfill({status:503,contentType:'text/plain',body:'tiles unavailable'}));
    const transparentTile=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64');
    await page.route('https://*.basemaps.cartocdn.com/**',route=>{cartoRequests++;return route.fulfill({status:200,contentType:'image/png',body:transparentTile});});
    await page.goto('/');
    await page.evaluate(()=>window.showPage('ride'));
    await expect(page.locator('#frBookingMap.leaflet-container')).toBeVisible({timeout:15000});
    await expect.poll(()=>cartoRequests,{timeout:15000}).toBeGreaterThan(0);
  });

  test('cab booking submits a ride row with pickup coordinates and transitions to tracking', async ({ page }) => {
    let submittedRide=null;
    await page.route('https://*.tile.openstreetmap.org/**',route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64')}));
    await page.route('https://*.basemaps.cartocdn.com/**',route=>route.fulfill({status:200,contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a7sAAAAASUVORK5CYII=','base64')}));
    await page.route('https://*.supabase.co/rest/v1/rides**',async route=>{
      if(route.request().method()==='POST'){
        submittedRide=route.request().postDataJSON();
        return route.fulfill({status:201,contentType:'application/json',headers:{'content-range':'0-0/1'},body:JSON.stringify({id:'qa-ride-123',status:'requested'})});
      }
      return route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    await page.route('https://*.supabase.co/rest/v1/rpc/fr_customer_list_nearby_drivers',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await page.goto('/');
    await page.evaluate(()=>{currentUser={id:'qa-customer-123'};currentProfile={role:'customer'};selectedRole='customer';rideVehicle='Bike';window.showPage('ride');});
    await page.evaluate(()=>{
      frBookingSetPoint('pickup',18.605,84.255,'Pickup QA, Tekkali');
      frBookingSetPoint('drop',18.615,84.265,'Drop QA, Srikakulam');
    });
    await page.locator('#fare').fill('120');
    await page.locator('#rideNotes').fill('Project Arjuna booking flow smoke');
    await page.locator('#ride button[onclick="saveRideRequest()"]').click();
    await expect(page.locator('#tracking')).toHaveClass(/active/,{timeout:15000});
    await expect(page.locator('#trackingStatus')).toContainText('15 KM పరిధిలో ప్రస్తుతం Online Drivers లేరు',{timeout:15000});
    await expect.poll(()=>submittedRide).not.toBeNull();
    expect(submittedRide).toMatchObject({customer_id:'qa-customer-123',vehicle_type:'Bike',pickup:'Pickup QA, Tekkali',drop:'Drop QA, Srikakulam',pickup_text:'Pickup QA, Tekkali',drop_text:'Drop QA, Srikakulam',fare_offer:120,status:'requested',pickup_lat:18.605,pickup_lng:84.255,drop_lat:18.615,drop_lng:84.265});
    await expect(page.locator('#liveRideStatus')).toContainText('qa-ride-123');
  });

});
