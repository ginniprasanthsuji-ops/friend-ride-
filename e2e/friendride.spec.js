const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE launcher smoke / regression', () => {
  test('home page loads and launcher role cards are present', async ({ page }) => {
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto('/');
    await expect(page).toHaveTitle(/FRIEND RIDE/i);
    await expect(page.locator('#roleLauncher')).toBeVisible();
    for (const role of ['customer','driver','partner','admin']) {
      await expect(page.locator(`#roleLauncher button.fr-role-card.${role}`)).toBeVisible();
    }
    expect(errors, 'runtime page errors').toEqual([]);
  });

  for (const role of ['customer','driver','partner','admin']) {
    test(role+' role selection opens role-specific auth gate', async ({ page }) => {
      await page.goto('/');
      await page.locator(`#roleLauncher button.fr-role-card.${role}`).click();
      await expect(page.locator('#roleLauncher')).toHaveClass(/hide/);
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await expect(page.locator('#authModal')).toHaveClass(/fr-role-locked/);
      await expect(page.locator('[data-role="'+role+'"]')).toHaveClass(/active/);
    });
  }

  test('QA page loads and test cards/status controls render', async ({ page }) => {
    await page.goto('/test.html');
    await expect(page.getByRole('heading', {name:/YF Test 1 to 15/i})).toBeVisible();
    await expect(page.locator('#run')).toBeVisible();
    await expect(page.locator('#phases .test')).toHaveCount(29);
  });
});
