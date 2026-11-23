const { defineConfig } = require('@playwright/test');

const baseURL = process.env.FRIEND_RIDE_BASE_URL;
if (!baseURL) {
  throw new Error('Safety guard: set FRIEND_RIDE_BASE_URL to an explicit local test server URL. Hosted/live fallback is disabled.');
}
let parsedBaseURL;
try {
  parsedBaseURL = new URL(baseURL);
} catch {
  throw new Error('Safety guard: FRIEND_RIDE_BASE_URL must be a valid URL.');
}
const allowedHosts = new Set(['localhost', '127.0.0.1', '::1']);
if (!allowedHosts.has(parsedBaseURL.hostname) || !['http:', 'https:'].includes(parsedBaseURL.protocol)) {
  throw new Error('Safety guard: Playwright is restricted to localhost/loopback. External and hosted targets are denied.');
}

module.exports = defineConfig({
  testDir: './qa',
  timeout: 45000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: parsedBaseURL.href, headless: true, trace: 'retain-on-failure' }
});
