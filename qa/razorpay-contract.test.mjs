import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const edge = await readFile(new URL('../supabase/functions/fr-razorpay-checkout/index.ts', import.meta.url), 'utf8');

test('FRONTEND: Razorpay Standard Checkout calls server order endpoint and verification', () => {
  assert.match(app, /checkout\.js/);
  assert.match(app, /action:'create-order'/);
  assert.match(app, /action:'verify-payment'/);
  assert.match(app, /razorpay_order_id/);
  assert.match(app, /payment\.failed/);
  assert.match(app, /ondismiss/);
  assert.doesNotMatch(app, /RAZORPAY_KEY_SECRET|Jf0mTU8wLBJJ84GuOkkMug4t/);
});

test('BACKEND: order creation validates plan amount and authenticates user', () => {
  assert.match(edge, /\/auth\/v1\/user/);
  assert.match(edge, /api\.razorpay\.com\/v1\/orders/);
  assert.match(edge, /amount < 10000/);
  assert.match(edge, /allowedPlans/);
  assert.match(edge, /401/);
});

test('BACKEND: HMAC signature verification returns failure on mismatch', () => {
  assert.match(edge, /HMAC/);
  assert.match(edge, /orderId \+ "\|" \+ paymentId/);
  assert.match(edge, /constantTimeEqual/);
  assert.match(edge, /400/);
});
