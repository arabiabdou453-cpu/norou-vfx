const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

// A temporarily absent section must not recursively rebuild the whole page.
// The remaining navigation and inline player must keep working.
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('https://www.youtube-nocookie.com/embed/**', route => route.fulfill({ contentType: 'text/html', body: 'Video destination test' }));
      await page.goto('http://127.0.0.1:4174/index.html', { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      await page.waitForTimeout(9000);
      await page.evaluate(() => {
        const footer = Array.from(document.querySelectorAll('footer')).find(node => node.getClientRects().length);
        if (!footer) throw new Error('Contact missing before replacement');
        const replacement = footer.cloneNode(true);
        replacement.removeAttribute('id');
        replacement.querySelector('.norou-copyright')?.remove();
        footer.replaceWith(replacement);
      });
      await page.waitForFunction(() => document.querySelector('#contact .norou-copyright'), null, { timeout: 3000 });
      await page.evaluate(() => {
        // Simulate a section being absent while a responsive tree is replaced.
        document.getElementById('about')?.remove();
        document.querySelectorAll('h1,h2,h3').forEach(heading => {
          if (heading.textContent.includes('About Me')) heading.remove();
        });
        window.scrollBy({ top: 140, behavior: 'instant' });
      });
      await page.waitForTimeout(1000);
      assert.deepEqual(errors, [], `${width}px scroll must tolerate an absent section`);
      const play = page.locator('.norou-video-card__play').filter({ visible: true }).first();
      await play.click();
      assert.equal(await page.locator('.norou-inline-player').count(), 1);
      await page.evaluate(() => {
        window.testControlEvents = [];
        for (const type of ['pointerdown', 'pointerup', 'click']) window.addEventListener(type, event => {
          window.testControlEvents.push({ type, target: event.target instanceof Element ? event.target.outerHTML.slice(0, 220) : null });
        }, true);
      });
      await page.locator('.norou-inline-player__close').click();
      try {
        await page.locator('.norou-inline-player').waitFor({ state: 'detached', timeout: 3000 });
      } catch (error) {
        console.log(await page.evaluate(() => window.testControlEvents));
        throw error;
      }
      assert.equal(await page.locator('.norou-inline-player').count(), 0);
      assert.equal(await page.locator('footer').filter({ visible: true }).count(), 1);
      assert.deepEqual(errors, [], `${width}px interactive controls remain usable`);
      console.log(`PASS ${width}px: late Contact replacement recovers; missing section does not crash; inline video opens/closes; one visible Contact`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
