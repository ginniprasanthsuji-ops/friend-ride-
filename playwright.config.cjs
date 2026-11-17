const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './qa',
  timeout: 45000,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.FRIEND_RIDE_BASE_URL || 'http://127.0.0.1:4173',
    headless: true,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
