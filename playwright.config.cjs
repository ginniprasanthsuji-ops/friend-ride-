const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './qa',
  timeout: 45000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: { baseURL: process.env.FRIEND_RIDE_BASE_URL || 'https://ginniprasanthsuji-ops.github.io/friend-ride-/', headless: true, trace: 'retain-on-failure' }
});
