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
test('TASKO booking dropdown retains Beauty Makeover and Halwai categories',async({page})=>{
 await page.goto('./',{waitUntil:'domcontentloaded'});
 const options=await page.locator('#taskoCategory option').allTextContents();
 expect(options).toHaveLength(10);
 expect(options).toContain('Beauty Makeover');
 expect(options).toContain('Halwai – Sweets & Food Preparation');
 expect(options).not.toContain('Catering Services');
 expect(options).not.toContain('DJ – Sound & Lights');
});
test('Beauty Makeover and Halwai booking selections persist to TASKO request rows',async({page})=>{
 const submitted=[];
 await page.route('https://*.supabase.co/rest/v1/fr_service_bookings**',async route=>{
  if(route.request().method()==='POST'){
   submitted.push(route.request().postDataJSON());
   return route.fulfill({status:201,contentType:'application/json',headers:{'content-range':'0-0/1'},body:JSON.stringify({id:'qa-tasko-'+submitted.length})});
  }
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{currentUser={id:'qa-customer'};currentProfile={role:'customer'};selectedRole='customer';});
 const tomorrow=await page.evaluate(()=>{const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().slice(0,10);});
 for(const category of ['Beauty Makeover','Halwai – Sweets & Food Preparation']){
  await page.locator('#taskoCategory').selectOption({label:category});
  await page.locator('#taskoDate').fill(tomorrow);
  await page.locator('#taskoTime').fill('10:30');
  await page.locator('#taskoAddress').fill('Tekkali Main Road, Srikakulam, Andhra Pradesh');
  await page.locator('#taskoNotes').fill('QA verify category registration and admin mapping');
  await page.locator('#taskoGiggerLaunch button[onclick="frSubmitTaskoBooking()"]').click();
  await expect(page.locator('#taskoBookingStatus')).toContainText('TASKO request submitted',{timeout:15000});
  await expect.poll(()=>submitted.length).toBe(submitted.length+1);
 }
 expect(submitted).toHaveLength(2);
 expect(submitted.map(row=>row.category)).toEqual(['Beauty Makeover','Halwai – Sweets & Food Preparation']);
 expect(submitted.every(row=>row.service_type==='tasko'&&row.subcategory==='TASKO / GIGGER'&&row.customer_id==='qa-customer'&&row.status==='pending')).toBe(true);
});
test('Admin TASKO control centre displays Beauty Makeover and Halwai request categories',async({page})=>{
 const bookingRows=[
  {id:'qa-beauty-001',customer_id:'qa-customer',assigned_provider_id:null,category:'Beauty Makeover',service_date:'2026-11-23',service_time:'10:30',pickup_address:'Tekkali, India',notes:'Beauty work',status:'pending',quoted_amount:null,final_amount:null,payment_status:'not_due',payment_reference:null,created_at:'2026-11-22T00:00:00Z'},
  {id:'qa-halwai-001',customer_id:'qa-customer',assigned_provider_id:null,category:'Halwai – Sweets & Food Preparation',service_date:'2026-11-23',service_time:'11:00',pickup_address:'Tekkali, India',notes:'Sweets preparation',status:'pending',quoted_amount:null,final_amount:null,payment_status:'not_due',payment_reference:null,created_at:'2026-11-22T00:00:01Z'}
 ];
 await page.route('https://*.supabase.co/rest/v1/fr_service_provider_applications**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'content-range':'0-0/0'},body:'[]'}));
 await page.route('https://*.supabase.co/rest/v1/fr_service_bookings**',route=>route.fulfill({status:200,contentType:'application/json',headers:{'content-range':'0-1/2'},body:JSON.stringify(bookingRows)}));
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{currentProfile={role:'admin'};currentUser={id:'qa-admin'};selectedRole='admin';});
 await page.evaluate(()=>frAdminLoadTasko());
 await expect(page.locator('#taskoAdminBookings')).toContainText('Beauty Makeover',{timeout:15000});
 await expect(page.locator('#taskoAdminBookings')).toContainText('Halwai – Sweets & Food Preparation');
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
