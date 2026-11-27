const fs=require('node:fs');const assert=require('node:assert/strict');
const app=fs.readFileSync('index.html','utf8');
const migration=fs.readFileSync('supabase/migrations/202611270002_project_x2_ers_rrs_departure_photo.sql','utf8');
const cancel=fs.readFileSync('supabase/migrations/202611260012_fr_station_booking_cancel_restore_seats.sql','utf8');
for(const s of ['frErsDepartAt','p_departure_at:departureAt.toISOString()','departureAt<=new Date()','frRrsCompressPhoto(file)','blob.size>1024*1024','blob.size>1048576','frRRSCompressedPhotoData','frCompressRRSPhoto(event)','frRrsDepartAt','frStationPostRRS()','async function frStationPostRRS','p_departure_at:new Date(depart).toISOString()','p_photo_data:frRRSCompressedPhotoData','frRrsGuestSb.rpc'])assert.ok(app.includes(s),'YT X2 frontend invariant missing: '+s);
for(const s of ['1048576','v_photo_bytes>1048576','p_photo_data text','p_departure_at timestamptz','p_departure_at<=now()','driver_photo_data text'])assert.ok(migration.includes(s),'YT X2 migration invariant missing: '+s);
assert.ok(migration.includes('passenger_count integer')&&migration.includes('b.passenger_count'),'My bookings RPC returns the actual booked passenger quantity');
assert.ok(migration.includes('drop function if exists public.fr_station_my_bookings();'),'Bookings RPC must be dropped before its return schema changes');
assert.ok(cancel.includes('passenger_count')&&cancel.includes('passengers_booked=greatest(0,passengers_booked-v_booking.passenger_count)'),'Existing YT cancellation restores multi-passenger seats');
assert.ok(cancel.includes('revoke all on function public.fr_station_cancel_booking(uuid) from public,anon;')&&cancel.includes('grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;'),'YT cancellation RPC ACL restricted');
const cancelFix=fs.readFileSync('supabase/migrations/202611270003_project_x2_station_cancel_security_fix.sql','utf8');
for(const s of ['auth.uid() is null','passenger_id=auth.uid()','for update','v_booking.status not in (\'requested\',\'confirmed\')','v_ride.status not in (\'live\',\'booked\')','passengers_booked-v_booking.passenger_count','revoke all on function public.fr_station_cancel_booking(uuid) from public,anon;','grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;'])assert.ok(cancelFix.includes(s),'YT X2 cancellation security/seat restoration invariant missing: '+s);
console.log('YT Project X2 transfer static checks PASS');

