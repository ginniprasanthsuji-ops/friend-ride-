const { test, expect } = require('@playwright/test');

test('FRIEND RIDE production page boots and exposes the four role entry points', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/FRIEND RIDE/i);
  await expect(page.locator('body')).toContainText(/FRIEND RIDE/i);
  await expect(page.locator('#roleLauncher')).toBeAttached();
  await expect(page.locator('.fr-role-card')).toHaveCount(4);
  expect(errors, 'Uncaught browser exceptions').toEqual([]);
});


test('each dashboard menu entry requests the matching account role before OTP login', async ({ page }) => {
  const cases = [
    ['customerDashboard', 'customer'],
    ['driverDashboard', 'driver'],
    ['partnerDashboard', 'partner'],
    ['adminDashboard', 'admin']
  ];
  for (const [dashboard, role] of cases) {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await page.evaluate(id => window.menuGo(id), dashboard);
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authModal')).toHaveAttribute('data-active-role', role);
  }
});

test('role router maps all four verified profile roles to their own dashboard', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => ({
    roleTitles: window.frRoleAuthSelfTest(),
    routes: ['customer', 'driver', 'partner', 'admin'].map(role => [role, window.dashboardFor(role)])
  }));
  expect(result.roleTitles.every(item => item.pass)).toBe(true);
  expect(result.routes).toEqual([
    ['customer', 'customerDashboard'],
    ['driver', 'driverDashboard'],
    ['partner', 'partnerDashboard'],
    ['admin', 'adminDashboard']
  ]);
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('window.acceptSession(data.user, requestedRole)');
  expect(source).toContain('expectedRole&&String(expectedRole).toLowerCase()!==role');
  expect(source).toContain('originalAccept(user,expectedRole)');
  expect(source).toContain('frStartOtpCooldown(button,60');
  expect(source).toContain('frStartOtpCooldown(button,/60 seconds');
});

test('local runtime diagnostics capture errors on-device while remaining hidden from non-admin users', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const badge = page.locator('#frDiagBadge');
  await expect(badge).toBeHidden();
  const externalRequests = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(page.url()).origin) externalRequests.push(request.url());
  });
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', { message: 'QA injected diagnostic check' })));
  const entries = await page.evaluate(() => JSON.parse(localStorage.getItem('fr_runtime_diagnostics_v1') || '[]'));
  expect(entries.some(entry => entry.kind === 'JavaScript' && entry.message === 'QA injected diagnostic check')).toBe(true);
  await expect(badge).toBeHidden();
  expect(externalRequests).toEqual([]);
});
test('automated QA page runs its checks and reports live-only constraints separately', async ({ page }) => {
  await page.goto('./test.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#duration')).not.toHaveText('—', { timeout: 30000 });
  await expect(page.locator('#results')).toContainText('SIM ·');
  await expect(page.locator('#coverage')).toContainText('LIVE ONLY');
  await expect(page.locator('#log')).toContainText('started');
  const audit = JSON.parse(await page.locator('#log').innerText());
  expect(audit.source.filter(x => /^\d{2} /.test(x.name))).toHaveLength(15);
  expect(audit.simulation.length).toBeGreaterThanOrEqual(10);
  expect(audit.simulation.every(x => x.ok === true), 'All deterministic mock workflow checks must pass').toBeTruthy();
  expect(audit.source.find(x => x.name.startsWith('13 Cashfree Payments'))?.ok).toBe(true);
  expect(audit.blocked.some(x => x.name.includes('Cashfree'))).toBe(true);
  expect(audit.blocked.some(x => x.name.includes('KYC'))).toBe(true);
});

test('Home screen visibly exposes Complaint & Feedback and admin dashboard has an always-present review panel', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frSupportHomeEntry')).toBeVisible();
  await expect(page.locator('#frSupportHomeEntry button')).toContainText(/Complaint \/ Feedback/);
  await expect(page.locator('#frHomeRatings')).toBeAttached();
  await expect(page.locator('#adminDashboard #frAdminSupportPanel')).toBeAttached();
  await expect(page.locator('#frAdminSupportList')).toBeAttached();
});

