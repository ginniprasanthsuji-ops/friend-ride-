const { defineConfig } = require('@playwright/test');

const configuredBaseURL = process.env.FRIEND_RIDE_BASE_URL;
if (!configuredBaseURL) {
  throw new Error(
    'FRIEND_RIDE_BASE_URL is required. Set it to an isolated local test server (for example http://127.0.0.1:4173); Playwright must not default to the live site.'
  );
}

let baseURL;
try {
  baseURL = new URL(configuredBaseURL);
} catch {
  throw new Error('FRIEND_RIDE_BASE_URL must be a valid URL.');
}
if (!['localhost', '127.0.0.1', '::1', '[::1]'].includes(baseURL.hostname)) {
  throw new Error(
    `Unsafe Playwright base URL "${configuredBaseURL}". Use localhost/127.0.0.1/::1 only; do not run the suite against production.`
  );
}

module.exports = defineConfig({
  testDir: './qa',
  timeout: 45000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: baseURL.toString(), headless: true, trace: 'retain-on-failure' }
});
