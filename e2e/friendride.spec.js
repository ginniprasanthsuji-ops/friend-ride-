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


test.describe('FRIEND RIDE navigation click diagnostics', () => {
  test('bottom navigation pages and menu drawer respond to clicks', async ({ page }) => {
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('console', msg=>{ if(msg.type()==='error') errors.push('console: '+msg.text()); });
    await page.goto('/');
    await expect(page.locator('#roleLauncher')).toBeVisible();
    await page.locator('#roleLauncher button.fr-role-card.customer').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    // Close the auth gate to exercise the real bottom navigation controls.
    await page.locator('#authModal button.close').click();
    const tabIds=['home','shops','food','marketCart','explore','orders'];
    for(const id of tabIds){
      const button=page.locator('.bottom button[data-page="'+id+'"]');
      const target=page.locator('#'+id+'.page');
      await expect(button).toHaveCount(1);
      await expect(target).toHaveCount(1);
      await button.click();
      if(id==='orders'){
        // Orders are login-gated; the click should open authentication, not a missing page.
        await expect(page.locator('#authModal')).toHaveClass(/show/);
        await page.locator('#authModal button.close').click();
      }else{
        await expect(target).toHaveClass(/active/);
      }
    }
    const menu=page.locator('.bottom button[data-page="menu"]');
    await expect(menu).toHaveCount(1);
    await menu.click();
    await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
    await page.locator('#drawerBackdrop button.close').click();
    await expect(page.locator('#drawerBackdrop')).not.toHaveClass(/show/);
    expect(errors, 'uncaught errors during click/navigation diagnostics').toEqual([]);
  });

  test('role launcher and role-specific auth controls respond to clicks', async ({ page }) => {
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    await page.locator('#roleLauncher button.fr-role-card.driver').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('[data-role="driver"]')).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });
});
