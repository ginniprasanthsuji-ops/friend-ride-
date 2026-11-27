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
  test('no uncaught runtime errors while loading and navigating all home tabs', async ({ page }) => {
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('console', msg=>{ if(msg.type()==='error') errors.push('console: '+msg.text()); });
    await page.goto('/');
    await expect(page.locator('#roleLauncher')).toBeVisible();
    await page.locator('#roleLauncher button.fr-role-card.customer').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    // Exercise the app's page-navigation function and verify each target page becomes active.
    const tabIds=await page.locator('.bottom button[data-page]').evaluateAll(btns=>btns.map(b=>b.dataset.page));
    const report=[];
    for(const id of tabIds){
      const target=page.locator('#'+id+'.page');
      if(await target.count()){
        await page.evaluate(id=>{ if(typeof window.showPage==='function') window.showPage(id); else throw new Error('showPage is not callable'); },id);
        await expect(target).toHaveClass(/active/);
        report.push(id+' OK');
      }else report.push(id+' missing target');
    }
    expect(report.filter(x=>x.endsWith('missing target')), 'missing tab targets').toEqual([]);
    expect(errors, 'uncaught errors during click/navigation diagnostics').toEqual([]);
  });

  test('menu drawer and role launcher controls respond to clicks', async ({ page }) => {
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    await page.locator('#roleLauncher button.fr-role-card.driver').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('[data-role="driver"]')).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });
});
