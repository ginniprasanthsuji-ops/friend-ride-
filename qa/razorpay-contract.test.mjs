import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const edge = await readFile(new URL('../supabase/functions/fr-razorpay-checkout/index.ts', import.meta.url), 'utf8');

test('FRONTEND: Razorpay Standard Checkout calls order and verify endpoints', () => {
  for (const marker of ['checkout.js', "action:'create-order'", "action:'verify-payment'", 'razorpay_order_id', "payment.failed", 'ondismiss']) assert.ok(app.includes(marker), 'missing frontend marker: '+marker);
  assert.ok(!app.includes('RAZORPAY_KEY_SECRET') && !app.includes('Jf0mTU8wLBJJ84GuOkkMug4t'), 'secret must not be in frontend source');
});

test('BACKEND: order creation authenticates and restricts approved plans', () => {
  for (const marker of ['/auth/v1/user', 'api.razorpay.com/v1/orders', 'amount < 100', 'Basic: 299', 'Growth: 599', 'Premium: 999', '401']) assert.ok(edge.includes(marker), 'missing backend marker: '+marker);
});

test('BACKEND: signature, order ownership, and captured payment are verified', () => {
  for (const marker of ['HMAC', 'orderId + "|" + paymentId', 'constantTimeEqual', 'orders/" + encodeURIComponent(orderId)', 'order?.notes?.user_id !== user.id', 'payments/" + encodeURIComponent(paymentId)', 'payment?.status !== "captured"', 'payment?.order_id !== orderId', 'payment?.amount !== order.amount', '400']) assert.ok(edge.includes(marker), 'missing verification marker: '+marker);
});
