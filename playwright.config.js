import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: { headless: true, baseURL: 'http://127.0.0.1:4173' },
  reporter: ['list','html'],
  webServer: { command: 'npx --yes http-server . -p 4173 -a 127.0.0.1 -c-1', port: 4173, reuseExistingServer: !process.env.CI, timeout: 30000 }
});
