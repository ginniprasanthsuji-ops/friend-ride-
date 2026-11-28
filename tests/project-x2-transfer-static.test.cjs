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
// Dashboard routing regression: menu targets remain distinct and role-gated.
const menuGo=app.slice(app.indexOf('function menuGo('),app.indexOf('function useHomeLocation'));
for(const s of ["showPage(id)","id==='customerDashboard'","id==='driverDashboard'","id==='adminDashboard'","id==='partnerDashboard'","selectedRole!=='customer'","selectedRole!=='driver'","selectedRole!=='admin'","selectedRole!=='partner'"])
 assert.ok(menuGo.includes(s),'Dashboard routing/role guard invariant missing: '+s);
assert.ok(!menuGo.includes("showPage('customerDashboard')"),'Role dashboard router must not fall back to Customer Dashboard');
console.log('YT X2 dashboard routing distinct-target regression PASS');
// Tracking page category switcher: each category dispatches to its own loader.
const trackingSwitch=app.slice(app.indexOf('function selectTrackingCategory('),app.indexOf('async function frLoadTrackingParcelOrders'));
for(const s of ["frTrackingCategory=category","category==='ride'","loadMyRideTracking()","category==='parcel'","frLoadTrackingParcelOrders()","frLoadTrackingMarketOrders()"])
 assert.ok(trackingSwitch.includes(s),'Tracking category dispatch invariant missing: '+s);
const trackingMenu=menuGo.slice(menuGo.indexOf("'tracking'"));
assert.ok(trackingMenu.includes("!currentUser")&&trackingMenu.includes("openAuth('login')"),'Live tracking menu must be login-gated');
console.log('YT X2 tracking category dispatch/login gate static regression PASS');

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
assert.equal(app.split('async function frStationPostRRS(){').length-1,1,'RRS post handler must be declared exactly once to avoid duplicate/overridden workflow logic');


// Additional YT X2 ERS/RRS booking and privacy regression checks.
const multiBooking=fs.readFileSync('supabase/migrations/202611260011_fr_station_multi_passenger_booking.sql','utf8');
for(const s of ['auth.uid() is null','p_passengers not between 1 and 10','for update','passengers_booked+p_passengers > v_ride.passenger_capacity','v_ride.driver_id=auth.uid()','status in (\'requested\',\'confirmed\')','passenger_count','revoke all on function public.fr_station_book_ride(uuid,integer) from public,anon;','grant execute on function public.fr_station_book_ride(uuid,integer) to authenticated;'])assert.ok(multiBooking.includes(s),'YT X2 multi-passenger booking invariant missing: '+s);
const cancelBase=fs.readFileSync('supabase/migrations/202611260012_fr_station_booking_cancel_restore_seats.sql','utf8');
for(const s of ['auth.uid() is null','passenger_id=auth.uid()','for update','v_booking.status not in (\'requested\',\'confirmed\')','passengers_booked-v_booking.passenger_count','revoke all on function public.fr_station_cancel_booking(uuid) from public,anon;','grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;'])assert.ok(cancelBase.includes(s),'YT X2 cancellation seat-restoration invariant missing: '+s);
const photoMigration=fs.readFileSync('supabase/migrations/202611270002_project_x2_ers_rrs_departure_photo.sql','utf8');
for(const s of ['driver_approval_status','p_departure_at<=now()','p_photo_data !~ \'^data:image/jpeg;base64,\'','v_photo_bytes>1048576','case when b.status=\'confirmed\'','case when b.status=\'confirmed\' and r.ride_kind=\'RRS\' then r.driver_photo_data else null end','grant execute on function public.fr_station_post_ers'])assert.ok(photoMigration.includes(s),'YT X2 ERS/RRS photo/privacy invariant missing: '+s);
assert.ok(photoMigration.includes('from public.fr_station_rides where status=\'live\' and passengers_booked < passenger_capacity'),'Public LIVE view must hide full rides');
console.log('YT Project X2 ERS/RRS booking-capacity, cancellation, photo, and privacy regression checks PASS');


