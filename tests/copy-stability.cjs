const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const expected = "Got questions, project ideas, or just want to say hi? We're all ears!";

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [360, 390, 412, 1024, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      // Sample at paint opportunities, not just after hydration has settled.
      await page.addInitScript(() => {
        window.contactCopyFrames = [];
        const sample = () => {
          for (const p of document.querySelectorAll('footer p,footer h1,footer h2,footer h3')) {
            if (p.getClientRects().length && p.textContent.trim().startsWith('Got questions,')) {
              const value = p.textContent.trim();
              if (!window.contactCopyFrames.includes(value)) window.contactCopyFrames.push(value);
            }
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      for (let refresh = 0; refresh < 2; refresh++) {
        if (refresh === 0) await page.goto('http://127.0.0.1:4174/index.html#contact', { waitUntil: 'load' });
        else await page.reload({ waitUntil: 'load' });
        await page.waitForTimeout(2200);
        assert.deepEqual(await page.evaluate(() => window.contactCopyFrames), [expected], `${width}px Contact text must not change during loading/refresh`);
      }
      console.log(`PASS ${width}px: Contact copy stays correct at every sampled frame across two loads`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
