// Shared Playwright fixture: test mode defaults to offline and never hits production Supabase.
const { test: baseTest, expect } = require('@playwright/test');

const PRODUCTION_SUPABASE_URL = 'https://fglyplxcczdjtfwobtzh.supabase.co';
const QA_URL = (process.env.FRIEND_RIDE_QA_SUPABASE_URL || '').trim();
const QA_KEY = (process.env.FRIEND_RIDE_QA_ANON_KEY || '').trim();
const QA_API_ENABLED = process.env.FRIEND_RIDE_QA_E2E_ENABLED === 'true';

if (!!QA_URL !== !!QA_KEY) {
  throw new Error('Set both FRIEND_RIDE_QA_SUPABASE_URL and FRIEND_RIDE_QA_ANON_KEY, or leave both unset.');
}
let QA_ORIGIN = null;
if (QA_URL) {
  const parsed = new URL(QA_URL);
  if (parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/i.test(parsed.hostname) || parsed.origin === PRODUCTION_SUPABASE_URL) {
    throw new Error('QA Supabase URL must be a non-production HTTPS Supabase project URL.');
  }
  QA_ORIGIN = parsed.origin;
}

const qaConfig = QA_URL ? { url: QA_URL, anonKey: QA_KEY } : null;

const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(({ config }) => {
      window.__FR_TEST_MODE__ = true;
      if (config) window.__FR_TEST_SUPABASE_CONFIG__ = config;
    }, { config: qaConfig });

    // In offline mode block every Supabase host; in explicit QA E2E mode only
    // the configured QA project is allowed. Production is never allowed.
    await page.route('https://**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname.endsWith('.supabase.co')) {
        if (QA_API_ENABLED && QA_ORIGIN && url.origin === QA_ORIGIN && url.origin !== PRODUCTION_SUPABASE_URL) {
          return route.continue();
        }
        return route.abort();
      }
      if (url.hostname.endsWith('.invalid')) return route.abort();
      return route.continue();
    });
    await use(page);
  }
});

module.exports = { test, expect, qaConfig, qaApiEnabled: QA_API_ENABLED };
