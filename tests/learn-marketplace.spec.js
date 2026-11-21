import { test, expect } from '@playwright/test';

test('Learn tab is injected and opens Lakshya Setu', async ({ page }) => {
  const errors=[]; const consoleErrors=[]; const failedRequests=[];
  page.on('pageerror', e=>errors.push(e.message));
  page.on('console', m=>{if(m.type()==='error')consoleErrors.push(m.text());});
  page.on('requestfailed', r=>failedRequests.push(r.url()+': '+r.failure()?.errorText));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  console.log('QA DIAGNOSTICS',JSON.stringify({learnScript:await page.locator('script[src*="learn-teach.js"]').count(),learnSection:await page.locator('#learn').count(),navButtons:await page.locator('.premium-bottom button').evaluateAll(bs=>bs.map(b=>b.dataset.page)),pageErrors:errors,consoleErrors,failedRequests}));
  const learnNav=page.locator('.premium-bottom [data-page="learn"]');
  await expect(learnNav).toBeVisible({timeout:10000});
  await learnNav.click();
  await expect(page.locator('#learn')).toBeVisible();
  await expect(page.locator('#learn')).toContainText('LAKSHYA SETU');
  await expect(page.locator('#frLearnStudentPanel')).toBeVisible();
  await page.getByRole('button', {name:/Teacher \/ Teach/}).click();
  await expect(page.locator('#frLearnTeacherPanel')).toBeVisible();
  expect(errors, 'Unexpected page JavaScript errors').toEqual([]);
});

test('Student and teacher registration controls exist', async ({ page }) => {
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('.premium-bottom [data-page="learn"]')).toBeVisible({timeout:10000});
  await page.locator('.premium-bottom [data-page="learn"]').click();
  await expect(page.locator('#frLearnStudentPanel button')).toHaveCount(2);
  await page.getByRole('button', {name:/Teacher \/ Teach/}).click();
  await expect(page.locator('#frLearnTeacherPanel select').first()).toBeVisible();
  await expect(page.locator('#frLearnTeacherPanel select')).toHaveCount(5);
  await expect(page.locator('#frLearnTeacherPanel')).toContainText('Teacher Registration');
});


test('Existing FRIEND RIDE page navigation smoke regression', async ({ page }) => {
  await page.goto('/', {waitUntil:'domcontentloaded'});
  const pages=['home','shops','food','marketCart','explore','orders'];
  for (const id of pages) {
    await page.evaluate(id => window.showPage(id), id);
    await expect(page.locator('#'+id)).toHaveClass(/active/);
    await expect(page.locator('#'+id)).toBeVisible();
  }
  await page.locator('.premium-bottom [data-page="menu"]').click();
  await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
});