const parcelMigration=fs.readFileSync('supabase/migrations/202611270004_project_x2_parcel_persistence.sql','utf8');
assert.equal(parcelMigration.split('$$').length-1,6,'Parcel RPC dollar quoting must be balanced across three functions');
assert.ok(!parcelMigration.includes('returns table(parcel_id uuid,tracking_id text,status text,sender_phone'),'Parcel list RPC must not expose sender/receiver phone numbers');
for(const s of ['fr_parcel_requests','tracking_id text not null unique','customer_id uuid not null references auth.users(id)','fr_customer_create_parcel_request','fr_customer_list_parcel_requests','fr_customer_cancel_parcel_request','auth.uid()',"status='requested'",'enable row level security',"p.role='customer'", "set search_path=''",'auth.uid() is not null and customer_id=auth.uid()','grant execute on function public.fr_customer_create_parcel_request'])assert.ok(parcelMigration.includes(s),'X2 parcel persistence migration invariant missing: '+s);
for(const s of ['fr_customer_create_parcel_request','p_sender_name','p_sender_phone','p_pickup_address','p_receiver_name','p_receiver_phone','p_delivery_address','p_description','p_weight_kg','frLoadTrackingParcelOrders','fr_customer_cancel_parcel_request'])assert.ok(app.includes(s),'X2 parcel UI integration missing: '+s);
const foodMenuCode=app.slice(app.indexOf('function renderRestaurantMenu()'),app.indexOf('function frCartUpdateBadges()'));
assert.ok(foodMenuCode.includes('Demo Menu Only')&&!foodMenuCode.includes('addMarketCart'),'Demo food menu must not create fake checkout cart entries');
for(const s of ['fr_customer_place_market_order','fr_customer_list_market_orders','fr_partner_quote_market_order','fr_customer_accept_market_quote','fr_customer_counter_market_order','fr_partner_confirm_market_payment'])assert.ok(app.includes(s),'X2 food/shop order backend RPC integration missing: '+s);
// YT mobile screenshot regression: role launcher text must be readable UTF-8 and LIVE listing must not request private photo-path schema.
for(const s of ['మీ ప్రయాణం • మీ సేవలు • మీ వ్యాపారం','మీరు ఎవరు?','Customer','Driver','Partner','Admin'])assert.ok(app.includes(s),'Role launcher encoding/readability regression: '+s);
const stationRefresh=app.slice(app.indexOf('async function frStationRefresh(){'),app.indexOf('\nfunction frStationFilter',app.indexOf('async function frStationRefresh(){')));
assert.ok(stationRefresh.includes('fr_station_live_rides_public'),'LIVE station query missing');
assert.ok(!stationRefresh.includes('driver_photo_path'),'LIVE station query/cards must not depend on nonexistent driver_photo_path or expose private photos');
// Screenshot regression: customer dashboard numbers, readable icon entities, and clean home subtitle.
assert.ok(app.includes('<small>Wallet Balance</small><b>₹0.00</b>'),'Dashboard wallet amount must render as readable rupee value');
assert.ok(app.includes('<small>Bookings</small><b>0</b>'),'Dashboard bookings must show numeric zero, not a placeholder dash');
assert.ok(app.includes('Your ride, services and local shopping — all in one app.'),'Home subtitle encoding regression');
assert.ok(app.includes('&#9776;'),'Hamburger icon must use a safe HTML entity');
console.log('YT Project X2 parcel persistence and commerce safeguards PASS');
// Food demo items must remain non-orderable until linked to an approved restaurant catalogue.
assert.ok(foodMenuCode.includes('Demo Menu Only')&&foodMenuCode.includes('disabled')&&!foodMenuCode.includes('addMarketCart'),'Demo food menu remains disabled and cannot create fake cart items');
// Market checkout must only send store-backed catalogue items and persist orders via RPC.
const checkoutCode=app.slice(app.indexOf('async function marketCheckout()'),app.indexOf('document.addEventListener(\'DOMContentLoaded\',()=>{renderRestaurantList()'));
for(const s of ['frMarketCart.length','ids.length!==1','fr_customer_place_market_order','p_store_id:ids[0]','p_items:items','Order ID'])assert.ok(checkoutCode.includes(s),'X2 market checkout safeguard missing: '+s);

// Tracking loaders must await Supabase RPCs so errors/data are handled from the resolved response.
for(const fn of ['frLoadTrackingParcelOrders','frLoadTrackingMarketOrders']){
 const start=app.indexOf('async function '+fn+'(');
 assert.ok(start>=0,'Tracking loader must be async: '+fn);
 const next=app.indexOf('\nasync function ',start+1);
 const body=app.slice(start,next<0?start+4500:next);
 assert.ok(body.includes('await sb.rpc('),'Tracking loader must await Supabase RPC: '+fn);
 assert.ok(body.includes('catch(e)'), 'Tracking loader must show backend errors: '+fn);
}
for(const s of ['trackTabParcel','trackTabMarket','selectTrackingCategory(\'parcel\')','selectTrackingCategory(\'market\')','frLoadTrackingParcelOrders()','frLoadTrackingMarketOrders()'])assert.ok(app.includes(s),'Parcel/Food/Shop tracking UI integration missing: '+s);

