
const { test, expect } = require('@playwright/test');


// Expanded module-wide QA coverage: every major route must exist and be navigable in isolation.
test('All customer, partner, service and admin routes exist and navigation isolates the selected page', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const routes = [
    'home','cycleDelivery','explore','eventServices','bankingServices','ride','scheduled',
    'goods','parcel','food','restaurantCatalogue','shops','shopping','homeServices',
    'laundryServices','storeBrowse','customerCatalogue','marketCart','technicianRegister',
    'parcelRelease','orders','tracking','wallet','offers','customerDashboard','driverDashboard',
    'partnerDashboard','partnerOrders','products','inventory','gst','catalogue','subscription',
    'referrals','partnerReports','adminDashboard','crmDashboard','users','referralApprovals',
    'cashRewardApprovals','paymentApprovals','partnerPaymentSettings','platformBusinessSettings',
    'driverApprovals','driverDocumentReviews','partnerApprovals','adminOrders','reports','settings',
    'profile','notifications','support','about','cart','learnTeach','frSuperHub'
  ];
  const result = await page.evaluate(routes => {
    const missing = routes.filter(id => !document.getElementById(id));
    const navigation = routes.filter(id => document.getElementById(id)).map(id => {
      window.showPage(id);
      const active = [...document.querySelectorAll('.page.active')].map(x => x.id);
      const target = document.getElementById(id);
      return { id, active, ariaHidden: target?.getAttribute('aria-hidden'), inert: !!target?.inert };
    });
    return { missing, navigation };
  }, routes);
  expect(result.missing, 'Required route/page sections missing').toEqual([]);
  for (const route of result.navigation) {
    expect(route.active, 'Navigation must activate only '+route.id).toEqual([route.id]);
  }
});

// Admin dashboard regression: panels for all major business operations remain present.
test('Admin regression: all operational review panels and approval pages are present', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const ids = [
    'adminDashboard','crmDashboard','users','referralApprovals','cashRewardApprovals',
    'paymentApprovals','partnerPaymentSettings','platformBusinessSettings','driverApprovals',
    'driverDocumentReviews','partnerApprovals','adminOrders','reports','settings',
    'frAdminSupportPanel','frAdminSupportList','frAdminBankEnquiryList',
    'taskoAdminPanel','taskoAdminApplications','taskoAdminBookings',
    'laundryAdminPanel','laundryAdminApplications','laundryAdminBookings',
    'adminApiTestPhone','adminApiTestStatus'
  ];
  const missing = await page.evaluate(ids => ids.filter(id => !document.getElementById(id)), ids);
  expect(missing, 'Admin operational panels missing').toEqual([]);
  const adminText = await page.locator('#adminDashboard').innerText();
  expect(adminText).toMatch(/Driver KYC Documents/i);
  expect(adminText).toMatch(/Complaint|Feedback/i);
});

// Admin action wiring smoke coverage; this verifies handlers exist, not live DB success.
test('Admin regression: review, approval, support, bank enquiry and service-management handlers exist', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const handlers = await page.evaluate(() => {
    const names = [
      'loadDriverDocumentReviews','reviewDriverDocument','frLoadAdminSupport',
      'frAdminSetSupportStatus','frAdminPublishFeedback','frAdminLoadBankEnquiries',
      'frAdminUpdateBankEnquiry','frAdminLoadTasko','frAdminReviewTaskoApplication',
      'frAdminAssignTasko','frAdminVerifyTaskoPayment','frAdminLoadLaundry',
      'frAdminReviewLaundryApplication','frAdminAssignLaundry','loadPlatformDetails',
      'savePlatformDetails'
    ];
    return Object.fromEntries(names.map(name => [name, typeof window[name]]));
  });
  for (const [name, type] of Object.entries(handlers)) expect(type, name+' handler').toBe('function');
});

// Customer-facing core feature smoke coverage.
test('Customer regression: ride, goods, parcel, food, cart, wallet and support UI sections are available', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const required = ['ride','scheduled','goods','parcel','food','shops','shopping','marketCart',
    'orders','tracking','wallet','offers','support','frSupportFeedback','learnTeach'];
  for (const id of required) await expect(page.locator('#'+id), id+' route').toBeAttached();
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  for (const marker of ['frSubmitSupportFeedback','frOpenSupportPage','frLoadCustomerMarketOrders',
    'frCustomerOpenMarketPayment','frStartMarketPayCountdown']) expect(source).toContain(marker);
});

// Partner and driver operational workflows are smoke checked independently of live authentication.
test('Driver and Partner regression: dashboards, KYC, order and catalogue controls remain wired', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const ids = ['driverDashboard','partnerDashboard','partnerOrders','driverApprovals',
    'driverDocumentReviews','partnerApprovals','products','inventory','catalogue',
    'subscription','referrals','partnerReports','gst'];
  for (const id of ids) await expect(page.locator('#'+id), id+' route').toBeAttached();
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  for (const marker of ['frLoadProfilePhoto','saveDriverDetails','frSavePartnerDashboardLocation',
    'editPartnerCatalogueItem','frLoadCustomerMarketOrders']) expect(source).toContain(marker);
});

// The regression report clearly flags demo-only Food Delivery implementation as a release blocker.
test('Food Delivery release blocker audit: demo menu is not mistaken for backend-connected ordering', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const source = await page.locator('body').evaluate(el => el.ownerDocument.documentElement.innerHTML);
  expect(source).toContain('FR_DEMO_RESTAURANTS');
  expect(source).toContain('FR_FOOD_MENU');
  expect(source).toContain('renderRestaurantList');
  expect(source).toContain('renderRestaurantMenu');
  // Release blocker assertion: the source must still be explicitly classified as demo
  // until a verified DB-backed food order implementation replaces it.
  expect(source).toContain('Price set by restaurant');
});
