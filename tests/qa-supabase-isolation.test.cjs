const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fcm = fs.readFileSync(path.join(root, 'fcm-web-push.js'), 'utf8');
const fixture = fs.readFileSync(path.join(root, '..', 'qa', 'fixtures.cjs'), 'utf8');

test('main application test mode uses injected QA or offline Supabase config', () => {
  assert.match(indexHtml, /FR_TEST_MODE=window\.__FR_TEST_MODE__===true/);
  assert.match(indexHtml, /FR_TEST_SUPABASE_CONFIG\.url\|\|'https:\/\/qa-offline\.invalid'/);
  assert.match(indexHtml, /FR_TEST_SUPABASE_CONFIG\.anonKey\|\|'offline-test-publishable-key'/);
  assert.match(indexHtml, /FR_TEST_MODE&&SUPABASE_URL===FR_PRODUCTION_SUPABASE_URL/);
});

test('dormant FCM helper also honors test config and cannot select production in test mode', () => {
  assert.match(fcm, /FR_TEST_MODE=window\.__FR_TEST_MODE__===true/);
  assert.match(fcm, /FR_TEST_SUPABASE_CONFIG\.url\|\|'https:\/\/qa-offline\.invalid'/);
  assert.match(fcm, /FR_TEST_SUPABASE_CONFIG\.anonKey\|\|'offline-test-publishable-key'/);
  assert.match(fcm, /FR_TEST_MODE&&SUPABASE_URL===FR_PRODUCTION_SUPABASE_URL/);
});

test('shared fixture blocks production Supabase and only permits QA explicitly', () => {
  assert.match(fixture, /QA_API_ENABLED && QA_ORIGIN/);
  assert.match(fixture, /url\.origin !== PRODUCTION_SUPABASE_URL/);
  assert.match(fixture, /return route\.abort\(\)/);
});
