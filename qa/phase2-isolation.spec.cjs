const { test, expect, qaConfig, qaApiEnabled } = require('./fixtures.cjs');

const PRODUCTION_SUPABASE_URL = 'https://fglyplxcczdjtfwobtzh.supabase.co';
const OFFLINE_SUPABASE_URL = 'https://qa-offline.invalid';

test('Playwright injects an isolated QA or offline Supabase target', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const state = await page.evaluate(() => ({
    testMode: window.__FR_TEST_MODE__ === true,
    target: window.__FR_TEST_SUPABASE_URL__ || null
  }));
  expect(state.testMode).toBe(true);
  expect(state.target).not.toBe(PRODUCTION_SUPABASE_URL);
  if (qaConfig) expect(state.target).toBe(qaConfig.url);
  else expect(state.target).toBe(OFFLINE_SUPABASE_URL);
  expect(qaApiEnabled && !qaConfig).toBe(false);
});

test('test-only client target never uses the production Supabase URL', async ({ page }) => {
  await page.goto('./', { waitUntil: 'domcontentloaded' });
  const target = await page.evaluate(() => window.__FR_TEST_SUPABASE_URL__);
  expect(target).not.toBe(PRODUCTION_SUPABASE_URL);
  expect(new URL(target).hostname).not.toBe('fglyplxcczdjtfwobtzh.supabase.co');
});
