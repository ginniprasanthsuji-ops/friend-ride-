const { test: base, expect } = require('@playwright/test');

const localOrigin = new URL(process.env.FRIEND_RIDE_BASE_URL).origin;

/** Tier-A tests allow only the configured local static-server origin. */
const test = base.extend({
  page: async ({ page }, use) => {
    const blockedOrigins = [];
    // Deterministic Supabase stub: tests never contact the live backend.
    await page.addInitScript(() => {
      const chain = () => {
        const q = {
          select(){ return q; }, insert(){ return q; }, update(){ return q; }, upsert(){ return q; },
          delete(){ return q; }, eq(){ return q; }, neq(){ return q; }, in(){ return q; },
          order(){ return q; }, limit(){ return q; }, maybeSingle(){ return Promise.resolve({data:null,error:null}); },
          single(){ return Promise.resolve({data:null,error:null}); },
          then(resolve,reject){ return Promise.resolve({data:[],error:null}).then(resolve,reject); }
        };
        return q;
      };
      window.supabase = {
        createClient(){
          return {
            auth: {
              getSession: async () => ({data:{session:null},error:null}),
              signOut: async () => ({error:null}),
              onAuthStateChange: () => ({data:{subscription:{unsubscribe(){}}}})
            },
            from: () => chain(),
            rpc: async () => ({data:null,error:null}),
            storage: {from: () => ({
              upload: async () => ({data:null,error:null}),
              remove: async () => ({data:null,error:null}),
              createSignedUrl: async () => ({data:null,error:null}),
              getPublicUrl: () => ({data:{publicUrl:''}})
            })}
          };
        }
      };
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
