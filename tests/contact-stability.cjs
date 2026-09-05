const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:4174/index.html';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const widths = process.env.TEST_DESKTOP_ONLY === '1' ? [1024, 1440] : [360, 390, 412, 1024, 1440];
    for (const width of widths) {
      const mobile = width < 810;
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: mobile, hasTouch: mobile });
      // Verify native activation without contacting WhatsApp.
      await context.route('https://wa.me/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: 'Contact destination test' }));
      const page = await context.newPage();
      const errors = [];
      const pending = new Set();
      page.on('request', request => pending.add(request.url()));
      page.on('requestfinished', request => pending.delete(request.url()));
      page.on('requestfailed', request => pending.delete(request.url()));
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(baseURL, { waitUntil: 'load', timeout: 30000 });
      } catch (error) {
        console.log('Pending resources:', [...pending]);
        throw error;
      }
      await page.waitForFunction(() => document.documentElement.dataset.norouEnhancementsStarted === 'true');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      const navigate = async id => {
        if (mobile) {
          await page.locator('.norou-mobile-navigation__toggle').tap();
          const box = await page.locator(`.norou-mobile-navigation__link[href="#${id}"]`).boundingBox();
          assert.ok(box, 'Mobile menu target exists');
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
        } else {
          await page.locator(`nav:not(.norou-mobile-navigation) a[href="#${id}"]`).filter({ visible: true }).click();
        }
        await page.waitForFunction(sectionId => {
          if (sectionId === 'home') return Math.abs(scrollY) < 2;
          const target = document.getElementById(sectionId);
          if (!target || location.hash !== `#${sectionId}`) return false;
          return Math.abs(target.getBoundingClientRect().top - Number(target.dataset.norouOffset || 120)) < 3;
        }, id, { timeout: 6000 });
      };
      const hasDesktopLinks = mobile || width >= 1200;
      for (const id of hasDesktopLinks ? ['work', 'services', 'about', 'contact', 'home', 'contact'] : []) {
        await page.evaluate(() => window.scrollBy({ top: 220, behavior: 'instant' }));
        await page.evaluate(() => window.scrollBy({ top: -90, behavior: 'instant' }));
        await navigate(id);
      }
      if (!hasDesktopLinks) await page.locator('footer').filter({ visible: true }).scrollIntoViewIfNeeded();
      const measure = () => page.locator('footer').filter({ visible: true }).evaluate(element => {
        const box = node => {
          if (!node) return null;
          const rect = node.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        };
        return { variant: element.dataset.framerName, footer: box(element), logo: box(element.querySelector('[data-framer-name="Logo"]')), cta: box(element.querySelector('[data-framer-name="CTA"]')) };
      });
      const before = await measure();
      const cta = page.locator('footer a[href="https://wa.me/+97430189870"]').filter({ visible: true });
      for (const activation of ['pointer', 'keyboard']) {
        const popupPromise = page.waitForEvent('popup');
        if (activation === 'keyboard') await cta.press('Enter');
        else if (mobile) await cta.tap();
        else await cta.click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        assert.match(popup.url(), /^https:\/\/wa\.me\//);
        await popup.close();
        await page.waitForTimeout(700);
        assert.deepEqual(await measure(), before, `${width}px Contact changed after ${activation}`);
      }
      try {
        await page.reload({ waitUntil: 'load' });
      } catch (error) {
        console.log('Pending resources after reload:', [...pending]);
        throw error;
      }
      await page.waitForTimeout(1800);
      if (hasDesktopLinks) await navigate('contact');
      else await page.locator('footer').filter({ visible: true }).scrollIntoViewIfNeeded();
      assert.deepEqual(await measure(), before, `${width}px Contact changed after refresh`);
      assert.deepEqual(errors, [], `${width}px uncaught errors`);
      console.log(`PASS ${width}px: ${hasDesktopLinks ? 'six single-click routes after scrolling; ' : ''}CTA pointer/keyboard opens link without resizing; refresh preserves layout`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
