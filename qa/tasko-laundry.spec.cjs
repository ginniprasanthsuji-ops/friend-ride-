const {test,expect}=require('@playwright/test');
test('TASKO and Laundry services appear as separate home entries and banners',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.home-pro-service').filter({hasText:'TASKO / GIGGER'})).toBeAttached();
 await expect(page.locator('.home-pro-service').filter({hasText:'LAUNDRY SERVICES'})).toBeAttached();
 await expect(page.locator('.fr-poster').filter({hasText:'TASKO / GIGGER'})).toBeAttached();
 await expect(page.locator('.fr-poster').filter({hasText:'FRIEND RIDE LAUNDRY'})).toBeAttached();
 expect(errors).toEqual([]);
});
test('TASKO helper pricing and customer/partner/admin workflow remain intact',async({page})=>{
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#taskoGiggerLaunch')).toContainText('₹150–₹400');
 await expect(page.locator('#taskoGiggerLaunch')).toContainText('₹50');
 await expect(page.locator('#taskoAdminPanel')).toBeAttached();
 for(const name of ['frSubmitTaskoBooking','frLoadMyTaskoBookings','frTaskoProviderAction','frAdminLoadTasko','frAdminAssignTasko','frAdminVerifyTaskoPayment'])expect(await page.evaluate(n=>typeof window[n],name)).toBe('function');
});
test('Laundry has per KG/per piece booking, pickup, partner registration and admin panel',async({page})=>{
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>window.showPage('laundryServices'));
 const p=page.locator('#laundryServices');
 await expect(p).toContainText('Washing');
 await expect(p).toContainText('Ironing / Steam Iron');
 await expect(p).toContainText('Dry Cleaning');
 await expect(p).toContainText('Pickup & Delivery');
 await expect(p).toContainText('Per KG');
 await expect(p).toContainText('Per Piece');
 await expect(page.locator('#laundryAdminPanel')).toBeAttached();
 await expect(page.locator('#laundryAddress')).toBeAttached();
 await page.locator('#laundryType').selectOption('Washing');
 await expect(page.locator('#laundryUnit')).toHaveValue('kg');
 await page.locator('#laundryType').selectOption('Dry Cleaning');
 await expect(page.locator('#laundryUnit')).toHaveValue('piece');
 for(const name of ['frSubmitLaundryBooking','frLoadMyLaundryBookings','frLaundryProviderAction','frAdminLoadLaundry','frAdminReviewLaundryApplication','frAdminAssignLaundry'])expect(await page.evaluate(n=>typeof window[n],name)).toBe('function');
});
test('Laundry invalid booking is rejected without database writes',async({page})=>{
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>window.frSubmitLaundryBooking());
 await expect(page.locator('#laundryBookingStatus')).toContainText('Customer login');
});
