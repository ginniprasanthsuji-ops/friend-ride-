const { test, expect } = require('@playwright/test');

test.describe('FRIEND RIDE Dark + Gold preview CSS smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('https://**/*', route => {
      const url = route.request().url();
      if (url.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js@2') ||
          url.includes('unpkg.com/leaflet@1.9.4/')) return route.continue();
      return route.abort();
    });
    await page.goto('./', { waitUntil: 'domcontentloaded' });
  });

  test('preview layer is present and sets Dark + Gold tokens', async ({ page }) => {
    const style = page.locator('#fr-dark-gold-preview-sync');
    await expect(style).toBeAttached();
    const tokens = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        gold: root.getPropertyValue('--gold').trim(),
        purple: root.getPropertyValue('--purple').trim(),
        navy: root.getPropertyValue('--navy').trim(),
        background: root.getPropertyValue('--bg').trim(),
        ink: root.getPropertyValue('--ink').trim(),
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        bodyColor: getComputedStyle(document.body).color,
        bodyBackground: getComputedStyle(document.body).backgroundImage
      };
    });
    expect(tokens.gold).toBe('#f5b84c');
    expect(tokens.purple).toBe('#f5b84c');
    expect(tokens.navy).toBe('#07101e');
    expect(tokens.background).toBe('#050b17');
    expect(tokens.ink).toBe('#f6f8ff');
    expect(tokens.colorScheme).toContain('dark');
    expect(tokens.bodyBackground).not.toBe('none');
    expect(tokens.bodyColor).toBe('rgb(246, 248, 255)');
  });

  test('existing app surfaces receive the preview styles', async ({ page }) => {
    const surfaces = await page.evaluate(() => {
      const selectors = ['.topbar', '.bottom', '.drawer', '.modalbox', '.card', '.tile'];
      return selectors.map(selector => {
        const el = document.querySelector(selector);
        if (!el) return { selector, exists: false };
        const style = getComputedStyle(el);
        return { selector, exists: true, background: style.backgroundImage, color: style.color };
      });
    });
    for (const surface of surfaces) {
      expect(surface.exists, surface.selector).toBe(true);
      expect(surface.background, surface.selector).not.toBe('none');
      expect(surface.color, surface.selector).toMatch(/rgb\(/);
    }
  });

  test('PWA manifest colors align with Dark + Gold preview', async ({ page }) => {
    const manifest = await page.evaluate(async () => {
      const response = await fetch('./manifest.webmanifest');
      return response.json();
    });
    expect(manifest.background_color).toBe('#050b17');
    expect(manifest.theme_color).toBe('#050b17');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#050b17');
  });

  test('preview patch stays CSS and manifest-only', async ({ page }) => {
    const evidence = await page.evaluate(() => ({
      previewStyle: !!document.getElementById('fr-dark-gold-preview-sync'),
      appScriptCount: document.querySelectorAll('script[src]').length,
      pageCount: document.querySelectorAll('.page').length
    }));
    expect(evidence.previewStyle).toBe(true);
    expect(evidence.pageCount).toBeGreaterThan(0);
    expect(evidence.appScriptCount).toBeGreaterThan(0);
  });
});
