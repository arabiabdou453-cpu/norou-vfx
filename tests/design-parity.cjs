const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');

// Compare rendered layout against the last release, not against source strings.
const baseline = execFileSync('git', ['show', 'a677fe1:index.html'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [360, 390, 412, 1024, 1440]) {
      const snapshots = [];
      for (const previous of [true, false]) {
        const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
        if (previous) await page.route('http://127.0.0.1:4174/index.html', route => route.fulfill({ contentType: 'text/html', body: baseline }));
        await page.goto('http://127.0.0.1:4174/index.html', { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(2000);
        await page.locator('footer').filter({ visible: true }).scrollIntoViewIfNeeded();
        await page.waitForTimeout(1200);
        snapshots.push(await page.evaluate(() => {
          const nodes = document.querySelectorAll('h1,h2,h3,nav,footer,footer p,footer a,footer [data-framer-name="Logo"],.norou-service-card,.norou-video-card');
          return Array.from(nodes).filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden').map(node => {
            const rect = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            return {
              tag: node.tagName, text: node.textContent.trim(),
              width: Math.round(rect.width), height: Math.round(rect.height),
              font: style.font, color: style.color, borderRadius: style.borderRadius,
              padding: style.padding, background: style.backgroundColor
            };
          });
        }));
        assert.equal(await page.locator('footer').filter({ visible: true }).count(), 1, `${width}px one visible Contact`);
        await page.close();
      }
      // The only intentional copy correction; all dimensions and styles still match.
      const expectedDesign = snapshots[0].map(item => ({ ...item, text: item.text.replace('porject ideas', 'project ideas') }));
      assert.deepEqual(snapshots[1], expectedDesign, `${width}px cleanup must preserve rendered design`);
      console.log(`PASS ${width}px: ${snapshots[0].length} visible elements preserve dimensions, text, fonts, colors, padding and corners`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
