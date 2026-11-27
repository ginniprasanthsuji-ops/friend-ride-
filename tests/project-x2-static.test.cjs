const fs=require('node:fs');const assert=require('node:assert/strict');
const app=fs.readFileSync('index.html','utf8');
const migration=fs.readFileSync('supabase/migrations/202611270001_project_x2_ers_rrs_departure_rrs_photo.sql','utf8');
const create=fs.readFileSync('supabase/functions/fr-razorpay-create-order/index.ts','utf8');
const verify=fs.readFileSync('supabase/functions/fr-razorpay-verify-payment/index.ts','utf8');
const ledger=fs.readFileSync('supabase/migrations/202611270002_fr_razorpay_payment_orders.sql','utf8');
const cancel=fs.readFileSync('supabase/migrations/202611270004_project_x2_station_booking_cancel_fix.sql','utf8');
// YF-only test preview must never call the production Supabase project.
// QA auth must use a dedicated local-storage session key to avoid production-token contamination.
assert.ok(app.includes("storageKey:'friend-ride-yf15-auth-v1'"),'YF QA auth session is isolated');
assert.ok(!app.includes("storageKey:'friend-ride-auth-v1'"),'YF app must not reuse shared auth storage key');
assert.ok(app.includes("https://pqsangtvietawkfgpgfu.supabase.co"),'YF test app uses FRIEND RIDE QA Supabase');
assert.ok(!app.includes('fglyplxcczdjtfwobtzh.supabase.co'),'YF test app must not point to production Supabase');
// RRS photo UI, iterative compression, strict size cap, and RPC payload.
for(const s of ['frRRSCompressedPhotoData','frCompressRRSPhoto(event)','accept="image/*"','1 MB','1048576','canvas.toBlob(resolve,\'image/jpeg\',quality)','blob.size<=1048576','p_photo_data:frRRSCompressedPhotoData'])assert.ok(app.includes(s),'RRS photo invariant: '+s);
assert.ok(app.includes('frStationPostRRS()'),'RRS post handler exists');
assert.ok(app.includes('async function frStationPostRRS(){'),'RRS post handler must be async to use await');

// Guest RRS RPC must not send a persisted user JWT; use the isolated anon client.
assert.ok(app.includes('const frRrsGuestSb=window.supabase.createClient'),'Session-free guest RRS client exists');
assert.ok(app.includes("frRrsGuestSb.rpc('fr_station_post_rrs_guest'"),'Guest RRS posting uses isolated client');

// Prevent the missing/stale RPC signature shown in the user's RRS error screenshot.
assert.ok(app.includes("frRrsGuestSb.rpc('fr_station_post_rrs_guest'"),'RRS frontend calls expected RPC through guest client');
for(const s of ['p_name:name','p_phone:phone','p_vehicle:vehicle','p_from:f','p_to:t','p_fare:fare','p_passengers:passengers','p_departure_at:new Date(depart).toISOString()','p_photo_data:frRRSCompressedPhotoData'])assert.ok(app.includes(s),'RRS RPC argument: '+s);
assert.ok(migration.includes('create or replace function public.fr_station_post_rrs_guest('),'RRS backend RPC is defined in migration');
for(const s of ['p_name text,p_phone text,p_vehicle text,p_from text,p_to text,p_fare numeric','p_passengers integer,p_departure_at timestamptz,p_photo_data text'])assert.ok(migration.includes(s),'RRS RPC signature includes: '+s);

assert.ok(app.includes('p_departure_at:new Date(depart).toISOString()'),'RRS departure timestamp sent as ISO');
assert.ok(migration.includes('p_departure_at timestamptz'),'Backend departure parameter exists');
assert.ok(migration.includes('p_departure_at<=now()'),'Backend rejects past departure');
assert.ok(migration.includes('driver_photo_data text'),'RRS photo column exists');
assert.ok(migration.includes('v_photo_bytes>1048576'),'Backend enforces 1 MB photo limit');
assert.ok(migration.includes('b.status=\'confirmed\' and r.ride_kind=\'RRS\''),'Photo only returned to confirmed RRS booking');
assert.ok(migration.includes('case when b.status=\'confirmed\' then r.driver_phone else null end'),'Driver contact hidden until booking confirmed');
// Platform fee calculation bounds.
assert.ok(create.includes('Math.min(2500,Math.round(subtotal*0.025))'),'2.5% fee capped at ₹25');
assert.ok(create.includes('Authentication required'),'Payment order creation requires authenticated user');
assert.ok(create.includes('RAZORPAY_KEY_ID')&&create.includes('RAZORPAY_KEY_SECRET'),'Payment server secrets required');
assert.ok(create.includes('fr_razorpay_payment_orders'),'Order ledger write present');
assert.ok(create.includes('Invalid subtotal'),'Subtotal validation present');
// Verification requires signature + provider lookup + captured payment + amount/currency/order/owner.
for(const s of ['hmacHex(secret,orderId+"|"+paymentId)','constantTimeEqual(expected,signature)','eq("user_id",user.id)','payment.status!=="captured"','payment.amount!==record.amount_paise','payment.currency!==record.currency','record.status!=="created"','status:"paid"'])assert.ok(verify.includes(s),'Payment verification invariant: '+s);
for(const s of ['user_id uuid not null','razorpay_order_id','amount_paise','status','unique'])assert.ok(ledger.includes(s),'Ledger invariant: '+s);
// Passenger cancellation is scoped to the booking owner and confirmed status; restore seats safely.
assert.ok(app.includes("sb.rpc('fr_station_cancel_booking',{p_booking_id:id})"),'Cancellation UI calls backend RPC');
for(const s of ['auth.uid() is null','passenger_id = auth.uid()','Only confirmed bookings can be cancelled','for update','passengers_booked = greatest(0, passengers_booked - 1)','status = case when status = \'booked\' then \'live\' else status end'])assert.ok(cancel.includes(s),'Cancellation invariant: '+s);
assert.ok(cancel.includes('revoke all on function public.fr_station_cancel_booking(uuid) from public, anon;'),'Cancellation RPC blocks public and anon');
assert.ok(cancel.includes('grant execute on function public.fr_station_cancel_booking(uuid) to authenticated;'),'Cancellation RPC granted to authenticated only');
console.log('Project X2 static security/regression checks PASS');