// Project X2 station booking client integration checks for the screenshot RPC mismatch.
const stationBookingStart=app.indexOf('async function frStationBook(id)');
const stationBookingEnd=app.indexOf('\nasync function frStationCancelBooking',stationBookingStart);
assert.ok(stationBookingStart>=0&&stationBookingEnd>stationBookingStart,'Station booking handler must exist');
const stationBooking=app.slice(stationBookingStart,stationBookingEnd);
for(const s of ["sb.rpc('fr_station_book_ride'","p_ride_id:id","p_passengers:seats","Number.isInteger(seats)","seats<1","seats>10","frStationRefresh()","frStationMyBookings()","Booking failed:"])assert.ok(stationBooking.includes(s),'X2 station booking RPC/UI integration invariant missing: '+s);
assert.ok(stationBooking.includes('CASH ONLY'),'Station booking must clearly state cash-only payment');
assert.ok(stationBooking.includes('Customer login required')&&stationBooking.includes('openAuth(\'login\')'),'Station booking requires customer authentication');
console.log('YT Project X2 station booking RPC parameter and UI integration static QA PASS');


// Project X2 corrective migration: RRS guest RPC must match the frontend's photo-data payload.
const rrsCompat=fs.readFileSync('supabase/migrations/202611280001_project_x2_rrs_photo_rpc_compatibility.sql','utf8');
for(const s of ['p_departure_at timestamptz','p_photo_data text','p_departure_at<=now()','p_photo_data !~ \'^data:image/jpeg;base64,\'','v_photo_bytes>1048576','driver_photo_data','p_photo_data:frRRSCompressedPhotoData'])assert.ok(rrsCompat.includes(s)||app.includes(s),'X2 RRS photo RPC compatibility invariant missing: '+s);
assert.ok(rrsCompat.includes('drop function if exists public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,text);'),'Corrective migration must remove incompatible path-only RPC');
assert.ok(rrsCompat.includes('grant execute on function public.fr_station_post_rrs_guest(text,text,text,text,text,numeric,integer,timestamptz,text) to anon,authenticated;'),'Corrective migration must grant the frontend-compatible RPC signature');
console.log('YT Project X2 RRS photo RPC compatibility regression QA PASS');


// Project X2 Parcel persistence: owner isolation, tracking format, cancellation boundary and phone privacy.
assert.ok(parcelMigration.includes("v_tracking:='FRP-'||upper(substr(replace(v_id::text,'-',''),1,12));"),'Parcel tracking ID must be generated with FRP prefix from request UUID');
const parcelList=parcelMigration.slice(parcelMigration.indexOf('create or replace function public.fr_customer_list_parcel_requests'),parcelMigration.indexOf('create or replace function public.fr_customer_cancel_parcel_request'));
for(const s of ['auth.uid() is not null','customer_id=auth.uid()','pickup_address','delivery_address','description','weight_kg','created_at'])assert.ok(parcelList.includes(s),'Parcel list must scope to authenticated owner and return tracking fields: '+s);
assert.ok(!parcelList.includes('sender_phone')&&!parcelList.includes('receiver_phone'),'Parcel tracking list must not expose sender or receiver phone numbers');
const parcelCancel=parcelMigration.slice(parcelMigration.indexOf('create or replace function public.fr_customer_cancel_parcel_request'),parcelMigration.indexOf('revoke all on function public.fr_customer_create_parcel_request'));
for(const s of ['auth.uid() is null','customer_id=auth.uid()',"status='requested'", "status='cancelled'",'updated_at=now()','if not found then raise exception'])assert.ok(parcelCancel.includes(s),'Parcel cancel must enforce ownership and requested-only status: '+s);
console.log('YT Project X2 Parcel tracking privacy, ownership, and cancellation static QA PASS');


