const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const sql = readFileSync(join(__dirname, '..', 'qa/phase13-core-ride-payment-qr-backend-draft.sql'), 'utf8');

test('payment QR bucket is private, size-limited, and MIME-restricted', () => {
  assert.match(sql, /provider-payment-qr[^;]+false,2097152,array\['image\/png','image\/jpeg','image\/webp'\]/i);
});

test('payment records have RLS and participant-only read access with no client writes', () => {
  assert.match(sql, /alter table public\.fr_ride_payments enable row level security/i);
  assert.match(sql, /using \(customer_id=auth\.uid\(\) or driver_id=auth\.uid\(\)\)/);
  assert.match(sql, /revoke all privileges on table public\.fr_ride_payments from anon,authenticated/i);
  assert.match(sql, /grant select on table public\.fr_ride_payments to authenticated/i);
});

test('QR storage policies use valid SQL whitespace and restrict approved drivers to their own folder', () => {
  assert.doesNotMatch(sql, /\\\\n\s+and exists/);
  assert.match(sql, /bucket_id='provider-payment-qr'\s+and \(storage\.foldername\(name\)\)\[1\]=auth\.uid\(\)::text\s+and exists/i);
  assert.match(sql, /p\.role='driver' and p\.driver_approval_status='approved'/);
});

test('driver QR save RPC validates approval, folder ownership, and uploaded object', () => {
  assert.match(sql, /fr_driver_save_payment_qr\(p_qr_path text\)/);
  assert.match(sql, /split_part\(p_qr_path,'\/',1\)<>auth\.uid\(\)::text/);
  assert.match(sql, /storage\.objects o where o\.bucket_id='provider-payment-qr' and o\.name=p_qr_path/);
});

test('customer payment creation is limited to own completed ride and approved assigned driver QR', () => {
  assert.match(sql, /r\.customer_id=auth\.uid\(\) and r\.status='completed'/);
  assert.match(sql, /p\.role='driver' and p\.driver_approval_status='approved'/);
  assert.match(sql, /pg_advisory_xact_lock/);
});

test('UPI transaction submission validates customer, UTR format, and active session', () => {
  assert.match(sql, /p\.role='customer'/);
  assert.match(sql, /v_tx !~ '\^[A-Za-z0-9._\/-]{8,40}\
  assert.match(sql, /v_pay\.status<>'pending' or v_pay\.expires_at<=now\(\)/);
});

test('driver payment confirmation requires assigned approved driver and submitted transaction', () => {
  assert.match(sql, /r\.driver_id=auth\.uid\(\) and r\.status='completed'/);
  assert.match(sql, /v_pay\.status<>'awaiting_driver_confirmation' or v_pay\.transaction_id is null/);
  assert.match(sql, /set status='success',confirmed_at=now\(\)/);
});

test('payment state RPC authorizes only ride participants and expires pending QR sessions', () => {
  assert.match(sql, /v_ride\.customer_id<>auth\.uid\(\) and v_ride\.driver_id<>auth\.uid\(\)/);
  assert.match(sql, /v_pay\.status='pending' and v_pay\.expires_at<=now\(\)/);
  assert.match(sql, /set status='expired'/);
});

test('UTR uniqueness is case-insensitive and all six RPCs are authenticated-only', () => {
  assert.match(sql, /unique index[^;]+lower\(transaction_id\)/i);
  for (const fn of ['fr_driver_save_payment_qr','fr_customer_create_ride_payment','fr_get_ride_payment_state','fr_customer_submit_ride_transaction','fr_driver_confirm_ride_payment','get_ride_payment_details_v1']) {
    assert.match(sql, new RegExp('grant execute on function public\\.' + fn + '\\('));
    assert.match(sql, new RegExp('revoke all on function public\\.' + fn + '\\('));
  }
});

test('draft explicitly documents manual UPI confirmation and not provider settlement', () => {
  assert.match(sql, /Manual-UPI QR payment backend draft/i);
  assert.match(sql, /NOT Razorpay\/provider settlement/i);
  assert.match(sql, /No SQL has been applied/i);
});
/);
  assert.match(sql, /v_pay\.status<>'pending' or v_pay\.expires_at<=now\(\)/);
});

test('driver payment confirmation requires assigned approved driver and submitted transaction', () => {
  assert.match(sql, /r\.driver_id=auth\.uid\(\) and r\.status='completed'/);
  assert.match(sql, /v_pay\.status<>'awaiting_driver_confirmation' or v_pay\.transaction_id is null/);
  assert.match(sql, /set status='success',confirmed_at=now\(\)/);
});

test('payment state RPC authorizes only ride participants and expires pending QR sessions', () => {
  assert.match(sql, /v_ride\.customer_id<>auth\.uid\(\) and v_ride\.driver_id<>auth\.uid\(\)/);
  assert.match(sql, /v_pay\.status='pending' and v_pay\.expires_at<=now\(\)/);
  assert.match(sql, /set status='expired'/);
});

test('UTR uniqueness is case-insensitive and all six RPCs are authenticated-only', () => {
  assert.match(sql, /unique index[^;]+lower\(transaction_id\)/i);
  for (const fn of ['fr_driver_save_payment_qr','fr_customer_create_ride_payment','fr_get_ride_payment_state','fr_customer_submit_ride_transaction','fr_driver_confirm_ride_payment','get_ride_payment_details_v1']) {
    assert.match(sql, new RegExp('grant execute on function public\\.' + fn + '\\('));
    assert.match(sql, new RegExp('revoke all on function public\\.' + fn + '\\('));
  }
});

test('draft explicitly documents manual UPI confirmation and not provider settlement', () => {
  assert.match(sql, /Manual-UPI QR payment backend draft/i);
  assert.match(sql, /NOT Razorpay\/provider settlement/i);
  assert.match(sql, /No SQL has been applied/i);
});
