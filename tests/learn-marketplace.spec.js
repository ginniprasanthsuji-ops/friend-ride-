import { test, expect } from '@playwright/test';

test('Learn tab is injected and opens Lakshya Setu', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  const learnNav=page.locator('.premium-bottom [data-page="learn"]');
  await expect(learnNav).toBeVisible();
  await learnNav.click();
  await expect(page.locator('#learn')).toBeVisible();
  await expect(page.getByText(/LAKSHYA SETU/)).toBeVisible();
  await expect(page.getByText(/Student Registration|Free Student Registration/)).toBeVisible();
  await expect(page.locator('#frLearnStudentPanel')).toBeVisible();
  await page.locator('button[onclick*="frLearnMode(\\'teacher\\')"]').click();
  await expect(page.locator('#frLearnTeacherPanel')).toBeVisible();
  expect(errors, 'Unexpected page JavaScript errors').toEqual([]);
});

test('Student and teacher registration controls exist', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  await page.locator('.premium-bottom [data-page="learn"]').click();
  await expect(page.locator('#frLearnStudentPanel button')).toHaveCount(2);
  await page.locator('button[onclick*="frLearnMode(\\'teacher\\')"]').click();
  await expect(page.locator('#frLearnTeacherPanel select')).toBeVisible();
  await expect(page.locator('#frLearnTeacherPanel')).toContainText('Teacher Registration');
});
