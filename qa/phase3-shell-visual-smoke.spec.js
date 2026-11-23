const { test, expect } = require('@playwright/test');

test.describe('Phase 3 app-shell runtime smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  });

  test('design-system stylesheet loads and reaches all 58 page sections', async ({ page }) => {
    const state = await page.evaluate(() => {
      const body = document.body;
      const link = [...document.querySelectorAll('link[rel="stylesheet"]')]
        .find(item => item.href.includes('friendride-phase3-design-system.css'));
      const pages = [...document.querySelectorAll('.page')];
      return {
        rootScoped: body.classList.contains('fr-phase3-shell'),
        stylesheetLoaded: Boolean(link && link.sheet),
        navy: getComputedStyle(body).getPropertyValue('--fr-navy').trim(),
        legacyPurple: getComputedStyle(body).getPropertyValue('--purple').trim(),
        pageCount: pages.length,
        pageTokensInherited: pages.every(page => getComputedStyle(page).getPropertyValue('--fr-navy').trim() === '#071c46'),
        bodyBackground: getComputedStyle(body).backgroundColor
      };
    });
    expect(state.rootScoped).toBe(true);
    expect(state.stylesheetLoaded).toBe(true);
    expect(state.navy).toBe('#071c46');
    expect(state.legacyPurple).toBe('#071c46');
    expect(state.pageCount).toBe(58);
    expect(state.pageTokensInherited).toBe(true);
    expect(state.bodyBackground).toBe('rgb(243, 246, 251)');
  });

  test('orange primary button foreground meets WCAG AA normal-text contrast', async ({ page }) => {
    const state = await page.evaluate(() => {
      const button = document.querySelector('.btn:not(.purple):not(.dark):not(.light):not(.red):not(.green)');
      if (!button) return null;
      const toRgb = value => value.match(/\\d+/g).slice(0, 3).map(Number);
      const luminance = rgb => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); };
      const fg = toRgb(getComputedStyle(button).color);
      return { foreground: getComputedStyle(button).color, backgroundImage: getComputedStyle(button).backgroundImage, contrastOnOrange: ratio(fg, [255, 107, 0]), contrastOnOrange2: ratio(fg, [255, 139, 36]) };
    });
    expect(state).not.toBeNull();
    expect(state.foreground).toBe('rgb(7, 28, 70)');\n    expect(state.backgroundImage).toContain('rgb(255, 107, 0)');\n    expect(state.backgroundImage).toContain('rgb(255, 139, 36)');
    expect(state.contrastOnOrange).toBeGreaterThanOrEqual(4.5);
    expect(state.contrastOnOrange2).toBeGreaterThanOrEqual(4.5);
  });

  test('keyboard tab focus exposes the contrast-safe focus indicator', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const active = document.activeElement;
      return { tag: active?.tagName, outlineStyle: getComputedStyle(active).outlineStyle, outlineColor: getComputedStyle(active).outlineColor };
    });
    expect(focus.tag).not.toBe('BODY');
    expect(focus.outlineStyle).toBe('solid');
    expect(focus.outlineColor).toBe('rgb(200, 75, 0)');
  });
});