// Food/Shop payment UI must require partner confirmation and rely on backend RPC (no client-side fake paid state).
const partnerPaymentConfirm=app.slice(app.indexOf('async function frPartnerConfirmMarketPayment('),app.indexOf('\nasync function ',app.indexOf('async function frPartnerConfirmMarketPayment(')+1));
for(const s of ['confirm(','fr_partner_confirm_market_payment','if(error)throw error','loadPartnerOrders()'])assert.ok(partnerPaymentConfirm.includes(s),'Partner payment confirmation safeguard missing: '+s);
assert.ok(!partnerPaymentConfirm.includes('payment_status=')&&!partnerPaymentConfirm.includes('status=\'paid\''),'Payment confirmation must not be client-written as paid');
const customerQuoteAccept=app.slice(app.indexOf('async function frCustomerAcceptQuote('),app.indexOf('\nasync function ',app.indexOf('async function frCustomerAcceptQuote(')+1));
assert.ok(customerQuoteAccept.includes('fr_customer_accept_market_quote'),'Customer quote acceptance must use backend RPC');
assert.ok(!customerQuoteAccept.includes('payment_status=')&&!customerQuoteAccept.includes('status=\'paid\''),'Quote acceptance must not mark payment paid');

// Any UI RPC handler that uses await must be declared async to avoid browser SyntaxErrors.
for(const fn of ['frLoadCustomerMarketOrders','frCustomerAcceptQuote','frCustomerSendCounter','frPartnerConfirmMarketPayment','frLoadTrackingParcelOrders','frLoadTrackingMarketOrders']){
 const start=app.indexOf('async function '+fn+'(');
 assert.ok(start>=0,'RPC handler must be async: '+fn);
 const next=app.indexOf('\\nasync function ',start+1);
 const body=app.slice(start,next<0?start+5000:next);
 assert.ok(body.includes('await sb.rpc('),'RPC handler must await its Supabase call: '+fn);
}

// Catch accidental doubled async keywords introduced during handler fixes.
assert.ok(!app.includes('async async function'),'Duplicated async declaration found in app inline script');


// Additional YT X2 ERS/RRS booking and privacy regression checks.
const multiBooking=fs.readFileSync('supabase/migrations/202611260011_fr_station_multi_passenger_booking.sql','utf8');
for(const s of ['auth.uid() is null','p_passengers not between 1 and 10','for update','passengers_booked+p_passengers > v_ride.passenger_capacity','v_ride.driver_id=auth.uid()','status in (\'requested\',\'confirmed\')','passenger_count','revoke all on function public.fr_station_book_ride(uuid,integer) from public,anon;','grant execute on function public.fr_station_book_ride(uuid,integer) to authenticated;'])assert.ok(multiBooking.includes(s),'YT X2 multi-passenger booking invariant missing: '+s);
const cancelBase=fs.readFileSync('supabase/migrations/202611260012_fr_station_booking_cancel_restore_seats.sql','utf8');
for(const s of ['auth.uid() is null','passenger_id=auth.uid()','for update','v_booking.status not in (\'requested\',\'confirmed\')','passengers_booked-v_booking.passenger_count','revoke all on function public.fr_station_cancel_booking(uuid) from public,anon;','grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;'])assert.ok(cancelBase.includes(s),'YT X2 cancellation seat-restoration invariant missing: '+s);
const photoMigration=fs.readFileSync('supabase/migrations/202611270002_project_x2_ers_rrs_departure_photo.sql','utf8');
for(const s of ['driver_approval_status','p_departure_at<=now()','p_photo_data !~ \'^data:image/jpeg;base64,\'','v_photo_bytes>1048576','case when b.status=\'confirmed\'','case when b.status=\'confirmed\' and r.ride_kind=\'RRS\' then r.driver_photo_data else null end','grant execute on function public.fr_station_post_ers'])assert.ok(photoMigration.includes(s),'YT X2 ERS/RRS photo/privacy invariant missing: '+s);
assert.ok(photoMigration.includes('from public.fr_station_rides where status=\'live\' and passengers_booked < passenger_capacity'),'Public LIVE view must hide full rides');
console.log('YT Project X2 ERS/RRS booking-capacity, cancellation, photo, and privacy regression checks PASS');