// Marketplace counter-price form must not send empty offers to backend.
const counterHandler=app.slice(app.indexOf('async function frCustomerSendCounter('),app.indexOf('const frOriginalShowPage=showPage',app.indexOf('async function frCustomerSendCounter(')));
assert.ok(counterHandler.includes('if(!offers.length)'),'Counter offer must reject empty item offers before RPC');
assert.ok(counterHandler.includes('fr_customer_counter_market_order'),'Counter offer must persist via backend RPC');
console.log('YT Project X2 marketplace counter-offer empty-input regression PASS');


// Project X2 payment-claim UI compatibility and safe wording regression.
const claimHandler=app.slice(app.indexOf('async function frCustomerClaimMarketPayment('),app.indexOf('\nasync function ',app.indexOf('async function frCustomerClaimMarketPayment(')+1));
for(const s of ['fr_customer_claim_market_payment','p_order_id:id','p_reference:reference','reference.length<4','reference.length>160','Waiting for Shop confirmation','payment is not verified'])assert.ok(claimHandler.includes(s),'Customer payment claim UI invariant missing: '+s);
const claimUi=app.slice(app.indexOf('frCustomerOpenMarketPayment('),app.indexOf('async function frCustomerClaimMarketPayment('));
for(const s of ['frMarketPaymentReference_','frCustomerClaimMarketPayment','Payment Reference / UPI Transaction ID'])assert.ok(claimUi.includes(s),'Payment claim UI control missing: '+s);
const claimMigration=fs.readFileSync('supabase/migrations/202611270013_project_x2_food_shop_payment_claim_confirmation_draft.sql','utf8');
const confirmCompat=fs.readFileSync('supabase/migrations/202611270014_project_x2_food_shop_payment_confirmation_ui_compat_draft.sql','utf8');
for(const s of ['fr_customer_claim_market_payment','customer_payment_claimed_at','partner_payment_confirmed_at','payment_status=\'customer_claimed\'','payment_status=\'partner_confirmed\'','revoke all on function public.fr_customer_claim_market_payment(uuid,text) from public,anon;'])assert.ok(claimMigration.includes(s),'Payment claim migration invariant missing: '+s);
for(const s of ['p_payment_reference text default null','return public.fr_partner_confirm_market_payment(p_order_id)','Does not mark payment verified'])assert.ok(confirmCompat.includes(s),'Payment confirmation compatibility migration invariant missing: '+s);
assert.ok(!claimMigration.includes("payment_status='verified'")&&!confirmCompat.includes("payment_status='verified'"),'Claim/partner-confirm drafts must not mark payment verified');
console.log('YT Project X2 customer payment claim and partner confirmation static QA PASS');


