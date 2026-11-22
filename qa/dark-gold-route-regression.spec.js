const { test, expect } = require('@playwright/test');

const allPageIds = ["home","cycleDelivery","explore","serviceProviderRegister","bankingServices","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","technicianRegister","parcelRelease","orders","tracking","wallet","offers","customerDashboard","driverDashboard","partnerDashboard","partnerOrders","products","inventory","gst","catalogue","subscription","referrals","partnerReports","adminDashboard","crmDashboard","users","referralApprovals","cashRewardApprovals","paymentApprovals","partnerPaymentSettings","platformBusinessSettings","driverApprovals","driverDocumentReviews","partnerApprovals","adminOrders","reports","settings","profile","notifications","support","about","cart","frSupportFeedback","frSuperHub"];
const sharedCustomerRoutes = ["home","explore","ride","scheduled","goods","parcel","food","restaurantCatalogue","shops","shopping","homeServices","laundryServices","storeBrowse","customerCatalogue","marketCart","orders","tracking","wallet","offers","profile","notifications","support","about","cart","frSupportFeedback","cycleDelivery","serviceProviderRegister","bankingServices","technicianRegister","parcelRelease","frSuperHub"];

test.describe('FRIEND RIDE Project Arjuna UI and route regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      const url = route.request().url();
      if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          url.includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    const launcher=page.locator('#roleLauncher');
    if(await launcher.isVisible()){
      await launcher.locator('.fr-role-card.customer').click();
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await page.locator('#authModal .close').click();
    }
    await expect(launcher).toHaveClass(/hide/);
    await page.evaluate(()=>window.showPage('home'));
    const homeState=await page.evaluate(()=>({url:location.href,homeClass:document.getElementById('home')?.className,homeAria:document.getElementById('home')?.getAttribute('aria-hidden'),homeHtmlLength:document.getElementById('home')?.innerHTML.length,cabCount:document.querySelectorAll('#home .cab-feature').length,proCount:document.querySelectorAll('#home .home-pro-service').length,activePages:[...document.querySelectorAll('main .page.active')].map(x=>x.id),selectedRole,launcher:document.getElementById('roleLauncher')?.className,showPageType:typeof window.showPage}));
    console.log('PROJECT ARJUNA UI setup',JSON.stringify(homeState));
  });

  test('current 56 routes exist; removed VidyaSetu and event services remain absent; theme tokens are applied', async ({ page }) => {
    const result = await page.evaluate(ids => ({
      missing: ids.filter(id => !document.getElementById(id)),
      removedStillPresent: ['eventServices','learnTeach'].filter(id => document.getElementById(id)),
      pageCount: document.querySelectorAll('.page').length,
      themeStyle: !!document.getElementById('fr-project-arjuna-premium-theme'),
      primary: getComputedStyle(document.documentElement).getPropertyValue('--purple').trim(),
      secondary: getComputedStyle(document.documentElement).getPropertyValue('--purple2').trim(),
      bodyBackground: getComputedStyle(document.body).backgroundImage,
      themeMeta: document.querySelector('meta[name="theme-color"]')?.content,
      qaBackend: document.documentElement.innerHTML.includes('pqsangtvietawkfgpgfu'),
      productionBackend: document.documentElement.innerHTML.includes('fglyplxcczdjtfwobtzh')
    }), allPageIds);
    expect(result.missing).toEqual([]);
    expect(result.removedStillPresent).toEqual([]);
    expect(result.pageCount).toBe(56);
    expect(result.themeStyle).toBe(true);
    expect(result.primary).toBe('#1766d8');
    expect(result.secondary).toBe('#13a9a2');
    expect(result.bodyBackground).not.toBe('none');
    expect(result.themeMeta).toBe('#10243e');
    expect(result.qaBackend).toBe(true);
    expect(result.productionBackend).toBe(false);
  });

  test('notification bell SVG and 3D default avatar render without a profile photo', async ({ page }) => {
    const bell = page.locator('#frHomeProfileButton + .fr-notify-bell');
    await expect(bell).toBeAttached();
    await expect(bell).toHaveAttribute('aria-label', 'Notifications');
    await expect(bell.locator('svg.fr-bell-svg path')).toBeAttached();
    await expect(page.locator('#frHomeProfileImage[hidden]')).toBeHidden();
    await expect(page.locator('#frHomeProfileAvatar img[alt="3D profile avatar"]')).toBeVisible({ timeout: 10000 });
  });

  test('role launcher has four choices and Customer selection opens locked login', async ({ page }) => {
    await page.evaluate(()=>document.getElementById('roleLauncher').classList.remove('hide'));
    const launcher=page.locator('#roleLauncher');
    await expect(launcher.locator('.fr-role-card')).toHaveCount(4);
    await launcher.locator('.fr-role-card.customer').click();
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authModal')).toHaveClass(/fr-role-locked/);
    await expect(page.locator('#authTitle')).toHaveText('Customer Login');
    await page.locator('#authModal .close').click();
    await expect(launcher).toHaveClass(/hide/);
  });

  test('home keeps registration entry points and each role opens the matching auth modal', async ({ page }) => {
    const roles = ['customer','driver','partner'];
    const registrations = page.locator('#home .join-card button');
    await expect(registrations).toHaveCount(3);
    for (let i=0;i<roles.length;i++) {
      await page.evaluate(() => window.showPage('home'));
      await registrations.nth(i).click();
      await expect(page.locator('#authModal')).toHaveClass(/show/);
      await expect(page.locator('#authModal')).toHaveAttribute('data-active-role', roles[i]);
      await page.locator('#authModal .close').click();
      await expect(page.locator('#authModal')).not.toHaveClass(/show/);
    }
  });

  test('home service cards route to Ride, TASKO/GIGGER and Laundry screens', async ({ page }) => {
    await page.evaluate(() => { requireLogin = callback => callback(); });
    await page.locator('#home .cab-feature').click();
    await expect(page.locator('#ride')).toHaveClass(/active/);
    await page.evaluate(() => window.showPage('home'));
    await page.locator('#home .home-pro-service').filter({hasText:'TASKO / GIGGER'}).click();
    await expect(page.locator('#homeServices')).toHaveClass(/active/);
    await page.evaluate(() => window.showPage('home'));
    await page.locator('#home .home-pro-service').filter({hasText:'LAUNDRY SERVICES'}).click();
    await expect(page.locator('#laundryServices')).toHaveClass(/active/);
    await expect(page.locator('#home .home-pro-service')).not.toContainText('Beauty Makeover');
  });

  test('drawer opens and CRM route has a styled panel surface', async ({ page }) => {
    await page.evaluate(() => { currentProfile={role:'admin'}; selectedRole='admin'; currentUser={id:'qa-admin'}; });
    await page.evaluate(() => window.openDrawer());
    await expect(page.locator('.drawer-backdrop')).toHaveClass(/show/);
    await expect(page.locator('.drawer')).toBeVisible();
    await page.evaluate(() => { closeDrawer(); window.showPage('crmDashboard'); });
    await expect(page.locator('#crmDashboard')).toHaveClass(/active/);
    await expect(page.locator('#crmDashboard .fr-crm-panel').first()).toBeAttached();
  });

  test('primary navigation is five tabs and removes the legacy Categories tab', async ({ page }) => {
    const nav = page.locator('.premium-bottom');
    await expect(nav.locator('button')).toHaveCount(5);
    await expect(nav).toContainText('Home');
    await expect(nav).toContainText('Services');
    await expect(nav).toContainText('Cart');
    await expect(nav).toContainText('Orders');
    await expect(nav).toContainText('Profile');
    await expect(nav).not.toContainText('Categories');
    await expect(nav).not.toContainText('Friend Mart');
    await expect(nav).not.toContainText('Food Delivery');
    await expect(nav).not.toContainText('విద్యా సేతు');
    const fraiButtonCount = await page.evaluate(() => [...document.querySelectorAll('button')].filter(button => /FRAI|FR AI|AI Assistant/i.test(button.textContent || button.getAttribute('aria-label') || '')).length);
    expect(fraiButtonCount).toBe(0);
  });

  test('all retained customer routes activate their destination screens', async ({ page }) => {
    for (const route of sharedCustomerRoutes) {
      await page.evaluate(id => window.showPage(id), route);
      await expect(page.locator('#' + route)).toHaveClass(/active/);
    }
  });

  test('Admin dashboard menu guard blocks non-admin and permits verified admin', async ({ page }) => {
    await page.evaluate(() => { currentProfile=null; currentUser=null; selectedRole='customer'; window.menuGo('adminDashboard'); });
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authTitle')).toHaveText('Admin Login');
    await page.locator('#authModal .close').click();
    await page.evaluate(() => { currentProfile={role:'customer'}; currentUser={id:'qa-customer'}; selectedRole='customer'; window.alert=message=>window.__qaAdminGuardMessage=String(message); window.menuGo('adminDashboard'); });
    await expect(page.locator('#home')).toHaveClass(/active/);
    const guardMessage=await page.evaluate(()=>window.__qaAdminGuardMessage||'');
    expect(guardMessage).toMatch(/ADMIN account/);
    await page.evaluate(() => { currentProfile={role:'admin'}; currentUser={id:'qa-admin'}; selectedRole='admin'; window.menuGo('adminDashboard'); });
    await expect(page.locator('#adminDashboard')).toHaveClass(/active/);
  });

  test('Customer login keeps OTP flow and registration entry', async ({ page }) => {
    await page.evaluate(() => window.openAuth('login','customer'));
    await expect(page.locator('#authModal')).toHaveClass(/show/);
    await expect(page.locator('#authTitle')).toHaveText('Customer Login');
    await expect(page.locator('#loginForm button[onclick="sendLoginOtp()"]')).toHaveText('Send Customer SMS OTP');
    await expect(page.locator('#authRegisterButton')).toBeVisible();
    await expect(page.locator('#authModal .rolegrid')).toBeHidden();
    await expect(page.locator('#authModal .modalbox')).toBeVisible();
  });

  test('Admin login is role locked and hides registration and role chooser', async ({ page }) => {
    await page.evaluate(() => window.enterRole('admin'));
    const modal=page.locator('#authModal');
    await expect(modal).toHaveClass(/show/);
    await expect(modal).toHaveClass(/fr-role-locked/);
    await expect(page.locator('#authTitle')).toHaveText('Admin Login');
    await expect(page.locator('#loginForm button[onclick="sendLoginOtp()"]')).toHaveText('Send Admin SMS OTP');
    await expect(page.locator('#authRegisterButton')).toBeHidden();
    await expect(modal.locator('.rolegrid')).toBeHidden();
  });

  test('unwanted event/personal service booking UI is removed but TASKO categories remain', async ({ page }) => {
    await expect(page.locator('#eventServices')).toHaveCount(0);
    await expect(page.locator('#eventServiceType')).toHaveCount(0);
    await expect(page.locator('#learnTeach')).toHaveCount(0);
    await expect(page.locator('#home .home-pro-service')).toHaveCount(8);
    await expect(page.locator('#home .home-pro-service')).not.toContainText('Beauty Makeover');
    await page.evaluate(()=>window.showPage('homeServices'));
    await expect(page.locator('#taskoCategory')).toBeVisible();
    const categories=await page.locator('#taskoCategory option').allTextContents();
    expect(categories).toContain('Beauty Makeover');
    expect(categories).toContain('Halwai – Sweets & Food Preparation');
    expect(categories).not.toContain('Catering Services');
    expect(categories).not.toContain('DJ – Sound & Lights');
  });

  test('all inventoried routes can activate without route loss', async ({ page }) => {
    const results=await page.evaluate(ids=>{
      currentProfile={role:'admin'};currentUser={id:'qa-admin'};selectedRole='admin';
      return ids.map(id=>{try{window.showPage(id);const el=document.getElementById(id);return {id,exists:!!el,active:!!el?.classList.contains('active')}}catch(error){return {id,exists:!!document.getElementById(id),active:false,error:String(error)}}});
    },allPageIds);
    expect(results.filter(r=>!r.exists).map(r=>r.id)).toEqual([]);
    expect(results.filter(r=>!r.active).map(r=>({id:r.id,error:r.error||null}))).toEqual([]);
  });
});
