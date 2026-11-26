const fs = require('node:fs'); const assert = require('node:assert/strict');
const sql=fs.readFileSync('qa/sql/phase13d_ers_rrs_cash_booking.sql','utf8');
const html=fs.readFileSync('qa/phase13d-ers-rrs-cash-booking.html','utf8');
for(const s of ["ride_kind in ('ERS','RRS')","payment_method text not null default 'cash' check (payment_method = 'cash')","fr_phase13d_create_ers_rrs_booking","fr_phase13d_assign_ers_rrs_booking","fr_phase13d_driver_confirm_cash","fr_phase13d_driver_complete_ers_rrs_ride","fr_phase13d_cancel_ers_rrs_booking","auth.uid()","public.is_friend_ride_admin()"])assert.ok(sql.includes(s),s);
for(const s of ["ERS","RRS","PAYMENT: CASH ONLY","fr_phase13d_create_ers_rrs_booking","fr_phase13d_driver_confirm_cash","fr_phase13d_driver_complete_ers_rrs_ride","fr_phase13d_assign_ers_rrs_booking","function esc(v)"])assert.ok(html.includes(s),s);
assert.ok(!/upi|online payment|payment gateway/i.test(html.replace("No UPI / Online / QR","")), "UI should not offer online payment");
assert.ok(/status='completed'[\s\S]*payment_method='cash'[\s\S]*payment_status='cash_pending'/.test(sql),"Cash confirmation requires completed ride and pending cash");
assert.ok(sql.includes("p.role='driver'")&&sql.includes("driver_approval_status,'')) in ('approved','verified','active')"),"Assignment requires approved driver role/status");
assert.ok(sql.includes("('driving_license'),('aadhaar'),('vehicle_rc')")&&sql.includes("verification_status,''))='verified'"),"Assignment requires all three verified KYC documents");
assert.equal(sql.split('as $$').length-1,7,"All seven RPC bodies must use dollar quoting");
assert.equal(sql.split('$$;').length-1,7,"All seven RPC bodies must close");
assert.ok(sql.includes("fr_phase13d_cancel_ers_rrs_booking(p_booking_id uuid)\nreturns void language plpgsql")&&sql.includes("end $$;"),"Cancellation RPC must use correct dollar quoting");
assert.ok(sql.includes("status='pending' and driver_id is null")&&sql.includes("customer_id=auth.uid() or public.is_friend_ride_admin()"),"Cancellation is limited to customer/admin and pending unassigned bookings");
assert.ok(sql.includes("fr_phase13d_get_my_ers_rrs_bookings()")&&sql.includes("notify pgrst, 'reload schema';"),"No-argument bookings RPC must be created and PostgREST schema cache reloaded");
console.log("Phase 13D ERS/RRS cash-only static checks PASS");
// RPC/server error text must never be inserted as HTML.
assert.ok(html.includes("e.textContent=t"),"RPC status/error message uses textContent");
assert.ok(html.includes("document.getElementById('mine').textContent=e.message"),"Customer booking errors use textContent");
assert.ok(html.includes("document.getElementById('admin').textContent=e.message"),"Admin booking errors use textContent");
console.log("Phase 13D RPC error-output safety checks PASS");