// Project X2 Food/Shop draft-chain safety regression: state machine and payment confirmation remain non-verified.
const stateFix=fs.readFileSync('supabase/migrations/202611270011_project_x2_food_shop_state_machine_correction_draft.sql','utf8');
const idempotency=fs.readFileSync('supabase/migrations/202611270012_project_x2_food_shop_idempotency_draft.sql','utf8');
const multiStore=fs.readFileSync('supabase/migrations/202611270015_project_x2_food_shop_multistore_transaction_draft.sql','utf8');
for(const s of ['customer_quote_accepted','v_pay=\'verified\'','preparing','ready','completed'])assert.ok(stateFix.includes(s),'Food/Shop state-machine/payment gate draft invariant missing: '+s);
const acceptQuoteDraft=fs.readFileSync('supabase/migrations/202611270008_project_x2_food_shop_quote_counter_rpcs_draft.sql','utf8');
const acceptQuoteHandler=acceptQuoteDraft.slice(acceptQuoteDraft.indexOf('create or replace function public.fr_customer_accept_market_quote'),acceptQuoteDraft.indexOf('create or replace function public.fr_customer_counter_market_order'));
assert.ok(acceptQuoteHandler.includes("status='customer_quote_accepted'"),'Quote acceptance must enter the state-machine payment-gated state');
assert.ok(!acceptQuoteHandler.includes("status='accepted'"),'Quote acceptance must not enter the legacy accepted state');
const acceptQuoteFinal=fs.readFileSync('supabase/migrations/202611270010_project_x2_food_shop_delivery_fee_quote_history_draft.sql','utf8');
const acceptFinalHandler=acceptQuoteFinal.slice(acceptQuoteFinal.indexOf('create or replace function public.fr_customer_accept_market_quote'),acceptQuoteFinal.indexOf('create or replace function public.fr_customer_list_market_quote_history'));
assert.ok(acceptFinalHandler.includes("status='customer_quote_accepted'"),'Chronologically final quote-acceptance RPC must use payment-gated state');
assert.ok(!acceptFinalHandler.includes("status='accepted'"),'Final quote acceptance must not bypass payment-gated state');
const paymentDraft=fs.readFileSync('supabase/migrations/202611270013_project_x2_food_shop_payment_claim_confirmation_draft.sql','utf8');
const partnerConfirmDraft=paymentDraft.slice(paymentDraft.indexOf('create or replace function public.fr_partner_confirm_market_payment'),paymentDraft.indexOf('revoke all on function public.fr_customer_claim_market_payment'));
assert.ok(partnerConfirmDraft.includes("payment_status='partner_confirmed'"),'Partner confirmation should record confirmation state');
assert.ok(!partnerConfirmDraft.includes("payment_status='verified'"),'Partner confirmation must not self-mark payment verified');
const idemDraft=fs.readFileSync('supabase/migrations/202611270012_project_x2_food_shop_idempotency_draft.sql','utf8');
assert.ok(idemDraft.includes('request_payload_fingerprint'),'Idempotency migration must persist request payload fingerprint');
assert.ok(idemDraft.includes('Request key already used with a different order payload'),'Idempotency migration must reject changed payload on reused key');
assert.ok(idemDraft.includes('v_existing_fingerprint is distinct from v_fingerprint'),'Existing idempotency key must be fingerprint-checked');


assert.ok(stateFix.includes('revoke all on function public.fr_partner_update_market_order(uuid,text) from public,anon;')&&stateFix.includes('grant execute on function public.fr_partner_update_market_order(uuid,text) to authenticated;'),'Partner status updater ACL must remain restricted');
for(const s of ['request_key uuid','fr_market_orders_customer_request_key_uq','pg_advisory_xact_lock','fr_customer_place_market_order','update public.fr_market_orders set request_key=p_request_key'])assert.ok(idempotency.includes(s),'Single-store checkout idempotency draft invariant missing: '+s);
for(const s of ['fr_market_checkout_requests','payload_fingerprint','Request key already used with a different checkout payload','pg_advisory_xact_lock','fr_customer_place_market_order','group by (x.value->>\'store_id\')::uuid','grant execute on function public.fr_customer_place_market_orders_multi_v1(text,jsonb,uuid) to authenticated;'])assert.ok(multiStore.includes(s),'Multi-store transactional checkout draft invariant missing: '+s);
for(const p of ['202611270005_project_x2_food_shop_catalogue_foundation.sql','202611270006_project_x2_food_shop_order_schema_draft.sql','202611270007_project_x2_food_shop_core_order_rpcs_draft.sql','202611270008_project_x2_food_shop_quote_counter_rpcs_draft.sql','202611270009_project_x2_food_shop_negotiation_integrity_draft.sql','202611270010_project_x2_food_shop_delivery_fee_quote_history_draft.sql','202611270011_project_x2_food_shop_state_machine_correction_draft.sql','202611270012_project_x2_food_shop_idempotency_draft.sql','202611270013_project_x2_food_shop_payment_claim_confirmation_draft.sql','202611270014_project_x2_food_shop_payment_confirmation_ui_compat_draft.sql','202611270015_project_x2_food_shop_multistore_transaction_draft.sql'])assert.ok(fs.existsSync('supabase/migrations/'+p),'Expected draft migration missing: '+p);
console.log('YT Project X2 Food/Shop state-machine, payment gate, idempotency and multi-store draft-chain regression PASS');