test('Help & Support routes to the working Complaints & Feedback form', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frSupportMenu')).toContainText(/Complaints & Feedback/);
  await expect(page.locator('#frSupportMenu')).toHaveAttribute('onclick', 'frOpenSupportPage()');
  await expect(page.locator('#support')).toContainText(/Open Complaints & Feedback/);
  await expect(page.locator('#support')).not.toContainText(/support table mapping/i);
  await expect(page.locator('#frSupportFeedback')).toBeAttached();
  await expect(page.locator('#frSupportMessage')).toBeAttached();
  expect(await page.evaluate(() => typeof window.frSubmitSupportFeedback)).toBe('function');
  expect(await page.evaluate(() => typeof window.frLoadAdminSupport)).toBe('function');
});

test('Friend Mart partner GPS registration, dashboard update and nearby store map are wired', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#friendMartMap')).toBeAttached();
  await expect(page.locator('#friendMartLocationStatus')).toBeAttached();
  await expect(page.locator('#partnerGpsSaveStatus')).toBeAttached();
  await expect(page.locator('#regBusinessLatitude')).toBeAttached();
  await expect(page.locator('#regBusinessLongitude')).toBeAttached();
  const functions = await page.evaluate(() => ({
    capturePartner: typeof window.frCapturePartnerLocation,
    savePartner: typeof window.frSavePartnerDashboardLocation,
    captureCustomer: typeof window.frCaptureCustomerMarketLocation,
    renderMap: typeof window.frRenderStoreMap
  }));
  expect(functions).toEqual({
    capturePartner: 'function',
    savePartner: 'function',
    captureCustomer: 'function',
    renderMap: 'function'
  });
  await expect(page.locator('#partnerDashboard')).toContainText('Store Map Location');
  await expect(page.locator('#storeBrowse')).toContainText('Use My Current Location');
});

test('Bank service enquiry is connected to customer submission and admin review', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#bankServiceSelected')).toBeAttached();
  await expect(page.locator('#bankEnquiryStatus')).toBeAttached();
  await expect(page.locator('#frAdminBankEnquiryList')).toBeAttached();
  const functions = await page.evaluate(() => ({
    submit: typeof window.frSubmitBankEnquiry,
    adminLoad: typeof window.frAdminLoadBankEnquiries,
    adminUpdate: typeof window.frAdminUpdateBankEnquiry
  }));
  expect(functions).toEqual({ submit: 'function', adminLoad: 'function', adminUpdate: 'function' });
});

test('role-aware voice and background push notification handlers are present', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => typeof window.frRideSpeakNotification)).toBe('function');
  const response = await page.request.get('./service-worker.js');
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain('కొత్త ఆర్డర్ వచ్చింది');
  expect(source).toContain('కొత్త రైడ్ వచ్చింది');
  expect(source).toContain('requireInteraction');
});

