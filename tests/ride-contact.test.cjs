const test = require('node:test');
const assert = require('node:assert/strict');
require('../assets/ride-contact.js');
const api = globalThis.FRRideContact;

test('maps driver vehicle_number to vehicle_registration', () => {
  const row = api.normalize({ vehicle_type: 'Bike', vehicle_company: 'Honda', vehicle_model: 'Shine', vehicle_number: 'AP30AB1234' });
  assert.equal(row.vehicle_registration, 'AP30AB1234');
  assert.equal(row.vehicle_company, 'Honda');
});
test('normalizes phone aliases and display names', () => {
  const row = api.normalize({ full_name: 'Driver One', phone_e164: '+919876543210' });
  assert.equal(row.full_name, 'Driver One');
  assert.equal(row.phone, '+919876543210');
});
test('normalizes private driver and customer photo paths', () => {
  assert.equal(api.profilePhoto({ profile_photo_path: 'u1/profile.jpg' }, 'driver'), 'u1/profile.jpg');
  assert.equal(api.profilePhoto({ customer_profile_photo_path: 'u2/customer.jpg' }, 'customer'), 'u2/customer.jpg');
});
test('only confirmed rides expose contact details', () => {
  for (const status of ['accepted', 'confirmed', 'ongoing', 'in_progress', 'started']) assert.equal(api.confirmedStatus(status), true);
  for (const status of ['requested', 'counter_offered', 'completed', 'cancelled', 'rejected']) assert.equal(api.confirmedStatus(status), false);
});