// Authenticated workflow authorization invariants.
assert.ok(sql.includes("if auth.uid() is null then raise exception 'Authentication required'; end if;"),"Create/cancel/completion/cash RPCs reject unauthenticated calls");
assert.ok(sql.includes("if auth.uid() is null or not public.is_friend_ride_admin() then raise exception 'Admin access required'; end if;"),"Driver assignment requires authenticated admin");
assert.ok(sql.includes("where id=p_booking_id and driver_id=auth.uid() and status='assigned'"),"Ride completion is restricted to assigned driver and assigned status");
assert.ok(sql.includes("where id=p_booking_id and driver_id=auth.uid() and status='completed'"),"Cash confirmation is restricted to assigned driver after completion");
assert.ok(sql.includes("where auth.uid() is not null and (customer_id=auth.uid() or driver_id=auth.uid())"),"My bookings RPC restricts results to customer or assigned driver");
assert.ok(sql.includes("where auth.uid() is not null and public.is_friend_ride_admin()"),"Admin list RPC requires admin authorization");
for(const fn of ["create_ers_rrs_booking","assign_ers_rrs_booking","driver_complete_ers_rrs_ride","driver_confirm_cash","list_ers_rrs_bookings","get_my_ers_rrs_bookings","cancel_ers_rrs_booking"])assert.ok(sql.includes("revoke all on function public.fr_phase13d_"+fn),"Anon/public execute revoked: "+fn);
console.log("Phase 13D ERS/RRS authorization invariant checks PASS");
// Main app Phase 13D lifecycle integration assertions.
const app=fs.readFileSync('index.html','utf8');
for(const s of ['fr13dCreate()','fr13dRefresh()','fr13dAssign()','fr13dAdminList()','fr13dComplete()','fr13dCash()','fr13dCancel(id)','fr_phase13d_create_ers_rrs_booking','fr_phase13d_assign_ers_rrs_booking','fr_phase13d_driver_complete_ers_rrs_ride','fr_phase13d_driver_confirm_cash','fr_phase13d_cancel_ers_rrs_booking','fr_phase13d_get_my_ers_rrs_bookings_with_driver','fr_phase13d_list_ers_rrs_bookings_with_driver','fr13dMyBookings','fr13dAdminBookings','fr13dDriverBookingId','PAYMENT: CASH ONLY'])assert.ok(app.includes(s), 'Main app integration missing: '+s);
assert.ok(app.includes('frSubEsc(x.pickup_text)')&&app.includes('frSubEsc(x.drop_text)')&&app.includes('frSubEsc(x.driver_id||'), 'Rendered booking fields must be escaped');
console.log('Phase 13D main-app integration assertions PASS');

// Subscription payment migration reconciliation regression checks.
const subscriptionMigration=fs.readFileSync('supabase/migrations/202611260005_fr_subscription_migration_reconcile.sql','utf8');
for(const s of ["status='reference_submitted'","admin_verified_by uuid references auth.users(id)","admin_verified_at timestamptz","status in ('pending_payment','reference_submitted','verified','rejected','activated')","public.fr_subscription_submit_payment_reference","public.fr_admin_subscription_review","where id=p_request_id and user_id=auth.uid() and status='pending_payment'","where id=p_request_id and status='reference_submitted'","notify pgrst, 'reload schema'"])assert.ok(subscriptionMigration.includes(s),'Subscription reconciliation migration missing: '+s);
assert.ok(subscriptionMigration.includes("p_action='approve' then 'activated'"),'Admin approval must activate only after review');
assert.ok(subscriptionMigration.includes("p_action='approve' then 'activated' else 'rejected'"),'Admin rejection state must be preserved');
console.log('Subscription migration drift/review invariants PASS');

// Driver details display and scoped RPC assertions.
const driverDetailsMigration=fs.readFileSync('supabase/migrations/202611260006_fr_phase13d_driver_details.sql','utf8');
for(const s of ['fr_phase13d_get_my_ers_rrs_bookings_with_driver','fr_phase13d_list_ers_rrs_bookings_with_driver','p.full_name,p.phone,coalesce(p.vehicle_number,p.vehicle_registration)','b.customer_id=auth.uid() or b.driver_id=auth.uid()','public.is_friend_ride_admin()'])assert.ok(driverDetailsMigration.includes(s),'Driver details migration missing scoped field/access check: '+s);
for(const s of ['Driver Name:','Driver Phone:','Vehicle Number:','x.driver_personal_name','x.driver_personal_number','x.driver_vehicle_number'])assert.ok(app.includes(s),'Assigned driver details UI missing: '+s);
console.log('ERS/RRS assigned driver personal name/phone/vehicle display and scoped access checks PASS');
