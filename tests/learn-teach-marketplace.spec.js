const { test, expect } = require('@playwright/test');

test.describe('Learn & Teach marketplace UI smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Learn tab is present and opens marketplace landing screen', async ({ page }) => {
    await expect(page.locator('[data-page="learnTeach"]')).toHaveCount(1);
    await page.locator('[data-page="learnTeach"]').click();
    await expect(page.locator('#learnTeach')).toHaveClass(/active/);
    await expect(page.locator('#learnTeachRoot')).toContainText('Learn • Teach • Grow');
    await expect(page.locator('#learnTeachRoot')).toContainText('Student (Learn)');
    await expect(page.locator('#learnTeachRoot')).toContainText('Teacher (Teach)');
    await expect(page.locator('#learnTeachRoot')).toContainText('Coaching Center');
  });

  test('education category cards are rendered', async ({ page }) => {
    await page.locator('[data-page="learnTeach"]').click();
    for (const label of ['School Tuition','Competitive Exams','Skill Courses','Finance & Trading','SAP Courses','Tally & GST','Spoken English','Computer Skills']) {
      await expect(page.locator('#learnTeachRoot')).toContainText(label);
    }
  });
});