test('Customer, Driver and Partner registration forms show only their own fields when roles change', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const states = await page.evaluate(() => {
    const visible = id => {
      const el = document.getElementById(id);
      return !!el && !el.hidden && !el.classList.contains('hide');
    };
    window.switchAuth('register');
    const read = role => {
      window.chooseRole(role);
      return {
        avatar: visible('regAvatarFields'),
        customerPhoto: visible('customerRegPhotoFields'),
        customerAddress: visible('addressField'),
        driverDocs: visible('driverRegDocs'),
        driverDetails: visible('driverExtraFields'),
        partnerBusiness: visible('partnerRegFields'),
        partnerPayment: visible('partnerExtraFields')
      };
    };
    return {
      customer: read('customer'),
      driver: read('driver'),
      partner: read('partner'),
      vehicleTypes: [...document.querySelectorAll('#regVehicleType option')].map(x => x.value),
      genderOptions: [...document.querySelectorAll('#regAvatarFields .fr-avatar-pick')].map(x => x.dataset.gender)
    };
  });
  expect(states.customer).toEqual({
    avatar: true, customerPhoto: true, customerAddress: true,
    driverDocs: false, driverDetails: false, partnerBusiness: false, partnerPayment: false
  });
  expect(states.driver).toEqual({
    avatar: true, customerPhoto: false, customerAddress: false,
    driverDocs: true, driverDetails: true, partnerBusiness: false, partnerPayment: false
  });
  expect(states.partner).toEqual({
    avatar: true, customerPhoto: false, customerAddress: false,
    driverDocs: false, driverDetails: false, partnerBusiness: true, partnerPayment: true
  });
  expect(states.vehicleTypes).toEqual(['Bike', 'Auto', 'Car']);
  expect(states.genderOptions).toEqual(['male', 'female']);
});

test('registration form presents selectable glossy 3D male and female avatars', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#customerRegPhotoFields')).toBeAttached();
  await expect(page.locator('.fr-avatar-pick')).toHaveCount(2);
  await expect(page.locator('.fr-avatar-pick').first()).toContainText('3D Avatar');
  await expect(page.locator('.fr-avatar-pick').nth(1)).toContainText('3D Avatar');
  await expect(page.locator('.fr-avatar-art svg')).toHaveCount(2);
  await expect(page.locator('#regCustomerAvatar')).toHaveValue('male');
  await page.evaluate(() => window.frSetAvatarGender('female'));
  await expect(page.locator('#regCustomerAvatar')).toHaveValue('female');
  await expect(page.locator('.fr-avatar-pick[data-gender="female"]')).toHaveClass(/active/);
});

test('Shop QR payment workflow is connected for customer and approved partner', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frCustomerMarketOrders')).toBeAttached();
  await expect(page.locator('#partnerOrderList')).toBeAttached();
  const functions = await page.evaluate(() => ({
    customerOrders: typeof window.frLoadCustomerMarketOrders,
    openShopQr: typeof window.frCustomerOpenMarketPayment,
    paymentCountdown: typeof window.frStartMarketPayCountdown,
    partnerConfirm: typeof window.frPartnerConfirmMarketPayment
  }));
  expect(functions).toEqual({
    customerOrders: 'function',
    openShopQr: 'function',
    paymentCountdown: 'function',
    partnerConfirm: 'function'
  });
  await expect(page.locator('#regDriverQR')).toBeAttached();
  await expect(page.locator('#regDriverUPI')).toBeAttached();
  await expect(page.locator('#regPartnerQR')).toBeAttached();
  await expect(page.locator('#partnerPayQrFile')).toBeAttached();
  expect((await page.locator('body').innerText()).length).toBeGreaterThan(0);
});

test('Complaints & Feedback menu opens the real form and switches rating fields correctly', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frSupportMenu')).toBeAttached();
  await expect(page.locator('#frSupportFeedback')).toBeAttached();
  expect(await page.evaluate(() => typeof window.frOpenSupportPage)).toBe('function');
  await page.evaluate(() => window.openDrawer());
  await page.locator('#frSupportMenu').click();
  await expect(page.locator('#frSupportFeedback')).toHaveClass(/active/);
  await expect(page.locator('#frSupportKind')).toBeVisible();
  await expect(page.locator('#frSupportRatingWrap')).toBeHidden();
  await page.locator('#frSupportKind').selectOption('feedback');
  await expect(page.locator('#frSupportRatingWrap')).toBeVisible();
  await page.locator('#frSupportKind').selectOption('complaint');
  await expect(page.locator('#frSupportRatingWrap')).toBeHidden();
  await expect(page.locator('#frSupportMessage')).toBeVisible();
});

