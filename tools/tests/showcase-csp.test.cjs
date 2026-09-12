// Run with Playwright available: node --test tools/tests/showcase-csp.test.cjs
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { readFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '../..');
const origin = 'http://catalog.test';
const nonce = 'catalog-regression-test';
const contentTypes = {
  '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
};
let browser;

before(async () => { browser = await chromium.launch({ channel: 'chrome', headless: true }); });
after(async () => { await browser?.close(); });

async function openPage(t, name) {
  const context = await browser.newContext({ viewport: { width: Number(process.env.CARD_QA_WIDTH || 1280), height: 900 } });
  t.after(() => context.close());
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.fulfill({ contentType: 'text/html', body: '<p>External destination</p>' });
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) return route.fulfill({ status: 403, body: '' });
    let body;
    try { body = await readFile(file); }
    catch (error) {
      if (error.code === 'ENOENT') return route.fulfill({ status: 404, body: '' });
      throw error;
    }
    const extension = path.extname(file);
    const headers = {};
    if (extension === '.html') {
      body = body.toString().replace(/<\?php[\s\S]*?\?>/g, php => php.includes('echo $token') ? nonce : '');
      headers['Content-Security-Policy'] = `script-src 'self' 'unsafe-inline' https: 'nonce-${nonce}' 'strict-dynamic'`;
    }
    await route.fulfill({ body, headers, contentType: contentTypes[extension] || 'application/octet-stream' });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  await page.goto(`${origin}/default/${name}.html`);
  return page;
}

async function assertModalClosed(page, selector) {
  assert.equal(await page.locator(selector).evaluate(el => el.classList.contains('active')), false,
    'A nested card control must not open the card dialog under CSP');
}

async function capture(page, name, card) {
  if (!process.env.CARD_QA_OUTPUT) return;
  await mkdir(process.env.CARD_QA_OUTPUT, { recursive: true });
  await card.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(process.env.CARD_QA_OUTPUT, `${name}-${page.viewportSize().width}.png`) });
}

test('Projects overflow and download links do not open the card dialog under CSP', async t => {
  const page = await openPage(t, 'project');
  const card = page.locator('.project-card').filter({ has: page.getByRole('button', { name: 'Remapad', exact: true }) });
  const summary = card.locator('.project-card-link-overflow summary');
  await summary.click();
  assert.equal(await card.locator('details').getAttribute('open'), '');
  assert.equal(await card.locator('details a').count(), 2);
  await assertModalClosed(page, '#card-modal-overlay');
  await capture(page, 'projects-menu', card);
  await summary.press('Enter');
  assert.equal(await card.locator('details').getAttribute('open'), null);
  await summary.press('Space');
  assert.equal(await card.locator('details').getAttribute('open'), '');
  await assertModalClosed(page, '#card-modal-overlay');
  for (const label of ['GitLab', 'Firefox Add-ons']) {
    const popupPromise = page.waitForEvent('popup');
    await card.getByRole('link', { name: label, exact: true }).click();
    const popup = await popupPromise;
    await assertModalClosed(page, '#card-modal-overlay');
    await popup.close();
  }
  await card.getByRole('button', { name: 'Remapad', exact: true }).press('Enter');
  assert.equal(await page.locator('#card-modal-overlay').evaluate(el => el.classList.contains('active')), true);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await assertModalClosed(page, '#card-modal-overlay');
});

test('Goodies many-link menu stays independent of its dialog under CSP', async t => {
  const page = await openPage(t, 'goodies');
  await page.getByRole('searchbox').fill('OpenRedAlert');
  const card = page.locator('.showcase-card');
  await card.locator('summary').click();
  assert.equal(await card.locator('details').getAttribute('open'), '');
  assert.equal(await card.locator('details a').count(), 5);
  await assertModalClosed(page, '#goodies-showcase-modal-overlay');
  await capture(page, 'games-menu', card);
  await card.locator('summary').press('Enter');
  assert.equal(await card.locator('details').getAttribute('open'), null);
  await card.getByRole('button', { name: 'OpenRedAlert', exact: true }).click();
  assert.equal(await page.locator('#goodies-showcase-modal-overlay').evaluate(el => el.classList.contains('active')), true);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('button', { name: 'Utilities', exact: true }).click();
  await page.getByRole('searchbox').fill('Python');
  await capture(page, 'utilities', page.locator('.showcase-card'));
  const popupPromise = page.waitForEvent('popup');
  await page.locator('.showcase-card-links > a').first().click();
  await (await popupPromise).close();
  await assertModalClosed(page, '#goodies-showcase-modal-overlay');
});

test('Blog title and footer still navigate under CSP', async t => {
  for (const selector of ['.showcase-card-title a', '.showcase-card-links > a']) {
    const page = await openPage(t, 'blog');
    const link = page.locator(selector).first();
    const destination = await link.getAttribute('href');
    if (selector === '.showcase-card-title a') await capture(page, 'blog', page.locator('.showcase-card').first());
    await link.click();
    await page.waitForURL(new URL(destination, `${origin}/default/blog.html`).href);
    assert.equal(page.url(), new URL(destination, `${origin}/default/blog.html`).href);
  }
});
