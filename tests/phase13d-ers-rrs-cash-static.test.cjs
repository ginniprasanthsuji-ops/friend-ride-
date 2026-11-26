const fs = require('node:fs'); const assert = require('node:assert/strict');
const sql=fs.readFileSync('qa/sql/phase13d_ers_rrs_cash_booking.sql','utf8');
const html=fs.readFileSync('qa/phase13d-ers-rrs-cash-booking.html','utf8');
for(const s of ["ride_kind in ('ERS','RRS')","payment_method text not null default 'cash' check (payment_method = 'cash')","fr_phase13d_create_ers_rrs_booking","fr_phase13d_assign_ers_rrs_booking","fr_phase13d_driver_confirm_cash","auth.uid()","public.is_friend_ride_admin()"])assert.ok(sql.includes(s),s);
for(const s of ["ERS","RRS","PAYMENT: CASH ONLY","fr_phase13d_create_ers_rrs_booking","fr_phase13d_driver_confirm_cash","fr_phase13d_assign_ers_rrs_booking"])assert.ok(html.includes(s),s);
assert.ok(!/upi|online payment|payment gateway/i.test(html.replace(/No UPI \/ Online \/ QR/g,'')),"UI should not offer online payment");
console.log("Phase 13D ERS/RRS cash-only static checks PASS");
