const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('Sms-otp Edge Function accepts APITXT success without request ID and reads nested IDs', () => {
  const source = fs.readFileSync(path.join(__dirname, '../supabase/functions/Sms-otp/index.ts'), 'utf8');
  expect(source).toContain('nestedData.request_id');
  expect(source).toContain('nestedData.requestId');
  expect(source).toContain('nestedData.id');
  expect(source).toContain('OTP accepted based on provider success status');
  expect(source).not.toContain('APITXT success responseలో SMS request ID లేదు');
});
