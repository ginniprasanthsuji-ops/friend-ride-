import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const edge = await readFile(new URL('../supabase/functions/fr-razorpay-checkout/index.ts', import.meta.url), 'utf8');

test('FRONTEND: Razorpay Standard Checkout calls order and verify endpoints', () => {
  assert.match(app, /checkout\\.js/);
  assert.match(app, /action:'create-order'/);
  assert.match(app, /action:'verify-payment'/);
  assert.match(app, /razorpay_order_id/);
  assert.match(app, /payment\\.failed/);
  assert.match(app, /ondismiss/);
  assert.doesNotMatch(app, /RAZORPAY_KEY_SECRET|Jf0mTU8wLBJJ84GuOkkMug4t/);
});

test('BACKEND: order creation authenticates and restricts approved plans', () => {
  assert.match(edge, /\\/auth\\/v1\\/user/);
  assert.match(edge, /api\\.razorpay\\.com\\/v1\\/orders/);
  assert.match(edge, /amount < 100/);
  assert.match(edge, /Basic: 299/);
  assert.match(edge, /Growth: 599/);
  assert.match(edge, /Premium: 999/);
  assert.match(edge, /401/);
});

test('BACKEND: signature, order ownership, and captured payment are verified', () => {
  assert.match(edge, /HMAC/);
  assert.match(edge, /orderId \\+ "\\|" \\+ paymentId/);
  assert.match(edge, /constantTimeEqual/);
  assert.match(edge, /orders\\/.*encodeURIComponent/);
  assert.match(edge, /notes\\?\\.user_id|notes\\.user_id/);
  assert.match(edge, /payments\\/.*encodeURIComponent/);
  assert.match(edge, /status !== "captured"/);
  assert.match(edge, /payment\\?\\.order_id/);
  assert.match(edge, /payment\\?\\.amount !== order\\.amount/);
  assert.match(edge, /400/);
});
