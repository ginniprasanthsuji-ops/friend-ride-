const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const source = readFileSync(join(root, 'index.html'), 'utf8');
const draft = readFileSync(join(root, 'qa/phase13-ers-rrs-role-hardening-draft.sql'), 'utf8');
const audit = readFileSync(join(root, 'qa/phase13-readonly-security-audit-assertions.sql'), 'utf8');

test('ERS/RRS is not yet wired into the inspected app source', () => {
  assert.doesNotMatch(source, /fr_road_ride_(?:create|book|confirm_booking|get_participant_contact)/);
});

test('ride creation draft permits only approved Driver or Customer with guest profile', () => {
  assert.match(draft, /p\.role='driver' and p\.driver_approval_status='approved'/);
  assert.match(draft, /p\.role='customer' and exists[\s\S]+?fr_road_ride_guest_profiles/);
  assert.match(draft, /Approved Driver or Customer guest-driver profile required/);
  assert.match(draft, /Coordinates must be supplied in pairs/);
  assert.match(draft, /Origin coordinates invalid/);
  assert.match(draft, /Destination coordinates invalid/);
});

test('booking RPC requires Customer role and safely reuses cancelled/refunded row under unique constraint', () => {
  assert.match(draft, /p\.role='customer'/);
  assert.match(draft, /v_existing_status not in \('cancelled','refunded'\)/);
  assert.match(draft, /update public\.fr_road_ride_bookings[\s\S]+?status='booking_pending'/);
  assert.match(draft, /UNIQUE\(ride_id,passenger_id\)/i);
});

test('confirmation uses ride-first locking and rechecks eligible owner', () => {
  assert.match(draft, /select \* into v_ride from public\.fr_road_rides r where r\.id=v_ride_id for update[\s\S]+?select \* into v_booking from public\.fr_road_ride_bookings b[\s\S]+?for update/);
  assert.match(draft, /v_ride\.driver_id<>auth\.uid\(\)/);
  assert.match(draft, /v_ride\.departure_at<=now\(\)/);
});

test('contact disclosure is participant-only and driver eligibility is checked', () => {
  assert.match(draft, /b\.passenger_id=v_uid and c\.role='customer'/);
  assert.match(draft, /Ride driver is not eligible for participant contact/);
  assert.match(draft, /v_ride\.driver_id=v_uid/);
  assert.match(draft, /p\.role='driver' and p\.driver_approval_status='approved'/);
  assert.match(draft, /p\.role='customer' and exists[\s\S]+?fr_road_ride_guest_profiles/);
});

test('profile RPCs require the approved Driver or customer guest flow and validate private photo path', () => {
  assert.match(draft, /fr_road_ride_save_driver_profile[\s\S]+?Approved Driver or Customer guest-driver profile required/);
  assert.match(draft, /fr_road_ride_save_guest_driver_profile[\s\S]+?p\.role='customer'/);
  assert.match(draft, /storage\.foldername\(p_driver_photo_path\)\)\[1\]<>v_uid::text/);
});

test('RRS direct client writes are revoked and guest profile writes use the validated definer RPC', () => {
  assert.match(draft, /revoke all privileges on table public\.fr_road_rides,public\.fr_road_ride_bookings,public\.fr_road_ride_events from anon,authenticated/);
  assert.match(draft, /revoke all privileges on table public\.fr_road_ride_guest_profiles from anon,authenticated/);
  assert.match(draft, /drop policy if exists rr_guest_profile_insert_own/);
  assert.match(draft, /drop policy if exists rr_guest_profile_update_own/);
  assert.match(draft, /fr_road_ride_save_guest_driver_profile[\s\S]+?security definer/);
  assert.match(draft, /Uploaded driver photo not found/);
  assert.match(draft, /fr_road_ride_is_driver\(uuid\)[\s\S]+?grant execute on function public\.fr_road_ride_is_driver\(uuid\) to authenticated/);
});

test('RPC execution is revoked from public/anon and granted to authenticated only', () => {
  for (const name of ['fr_road_ride_create','fr_road_ride_book','fr_road_ride_confirm_booking','fr_road_ride_get_participant_contact','fr_road_ride_save_driver_profile','fr_road_ride_save_guest_driver_profile','fr_road_ride_is_driver','fr_road_ride_is_passenger']) {
    assert.match(draft, new RegExp('revoke all on function public\\.' + name + '\\('));
    assert.match(draft, new RegExp('grant execute on function public\\.' + name + '\\('));
  }
});

test('read-only audit checks new ERS/RRS role and rebooking gaps without write statements', () => {
  for (const key of ['ers_rrs_create_role_guard','ers_rrs_book_customer_guard','ers_rrs_confirm_eligible_owner_guard','ers_rrs_guest_profile_customer_guard','ers_rrs_contact_role_and_driver_guard','ers_rrs_rebooking_cancelled_refunded_reuse']) {
    assert.match(audit, new RegExp(key));
  }
  const executable = audit.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(executable, /^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|truncate|commit|begin)\s/im);
});

test('draft is not an applied migration', () => {
  assert.match(draft, /DRAFT ONLY/);
  assert.match(draft, /begin;[\s\S]+commit;/i);
});
