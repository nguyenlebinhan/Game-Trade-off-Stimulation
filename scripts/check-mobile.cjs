// Run with Playwright available on NODE_PATH and the Vite dev server running.
// Screenshots are working evidence written outside the repository.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 700 }, hasTouch: true, isMobile: true });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
    await page.getByRole('button', { name: 'Add App server', exact: true }).tap();
    await page.getByRole('button', { name: 'Add Primary database', exact: true }).tap();
    await page.waitForFunction(() => document.querySelector('.inspector>strong')?.textContent === 'Primary database');
    const dimensions = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scroll: document.documentElement.scrollWidth }));
    assert.deepEqual(dimensions, { width: 320, height: 700, scroll: 320 });
    await page.evaluate(() => {
      window.observedEdges = [];
      window.addEventListener('architecture:relations', event => { window.observedEdges = event.detail; });
    });
    await page.touchscreen.tap(90, 370);
    await page.waitForFunction(() => document.querySelector('.inspector>strong')?.textContent === 'App server');
    await page.touchscreen.tap(210, 370);
    await page.waitForFunction(() => document.querySelector('.inspector>strong')?.textContent === 'Primary database');
    const cdp = await page.context().newCDPSession(page);
    async function gesture(from, to, cancel = false) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...from, id: 1 }] });
      if (to) for (let step = 1; step <= 10; step++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + (to.x - from.x) * step / 10, y: from.y + (to.y - from.y) * step / 10, id: 1 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(250);
    }
    const handle = await page.locator('.connector-handle').boundingBox();
    const start = { x: handle.x + handle.width / 2, y: handle.y + handle.height / 2 };
    await gesture(start, { x: 90, y: 370 }, true);
    assert.equal(await page.evaluate(() => window.observedEdges.length), 0, 'cancel must not create an edge');
    await gesture(start, { x: 90, y: 370 });
    await page.waitForFunction(() => window.observedEdges.length === 1);
    assert.equal(await page.evaluate(() => window.observedEdges[0].type), 'database-to-app-server');
    await page.screenshot({ path: path.join(os.tmpdir(), 'architecture-mobile-connected.png') });
    const before = await page.locator('canvas').screenshot();
    await gesture({ x: 285, y: 230 }, { x: 180, y: 240 });
    const after = await page.locator('canvas').screenshot();
    assert(!before.equals(after), 'ground drag must change the rendered camera view');
    const remove = await page.getByRole('button', { name: 'Remove Primary database', exact: true }).boundingBox();
    await gesture({ x: remove.x + remove.width / 2, y: remove.y + remove.height / 2 });
    await page.waitForFunction(() => window.observedEdges.length === 0 && !document.querySelector('.inspector'));
    await page.getByRole('button', { name: 'Reset simulation', exact: true }).tap();
    await page.getByRole('button', { name: 'Workload & results', exact: true }).tap();
    await page.waitForFunction(() => document.querySelector('.workload-open'));
    assert(await page.getByRole('spinbutton', { name: 'Requests / sec', exact: true }).isVisible());
    await page.screenshot({ path: path.join(os.tmpdir(), 'architecture-mobile-workload.png') });
    assert.deepEqual(errors, []);
    const desktop = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await desktop.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
    await desktop.getByRole('button', { name: 'Add App server', exact: true }).click();
    await desktop.getByRole('button', { name: 'Add Primary database', exact: true }).click();
    await desktop.screenshot({ path: path.join(os.tmpdir(), 'architecture-desktop.png') });
    console.log('PASS: 320x700 real Chromium touch add/select/connect/cancel/orbit/remove/reset/workload; zero overflow or page errors. Desktop screenshot: 1366x900.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
