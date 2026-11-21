import { test, expect } from '@playwright/test';

test('Learn tab is injected and opens Lakshya Setu', async ({ page }) => {
  const errors=[];
  page.on('pageerror', e=>errors.push(e.message));
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  const learnNav=page.locator('.premium-bottom [data-page="learn"]');
  await expect(learnNav).toBeVisible();
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
  await page.waitForTimeout(1500);
  await page.locator('.premium-bottom [data-page="learn"]').click();
  await expect(page.locator('#frLearnStudentPanel button')).toHaveCount(2);
  await page.getByRole('button', {name:/Teacher \/ Teach/}).click();
  await expect(page.locator('#frLearnTeacherPanel select')).toBeVisible();
  await expect(page.locator('#frLearnTeacherPanel')).toContainText('Teacher Registration');
});
