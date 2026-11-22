const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './qa',
  testMatch: '**/tasko-laundry-main-regression.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-qa', open: 'never' }]],
  outputDir: 'test-results-qa',
  use: {
    baseURL: process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173/',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  }
});
