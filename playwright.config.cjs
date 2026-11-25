const { defineConfig } = require('@playwright/test');
const baseURL = process.env.FRIEND_RIDE_BASE_URL;
if (!baseURL) {
  throw new Error('FRIEND_RIDE_BASE_URL must point to a dedicated QA/local environment. Refusing to default to production.');
}
const parsedBase = new URL(baseURL);
const productionHosts = new Set(['friendride.in', 'www.friendride.in']);
if (productionHosts.has(parsedBase.hostname) || parsedBase.hostname.endsWith('.github.io')) {
  throw new Error('Production-host URL is not allowed for Phase 13 QA. Set FRIEND_RIDE_BASE_URL to a dedicated QA/local URL.');
}
if (parsedBase.protocol !== 'https:' && parsedBase.hostname !== 'localhost' && parsedBase.hostname !== '127.0.0.1') {
  throw new Error('QA base URL must use HTTPS (or localhost for local QA).');
}
module.exports = defineConfig({
  testDir: './qa',
  timeout: 45000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL, headless: true, trace: 'retain-on-failure' }
});
