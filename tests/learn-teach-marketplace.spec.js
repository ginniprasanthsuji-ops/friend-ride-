const { test, expect } = require('@playwright/test');

test.describe('Learn & Teach marketplace UI smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
  });

  test('Learning Home tile opens VidyaSetu role landing', async ({ page }) => {
    await page.locator('.fr-native-home [data-fr-native-route="learnTeach"]').click();
    await expect(page.locator('#learnTeach')).toHaveClass(/active/);
    await expect(page.locator('#learnTeachRoot .fr-v11-learning-grid')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#learnTeachRoot')).toContainText('Teacher');
    await expect(page.locator('#learnTeachRoot')).toContainText('Student');
    await expect(page.locator('#learnTeachRoot')).toContainText('Coaching Center');
  });

  test('Teacher role opens dashboard and returns to role selector', async ({ page }) => {
    await page.locator('.fr-native-home [data-fr-native-route="learnTeach"]').click();
    await expect(page.locator('#learnTeachRoot .fr-v11-learning-grid')).toBeVisible({ timeout: 5000 });
    await page.locator('#learnTeachRoot [data-learning-role="teacher"]').click();
    await expect(page.locator('#learnTeachRoot')).toContainText('Teacher Dashboard');
    await page.locator('#learnTeachRoot button').filter({ hasText: 'విద్యా సేతు Roles' }).click();
    await expect(page.locator('#learnTeachRoot .fr-v11-learning-grid')).toBeVisible();
  });
});