test('Homepage customer ratings are visible near the top and refresh on Home navigation', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.showPage('home'));
  await expect(page.locator('#frHomeRatings')).toBeVisible();
  await expect(page.locator('#frHomepageRatingsList')).toBeVisible();
  await expect(page.locator('#frHomeRatings')).toContainText('Customer Ratings');
  await expect(page.locator('#frHomeRatings button[onclick="frOpenSupportPage()"]')).toContainText('Give Your Rating');
  expect(await page.evaluate(() => typeof window.frLoadHomepageRatings)).toBe('function');
});

test('Admin can review complaints and publish selected feedback to the homepage', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#frAdminSupportPanel')).toBeAttached();
  await expect(page.locator('#frAdminSupportList')).toBeAttached();
  await expect(page.locator('#frHomeRatings')).toBeAttached();
  await expect(page.locator('#frHomepageRatingsList')).toBeAttached();
  const functions = await page.evaluate(() => ({
    loadAdmin: typeof window.frLoadAdminSupport,
    setStatus: typeof window.frAdminSetSupportStatus,
    publish: typeof window.frAdminPublishFeedback,
    homepage: typeof window.frLoadHomepageRatings,
    openSupport: typeof window.frOpenSupportPage
  }));
  expect(functions).toEqual({ loadAdmin: 'function', setStatus: 'function', publish: 'function', homepage: 'function', openSupport: 'function' });
});

test('Admin Driver KYC document review page is wired to protected review RPCs', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#driverDocumentReviews')).toBeAttached();
  await expect(page.locator('#driverDocumentReviewList')).toBeAttached();
  const functions = await page.evaluate(() => ({
    load: typeof window.loadDriverDocumentReviews,
    review: typeof window.reviewDriverDocument
  }));
  expect(functions).toEqual({ load: 'function', review: 'function' });
  await expect(page.locator('#adminDashboard')).toContainText('Driver KYC Documents');
});

test('Role-specific order, ride and customer alert preview controls have audio and voice handlers', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('button[onclick^="frPreviewAlertTone("]')).toHaveCount(3);
  const functions = await page.evaluate(() => ({
    unlock: typeof window.frUnlockAlertAudio,
    tone: typeof window.frPlayAlertTone,
    classify: typeof window.frClassifyAlert,
    preview: typeof window.frPreviewAlertTone,
    speakPreview: typeof window.frSpeakAlert,
    voice: typeof window.frRideSpeakNotification
  }));
  expect(functions).toEqual({ unlock: 'function', tone: 'function', classify: 'function', preview: 'function', speakPreview: 'function', voice: 'function' });
});


test('Profile photo loads from the role-specific private storage bucket after login', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('frLoadProfilePhoto');
  expect(source).toContain('createSignedUrl(path,900)');
  expect(source).toContain('customer-profile-photos');
  expect(source).toContain('driver-profile-photos');
  await expect(page.locator('#profileInfo')).toBeAttached();
});

test('Customer active ride displays assigned driver vehicle, phone and WhatsApp actions', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => typeof window.frRenderCustomerRideDriverAndPayment)).toBe('function');
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('get_ride_driver_details');
  expect(source).toContain('Vehicle Number');
  expect(source).toContain('WhatsApp Driver');
  expect(source).toContain('tel:');
  expect(source).toContain('https://wa.me/');
  expect(source).toContain('if(active.driver_id)await frRenderCustomerRideDriverAndPayment(active)');
});

test('Driver sees assigned customer name, phone and private profile photo path through secured RPC', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => typeof window.frRenderRideCustomerDetails)).toBe('function');
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('get_ride_customer_details_v2');
  expect(source).toContain('customer-profile-photos');
  expect(source).toContain('Assigned ride customer details unavailable');
});

test('QA read-only backend probe does not assume every table has an id column', async ({ page }) => {
  await page.goto('./test.html', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain("?select=*&limit=0");
  expect(source).not.toContain("?select=id&limit=0");
});


test('Customer nearby-driver map uses approved-driver RPC, not direct RLS-hidden table reads', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain("sb.rpc('fr_customer_list_nearby_drivers'");
  expect(source).not.toContain("sb.from('driver_locations').select('driver_id,latitude,longitude,is_online,updated_at')");
});

