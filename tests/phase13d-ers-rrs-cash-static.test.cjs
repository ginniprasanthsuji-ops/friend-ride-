const fs = require('node:fs'); const assert = require('node:assert/strict');
const sql=fs.readFileSync('qa/sql/phase13d_ers_rrs_cash_booking.sql','utf8');
const html=fs.readFileSync('qa/phase13d-ers-rrs-cash-booking.html','utf8');
for(const s of ["ride_kind in ('ERS','RRS')","payment_method text not null default 'cash' check (payment_method = 'cash')","departing_time timestamp without time zone","guest_driver_photo_path text","p_departing_time timestamp without time zone","fr_phase13d_create_ers_rrs_booking","fr_phase13d_assign_ers_rrs_booking","fr_phase13e_assign_rrs_guest_driver","fr_phase13e_admin_complete_rrs_guest_cash","fr-rrs-guest-driver-photos","fr_phase13d_driver_confirm_cash","fr_phase13d_driver_complete_ers_rrs_ride","fr_phase13d_cancel_ers_rrs_booking","auth.uid()","public.is_friend_ride_admin()"])assert.ok(sql.includes(s),s);
for(const s of ["ERS — Registered driver","RRS — Unregistered guest bike driver","Departing Time","Guest driver photo (required","uploadGuestPhoto()","gphotoPath","fr-rrs-guest-driver-photos","PAYMENT: CASH ONLY","fr_phase13d_create_ers_rrs_booking","fr_phase13e_assign_rrs_guest_driver","fr_phase13e_admin_complete_rrs_guest_cash","fr_phase13d_driver_confirm_cash","fr_phase13d_driver_complete_ers_rrs_ride","fr_phase13d_assign_ers_rrs_booking","function esc(v)"])assert.ok(html.includes(s),s);
assert.ok(!/upi|online payment|payment gateway/i.test(html.replace("No UPI / Online / QR","")), "UI should not offer online payment");
assert.ok(/where id=p_booking_id and ride_kind='ERS' and status='pending' and driver_id is null/.test(sql),"Registered assignment must be ERS-only");
assert.ok(/where id=p_booking_id and ride_kind='RRS' and status='pending' and driver_id is null/.test(sql),"Guest assignment must be RRS-only");
assert.ok(sql.includes("ERS requires an approved registered FRIEND RIDE driver")&&sql.includes("driver_approval_status,'')) in ('approved','verified','active')"),"ERS requires approved registered driver role/status");
assert.ok(sql.includes("('driving_license'),('aadhaar'),('vehicle_rc')")&&sql.includes("verification_status,''))='verified'"),"ERS requires all three verified KYC documents");
assert.ok(sql.includes("p_guest_driver_name text")&&sql.includes("p_guest_driver_phone text")&&sql.includes("p_guest_bike_details text")&&sql.includes("p_guest_driver_photo_path text"),"RRS guest driver details and photo required");
assert.ok(sql.includes("guest_driver_photo_path text")&&sql.includes("values ('fr-rrs-guest-driver-photos','fr-rrs-guest-driver-photos',false,5242880"),"Photo path column and private bucket with 5MB limit");
assert.ok(sql.includes("create policy fr_rrs_guest_photo_admin_select")&&sql.includes("create policy fr_rrs_guest_photo_admin_insert")&&sql.includes("create policy fr_rrs_guest_photo_admin_delete"),"RRS photo storage admin-only policies");
assert.ok(sql.includes("p_guest_driver_photo_path not like p_booking_id::text||\'/%\'")&&sql.includes("Uploaded guest driver photo not found in private bucket"),"Guest photo is booking-scoped and must exist in private storage");
assert.ok(/ride_kind='RRS' and driver_id is null[\s\S]*guest_driver_name is not null/.test(sql),"Guest completion/cash path must be RRS-only");
assert.ok(sql.includes("departing_time")&&sql.includes("p_departing_time")&&html.includes("p_departing_time:"),"Departing Time persisted and passed by UI");
assert.ok(/status='completed'[\s\S]*payment_method='cash'[\s\S]*payment_status='cash_pending'/.test(sql),"ERS cash confirmation requires completion and pending cash");
assert.equal(sql.split('as $$').length-1,9,"All nine RPC bodies must use dollar quoting");
assert.equal(sql.split('$$;').length-1,9,"All nine RPC bodies must close");
assert.ok(sql.includes("fr_phase13d_cancel_ers_rrs_booking(p_booking_id uuid)\nreturns void language plpgsql")&&sql.includes("end $$;"),"Cancellation RPC dollar quoting valid");
assert.ok(sql.includes("status='pending' and driver_id is null")&&sql.includes("customer_id=auth.uid() or public.is_friend_ride_admin()"),"Cancellation only customer/admin pending unassigned");
assert.ok(sql.includes("fr_phase13d_get_my_ers_rrs_bookings()")&&sql.includes("notify pgrst, 'reload schema';"),"Bookings RPC and schema cache reload");
console.log("Phase 13E ERS registered / RRS guest / departure-time / cash-only static checks PASS");
// Main app Ride page must visibly expose RRS guest-driver photo upload UI.
const app=fs.readFileSync('index.html','utf8');
for(const s of ['ERS / RRS Shared Ride',"frSetSharedRideMode('RRS')",'frRRSGuestPhoto','RRS Guest Driver Photo (Required)','frPreviewRRSGuestPhoto(event)','Guest Driver Name','Guest Driver Phone','Bike Details','max 5 MB','image/jpeg,image/png,image/webp'])assert.ok(app.includes(s),s);
assert.ok(app.includes('frRRSGuestPhotoPanel')&&app.includes('class="hide"'), 'RRS photo fields are toggled and shown on RRS selection');

// Main-app RRS photo backend integration static assertions.
assert.ok(sql.includes('fr_phase13e_customer_save_rrs_guest_details'), 'customer-scoped RPC persists RRS guest fields/photo path');
assert.ok(sql.includes('fr_rrs_guest_photo_customer_insert')&&sql.includes('fr_rrs_guest_photo_customer_select')&&sql.includes('fr_rrs_guest_photo_customer_delete'), 'customer storage policies are booking-scoped');
assert.ok(app.includes('async function saveRideRequest()')&&app.includes('fr_phase13d_create_ers_rrs_booking'), 'main app creates an RRS booking');
assert.ok(app.includes('fr_phase13e_customer_save_rrs_guest_details')&&app.includes('.upload(filePath,photo'), 'main app uploads photo and persists its path');
assert.ok(app.includes('Pending admin assignment')&&app.includes('Photo path:'), 'main app displays booking status and saved path');
