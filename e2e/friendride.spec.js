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


test.describe('Project X2 dashboard menu routing regression', () => {
  test('each dashboard menu target opens its own login gate without Customer Dashboard fallback', async ({ page }) => {
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');
    await page.locator('#roleLauncher button.fr-role-card.customer').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await page.locator('#authModal button.close').click();
    const targets=['customerDashboard','driverDashboard','partnerDashboard','adminDashboard'];
    for(const target of targets){
      await page.locator('.bottom button[data-page="menu"]').click();
      await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
      await page.locator('.drawer button.menu-item').filter({hasText:target.replace('Dashboard',' Dashboard')}).click();
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await expect(page.locator('#'+target+'.page')).not.toHaveClass(/active/);
      await page.locator('#authModal button.close').click();
    }
    expect(errors,'runtime errors while checking role dashboard menu gates').toEqual([]);
  });
});

test.describe('Project X2 Food/Shop and tracking UI regression', () => {
  test('Food, Shop, Cart, and tracking category controls render and respond', async ({ page }) => {
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto('/');
    await page.locator('#roleLauncher button.fr-role-card.customer').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await page.locator('#authModal button.close').click();

    await page.locator('.bottom button[data-page="food"]').click();
    await expect(page.locator('#food.page')).toHaveClass(/active/);
    await expect(page.locator('#restaurantSearch')).toBeVisible();
    await expect(page.locator('#restaurantVisualList')).toBeVisible();

    await page.locator('.bottom button[data-page="shops"]').click();
    await expect(page.locator('#shops.page')).toHaveClass(/active/);
    await expect(page.locator('#shopCategory')).toBeVisible();
    await expect(page.locator('#shopAddress')).toBeVisible();
    await expect(page.locator('#shopSelectedStore')).toBeVisible();

    await page.locator('.bottom button[data-page="marketCart"]').click();
    await expect(page.locator('#marketCart.page')).toHaveClass(/active/);
    await expect(page.locator('#frContinuePaymentBtn')).toBeVisible();
    await expect(page.locator('#marketCartItems')).toBeVisible();

    await page.locator('.bottom button[data-page="orders"]').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await page.locator('#authModal button.close').click();
    await page.locator('.bottom button[data-page="menu"]').click();
    await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
    await page.locator('#drawerBackdrop button.close').click();

    // Open tracking via Orders page action after navigating to orders as a page.
    await page.locator('.bottom button[data-page="orders"]').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await page.locator('#authModal button.close').click();
    // Direct page navigation helper is exercised by the visible tracking action from the Orders screen.
    await page.locator('.bottom button[data-page="menu"]').click();
    await expect(page.locator('#drawerBackdrop')).toHaveClass(/show/);
    await page.locator('.drawer button.menu-item').filter({hasText:'Live Tracking'}).click();
    // Tracking is account-gated; an unauthenticated click should open auth instead of navigation.
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#tracking.page')).not.toHaveClass(/active/);
    await page.locator('#authModal button.close').click();
    expect(errors, 'uncaught runtime errors in X2 UI controls').toEqual([]);
  });
});