test('Driver going offline updates existing GPS row without invalid upsert', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain("sb.from('driver_locations').update({is_online:false");
  expect(source).not.toContain("upsert({driver_id:currentUser.id,is_online:false");
});


test('Floating App Status diagnostics is restricted to Admin Dashboard and positioned above bottom navigation', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain("String(currentProfile?.role||'').toLowerCase()==='admin'");
  expect(source).toContain("document.getElementById('adminDashboard')?.classList.contains('active')");
  expect(source).toContain("b.hidden=!isAdminDashboard()");
  expect(source).toContain("bottom:142px");
  expect(source).toContain("inset:auto 10px 205px 10px");
  expect(source).toContain("if(!isAdminDashboard())return");
  expect(source).toContain("window.frRefreshDiagnosticsVisibility=render");
  expect(source).toContain("window.frRefreshDiagnosticsVisibility();");
  await expect(page.locator('#frDiagBadge')).toBeHidden();
  await expect(page.locator('#frDiagPanel')).toBeHidden();
});


test('Final auth router refreshes the role-specific registration field renderer', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain("frSyncRegistrationFields(isRegister?'register':'login')");
  expect(source).toContain("frSetRegistrationGroup('regAvatarFields'");
  expect(source).toContain("frSetRegistrationGroup('customerRegPhotoFields'");
  expect(source).toContain("frSetRegistrationGroup('driverRegDocs'");
  expect(source).toContain("frSetRegistrationGroup('partnerRegFields'");
});

test('Partner catalogue supports editing an existing item without duplicating its SKU', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('window.editPartnerCatalogueItem=function(i)');
  expect(source).toContain('const editing=frEditingCatalogueSku?localCatalogue.find(x=>x.sku===frEditingCatalogueSku):null');
  expect(source).toContain('const sku=editing?.sku||selected?.id||existing?.sku');
  expect(source).toContain('onclick="editPartnerCatalogueItem(');
  expect(source).toContain("sb.storage.from('fr-partner-catalogue').upload");
});


test('Admin platform GST and toll-free settings are wired to secure RPCs and billing keeps seller GST separate', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#platformBusinessSettings')).toContainText(/Toll-Free Number/);
  await expect(page.locator('#platformBusinessSettings #platformTollFree')).toBeAttached();
  await expect(page.locator('#platformBusinessSettings #platformGSTIN')).toBeAttached();
  await expect(page.locator('#platformBusinessSettings #platformBusinessStatus')).toBeAttached();
  await expect(page.locator('#gst #gstNumber')).toHaveAttribute('maxlength', '15');
  await expect(page.locator('#gst #gstPlatformDetails')).toBeAttached();
  const wiring = await page.evaluate(() => ({
    load: typeof window.loadPlatformDetails,
    save: typeof window.savePlatformDetails,
    source: document.documentElement.innerHTML.includes('fr_admin_save_platform_business_details'),
    separateSellerAndPlatform: document.querySelector('#gst')?.textContent.includes('Seller / Partner GSTIN') &&
      document.querySelector('#gst')?.textContent.includes('Platform GSTIN వేరుగా ఉంటుంది')
  }));
  expect(wiring).toEqual({ load: 'function', save: 'function', source: true, separateSellerAndPlatform: true });
});


