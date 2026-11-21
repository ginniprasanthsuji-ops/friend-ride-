import { test, expect } from '@playwright/test';

const LIVE_URL = process.env.FRIEND_RIDE_LIVE_URL || 'https://friendride.in/';

test('Live production site responds and core FRIEND RIDE shell loads', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  const response=await page.goto(LIVE_URL,{waitUntil:'domcontentloaded',timeout:45000});
  expect(response, 'Live navigation should return a response').toBeTruthy();
  expect(response.status(), 'Live homepage HTTP status').toBeLessThan(400);
  await page.waitForTimeout(2500);
  const body=await page.locator('body').innerText();
  expect(body.length,'Live page should render visible text').toBeGreaterThan(40);
  const appShell=await page.locator('main, #app, .app, .premium-bottom').count();
  expect(appShell,'Expected FRIEND RIDE app shell/nav to render').toBeGreaterThan(0);
  console.log('LIVE SMOKE',JSON.stringify({url:LIVE_URL,status:response.status(),title:await page.title(),appShell,jsErrors:errors,bodyTextSample:body.slice(0,500)}));
  expect(errors,'Live page JavaScript errors').toEqual([]);
});
