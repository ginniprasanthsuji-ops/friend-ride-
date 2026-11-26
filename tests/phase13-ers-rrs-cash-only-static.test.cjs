const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ers = fs.readFileSync(path.join(root, 'features/phase13/ers-engage-station-ui.html'), 'utf8');
const combined = fs.readFileSync(path.join(root, 'features/phase13/combined-ers-rrs-station-qa-prototype.html'), 'utf8');
const ersSql = fs.readFileSync(path.join(root, 'sql/phase13_ers_channel_payment_draft.sql'), 'utf8');
const rrsSql = fs.readFileSync(path.join(root, 'sql/phase13_rrs_cash_only_payment_draft.sql'), 'utf8');
const req = fs.readFileSync(path.join(root, 'qa/phase13-ers-rrs-combined-live-station-requirement.md'), 'utf8');
const assert = require('node:assert/strict');

assert.match(ers, /Cash Only/);
assert.match(ers, /online, UPI, and QR payment options are disabled/i);
assert.doesNotMatch(ers, /data-pay=["']UPI["']/i);
assert.match(combined, /ERS Registered and RRS Guest Bike rides are <strong>Cash Only<\/strong>/);
assert.match(ersSql, /payment_method = 'cash'/i);
assert.match(rrsSql, /payment_method = 'cash'/i);
assert.match(req, /ERS registered-driver rides: cash only/i);
assert.match(req, /RRS guest-bike rides\/bookings: cash only/i);
console.log('ERS/RRS cash-only static policy checks: PASS');