test('Driver KYC form loads the private upload handler and persists profile/document references', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#driverReg')).toBeAttached();
  await expect(page.locator('#driverLicense')).toBeAttached();
  await expect(page.locator('#aadhaarFile')).toHaveAttribute('type', 'file');
  await expect(page.locator('#licenseFile')).toHaveAttribute('type', 'file');
  await expect(page.locator('#rcFile')).toHaveAttribute('type', 'file');
  const handler = await page.evaluate(() =>
    typeof window.saveDriverDetails === 'function' ? window.saveDriverDetails.toString() : ''
  );
  expect(handler).toContain('driver-kyc-documents');
  expect(handler).toContain('fr_driver_documents');
  expect(handler).toContain('vehicle_registration');
  expect(handler).toContain('driving_license_number');
  expect(handler).toContain('driver_aadhaar_document_path');
  expect(handler).toContain('verification_status');
  expect(errors).toEqual([]);
});


test('TASKO booking form exposes helper categories, hours, date, time, address and work instructions', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#taskoGiggerLaunch')).toBeAttached();
  await expect(page.locator('#taskoCategory option')).toHaveCount(8);
  await expect(page.locator('#taskoHours')).toBeAttached();
  await expect(page.locator('#taskoDate')).toHaveAttribute('type', 'date');
  await expect(page.locator('#taskoTime')).toHaveAttribute('type', 'time');
  await expect(page.locator('#taskoAddress')).toBeAttached();
  await expect(page.locator('#taskoNotes')).toBeAttached();
  await expect(page.locator('#taskoGiggerLaunch')).toContainText('₹150–₹400');
  await expect(page.locator('#taskoGiggerLaunch')).toContainText('₹50');
});

test('TASKO hourly price preview applies ₹400 for first six hours and ₹50 per extra hour', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const preview = await page.evaluate(() => {
    const hours = document.querySelector('#taskoHours');
    const output = document.querySelector('#taskoPricePreview');
    if (!hours || !output || typeof window.frTaskoPricePreview !== 'function') throw new Error('TASKO price preview is not wired');
    const values = [];
    for (const value of ['6', '7', '10']) {
      hours.value = value;
      window.frTaskoPricePreview();
      values.push(output.textContent);
    }
    return values;
  });
  expect(preview[0]).toContain('₹150–₹400');
  expect(preview[1]).toContain('₹450');
  expect(preview[1]).toContain('₹50 per extra hour');
  expect(preview[2]).toContain('₹600');
});

test('TASKO Gigger registration requires emergency contact and uses private KYC upload flow', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#spEmergencyName')).toBeAttached();
  await expect(page.locator('#spEmergencyPhone')).toHaveAttribute('maxlength', '10');
  const handler = await page.evaluate(() => window.validateServiceProviderRegistration.toString());
  expect(handler).toContain('fr-service-provider-kyc');
  expect(handler).toContain('emergency_contact_name');
  expect(handler).toContain('status:\'pending\'');
  expect(handler).toContain('identity_document_path');
});

test('TASKO Admin approval, assignment and payment verification are guarded by Admin role checks', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const handlers = await page.evaluate(() => ({
    review: window.frAdminReviewTaskoApplication.toString(),
    assign: window.frAdminAssignTasko.toString(),
    verify: window.frAdminVerifyTaskoPayment.toString(),
    provider: window.frTaskoProviderAction.toString(),
    payment: window.frTaskoSubmitPayment.toString()
  }));
  expect(handlers.review).toContain("currentProfile?.role!=='admin'");
  expect(handlers.assign).toContain("currentProfile?.role!=='admin'");
  expect(handlers.verify).toContain("currentProfile?.role!=='admin'");
  expect(handlers.provider).toContain("fr_tasko_provider_transition");
  expect(handlers.payment).toContain("fr_tasko_submit_payment");
});


test('Home screen exposes separate TASKO / GIGGER and Laundry service tiles and promo banners', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.showPage('home'));
  const tasko = page.locator('.home-pro-services .home-pro-service').filter({ hasText: 'TASKO / GIGGER' });
  const laundry = page.locator('.home-pro-services .home-pro-service').filter({ hasText: 'LAUNDRY SERVICES' });
  await expect(tasko).toHaveCount(1);
  await expect(laundry).toHaveCount(1);
  await expect(page.locator('.fr-poster-rail')).toContainText('TASKO / GIGGER');
  await expect(page.locator('.fr-poster-rail')).toContainText('FRIEND RIDE LAUNDRY');
  expect(errors, 'Home page JavaScript errors').toEqual([]);
});

