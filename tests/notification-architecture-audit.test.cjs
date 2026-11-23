const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const webPushSw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const fcmSw = fs.readFileSync(path.join(root, 'firebase-messaging-sw.js'), 'utf8');

test('Phase 2 notification audit: web opt-in currently writes Web Push subscription records', () => {
  const start = html.indexOf('async function frEnableDeviceAlerts(){');
  const end = html.indexOf('(function frRideInstallHooks(){', start);
  assert.ok(start >= 0 && end > start, 'opt-in function and following integration hook must be located');
  const optIn = html.slice(start, end);
  assert.match(optIn, /fr_push_subscriptions/);
  assert.match(optIn, /\.upsert\(row/);
  assert.match(optIn, /pushManager\.subscribe/);
  assert.doesNotMatch(optIn, /fr-notification-register-token|getToken\s*\(/);
});

test('Phase 2 notification audit: Web Push and FCM service workers are separate paths', () => {
  assert.match(webPushSw, /addEventListener\(['"]push['"]/);
  assert.match(fcmSw, /firebase-messaging-compat\.js/);
  assert.match(fcmSw, /messaging\.onBackgroundMessage/);
});
