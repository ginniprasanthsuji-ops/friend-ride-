const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const appSource = readFileSync(join(root, 'index.html'), 'utf8');
const hardeningDraft = readFileSync(join(root, 'qa/phase13-shared-ride-role-and-privilege-hardening-draft.sql'), 'utf8');
const readOnlyAudit = readFileSync(join(root, 'qa/phase13-readonly-security-audit-assertions.sql'), 'utf8');

test('Shared Ride source integration gap is explicitly detected', () => {
  assert.doesNotMatch(appSource, /fr_shared_ride_(?:create|book_seats|confirm_booking|get_booking_contacts)/);
});

test('Shared Ride creation draft requires approved driver role and validates inputs', () => {
  assert.match(hardeningDraft, /p\.role='driver'\s+and\s+p\.driver_approval_status='approved'/);
  assert.match(hardeningDraft, /p_from_label is null or length\(trim\(p_from_label\)\)=0/);
  assert.match(hardeningDraft, /p_departure_at is null or p_departure_at<=now\(\)/);
});

test('seat booking draft requires customer role and preserves seat/fare guards', () => {
  assert.match(hardeningDraft, /p\.role='customer'/);
  assert.match(hardeningDraft, /v_ride\.total_seats-v_ride\.booked_seats<p_seats/);
  assert.match(hardeningDraft, /v_ride\.driver_id=auth\.uid\(\) then raise exception 'Driver cannot book own ride'/);
});

test('booking confirmation draft is restricted to the approved assigned driver', () => {
  assert.match(hardeningDraft, /fr_shared_ride_confirm_booking\(p_booking_id uuid\)/);
  assert.match(hardeningDraft, /v_driver_id<>auth\.uid\(\) then raise exception 'Only the assigned driver can confirm this booking'/);
  assert.match(hardeningDraft, /b\.status='booking_pending'/);
});

test('passenger cancellation draft releases seats only before departure for pending/confirmed booking', () => {
  assert.match(hardeningDraft, /fr_shared_ride_cancel_booking\(p_booking_id uuid\)/);
  assert.match(hardeningDraft, /v_booking\.status not in \('booking_pending','confirmed'\)/);
  assert.match(hardeningDraft, /greatest\(0,booked_seats-v_booking\.seats_booked\)/);
  assert.match(hardeningDraft, /status=case when status='full' then 'live' else status end/);
  assert.match(hardeningDraft, /booking_cancelled/);
});

test('contact draft discloses counterpart contact only for one confirmed active booking', () => {
  assert.match(hardeningDraft, /fr_shared_ride_get_booking_contacts\(p_booking_id uuid\)/);
  assert.match(hardeningDraft, /v_booking\.status not in \('confirmed','boarding','in_progress'\)/);
  assert.match(hardeningDraft, /v_uid=v_driver_id/);
  assert.match(hardeningDraft, /v_uid=v_booking\.passenger_id/);
  assert.match(hardeningDraft, /p\.id=v_booking\.passenger_id and p\.role='customer'/);
  assert.match(hardeningDraft, /p\.id=v_driver_id and p\.role='driver' and p\.driver_approval_status='approved'/);
  assert.match(hardeningDraft, /Assigned driver is not approved/);
  assert.match(hardeningDraft, /where b\.id=p_booking_id for share/);
});

test('client table writes are revoked and RPC execution is authenticated-only', () => {
  assert.match(hardeningDraft, /revoke all privileges on table public\.fr_shared_rides[^;]+from anon,authenticated;/);
  assert.match(hardeningDraft, /grant select on table public\.fr_shared_rides[^;]+to authenticated;/);
  assert.match(hardeningDraft, /revoke truncate, maintain on all tables in schema public from anon,authenticated;/);
  assert.match(hardeningDraft, /revoke all on function public\.fr_shared_ride_get_booking_contacts\(uuid\) from public,anon;/);
  assert.match(hardeningDraft, /grant execute on function public\.fr_shared_ride_get_booking_contacts\(uuid\) to authenticated;/);
  assert.match(hardeningDraft, /grant execute on function public\.fr_shared_ride_cancel_booking\(uuid\) to authenticated;/);
});

test('read-only audit artifact includes role, contact and privilege gap checks and no writes', () => {
  assert.match(readOnlyAudit, /shared_ride_policy_total/);
  assert.match(readOnlyAudit, /shared_ride_client_write_privilege_count/);
  assert.match(readOnlyAudit, /shared_ride_confirmation_contact_rpc_missing/);
  assert.match(readOnlyAudit, /security_definer_missing_fixed_search_path/);
  const executable = readOnlyAudit.replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(executable, /^\s*(?:insert|update|delete|create|alter|drop|grant|revoke|truncate|commit|begin)\s/im);
});