test('TASKO / GIGGER booking UI, helper registration and hourly pricing are wired', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.showPage('homeServices'));
  await expect(page.locator('#taskoGiggerLaunch')).toBeAttached();
  await expect(page.locator('#taskoCategory')).toBeAttached();
  await expect(page.locator('#taskoHours')).toBeAttached();
  await expect(page.locator('#taskoDate')).toBeAttached();
  await expect(page.locator('#taskoAddress')).toBeAttached();
  await expect(page.locator('#taskoNotes')).toBeAttached();
  await expect(page.locator('#taskoBookingStatus')).toBeAttached();
  await expect(page.locator('#taskoGiggerLaunch')).toContainText('Register as TASKO Gigger');
  await page.locator('#taskoHours').selectOption('8');
  await expect(page.locator('#taskoPricePreview')).toContainText('₹500');
  const functions = await page.evaluate(() => ({
    submit: typeof window.frSubmitTaskoBooking,
    myBookings: typeof window.frLoadMyTaskoBookings,
    adminLoad: typeof window.frAdminLoadTasko,
    assign: typeof window.frAdminAssignTasko,
    providerAction: typeof window.frTaskoProviderAction
  }));
  expect(functions).toEqual({
    submit: 'function', myBookings: 'function', adminLoad: 'function',
    assign: 'function', providerAction: 'function'
  });
});

test('Laundry booking exposes Washing per KG, Ironing per Piece, Dry Cleaning per Piece and pickup', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.showPage('laundryServices'));
  await expect(page.locator('#laundryServiceLaunch')).toBeAttached();
  await expect(page.locator('#laundryType')).toBeAttached();
  await expect(page.locator('#laundryQty')).toBeAttached();
  await expect(page.locator('#laundryUnit')).toBeAttached();
  await expect(page.locator('#laundryDate')).toBeAttached();
  await expect(page.locator('#laundryAddress')).toBeAttached();
  await expect(page.locator('#laundryServiceLaunch')).toContainText('Pickup & Delivery');
  await page.locator('#laundryType').selectOption('Washing');
  await expect(page.locator('#laundryUnit')).toHaveValue('kg');
  await expect(page.locator('#laundryUnit')).toBeDisabled();
  await page.locator('#laundryType').selectOption('Ironing / Steam Iron');
  await expect(page.locator('#laundryUnit')).toHaveValue('piece');
  await page.locator('#laundryType').selectOption('Dry Cleaning');
  await expect(page.locator('#laundryUnit')).toHaveValue('piece');
  const functions = await page.evaluate(() => ({
    submit: typeof window.frSubmitLaundryBooking,
    myOrders: typeof window.frLoadMyLaundryBookings,
    providerAction: typeof window.frLaundryProviderAction,
    adminLoad: typeof window.frAdminLoadLaundry,
    adminReview: typeof window.frAdminReviewLaundryApplication,
    assignQuote: typeof window.frAdminAssignLaundry
  }));
  expect(functions).toEqual({
    submit: 'function', myOrders: 'function', providerAction: 'function',
    adminLoad: 'function', adminReview: 'function', assignQuote: 'function'
  });
});

test('Laundry Partner registration uses the exact approved database category and Admin review controls', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.openServiceProviderRegister('Laundry Partner'));
  await expect(page.locator('#serviceProviderRegister')).toHaveClass(/active/);
  await expect(page.locator('#spCategory')).toHaveValue('Laundry Partner');
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain(".eq('service_category','Laundry Partner')");
  expect(source).toContain("service_category:val('spCategory')");
  expect(source).toContain("service_type:'laundry'");
  expect(source).toContain('laundry_unit_price:unitPrice');
});

