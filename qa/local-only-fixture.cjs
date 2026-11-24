const { test: base, expect } = require('@playwright/test');

const localOrigin = new URL(process.env.FRIEND_RIDE_BASE_URL).origin;

/** Tier-A tests allow only the configured local static-server origin. */
const test = base.extend({
  page: async ({ page }, use) => {
    const blockedOrigins = [];
    await page.addInitScript(() => {
      // Minimal local-only Supabase SDK stub so inline app initialization can run without external network.
      if (!window.supabase) {
        window.supabase = {
          createClient: () => ({
            auth: { signOut: async () => ({}) },
            from: () => ({ select: () => ({ limit: async () => ({ data: [], error: null }) }) }),
            rpc: async () => ({ data: null, error: null })
          })
        };
      }
    });
    await page.route('**/*', async route => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === localOrigin) return route.continue();
      blockedOrigins.push(requestUrl.origin);
      return route.abort('blockedbyclient');
    });
    page.__frBlockedOrigins = blockedOrigins;
    await use(page);
  }
});

module.exports = { test, expect };
