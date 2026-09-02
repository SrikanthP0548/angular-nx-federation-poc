import { expect, Page, test } from '@playwright/test';

/**
 * legacy-container in isolation: startup, iframe navigation, browser
 * history, refresh, and direct-click popup/download behavior. The combined
 * flow (a federated feature rendering inside an iframe-hosted legacy page)
 * is covered separately in combined-flow.spec.ts.
 */

/** The iframe's own live document — not the static <iframe src> attribute,
 *  which never changes on internal navigation (see the download test). */
function childFrame(page: Page) {
  return page.frames().find((frame) => frame.parentFrame() === page.mainFrame());
}

/** Exact pathname, not `page.url()).toContain(...)` — a substring match
 *  would also pass for, say, `/AngularShell/legacy-page.aspx` if the outer
 *  document ever navigated there by mistake, which is exactly the failure
 *  this container's contract rules out. */
function outerPathname(page: Page) {
  return new URL(page.url()).pathname;
}

/** Same reasoning applied to the iframe's own document: `.toContain('/default.asp')`
 *  would also pass for `/default.aspx` or `/not-default.asp`. */
function childFramePathname(page: Page) {
  const url = childFrame(page)?.url();
  return url ? new URL(url).pathname : undefined;
}

test.describe('container startup', () => {
  test('/AngularShell/ loads its own assets from /AngularShell/*', async ({ page }) => {
    const scriptUrls: string[] = [];
    page.on('response', (response) => {
      if (response.url().endsWith('.js')) scriptUrls.push(response.url());
    });

    const response = await page.goto('/AngularShell/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('iframe')).toHaveCount(1);
    expect(scriptUrls.some((url) => url.includes('/AngularShell/'))).toBe(true);
  });

  test('the iframe loads exactly /default.asp on first load, nothing else', async ({ page }) => {
    await page.goto('/AngularShell/');
    const iframe = page.locator('iframe');
    await expect(iframe).toHaveAttribute('src', '/default.asp');
    await expect(iframe).toHaveAttribute('title', /.+/);

    // The declarative attribute is necessary but not sufficient — it proves
    // what was requested, not what the frame's live document actually is.
    // Assert the real thing too.
    expect(childFramePathname(page)).toBe('/default.asp');
  });

  test('no Angular chrome around the iframe — no nav, header, footer, or menu', async ({ page }) => {
    await page.goto('/AngularShell/');
    const chromeCount = await page.locator('nav, header, footer, [role="navigation"], [role="banner"]').count();
    expect(chromeCount).toBe(0);
    await expect(page.locator('iframe')).toHaveCount(1);
  });

  test('the iframe is borderless and fills the viewport; body has no margin', async ({ page }) => {
    await page.goto('/AngularShell/');

    const bodyMargin = await page.evaluate(() => getComputedStyle(document.body).margin);
    expect(bodyMargin).toBe('0px');

    const iframe = page.locator('iframe');
    const border = await iframe.evaluate((el) => getComputedStyle(el).borderWidth);
    expect(border).toBe('0px');

    const box = await iframe.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (box && viewport) {
      expect(Math.round(box.width)).toBe(viewport.width);
      expect(Math.round(box.height)).toBe(viewport.height);
    }
  });
});

test.describe('legacy navigation inside the container', () => {
  test('navigating inside the iframe leaves the outer URL at /AngularShell/', async ({ page }) => {
    await page.goto('/AngularShell/');
    await page.frameLocator('iframe').getByRole('link', { name: '/legacy-page.aspx' }).click();

    await expect(page.frameLocator('iframe').locator('body')).toContainText('ASPX page');
    expect(outerPathname(page)).toBe('/AngularShell/');
  });

  test('ASP-to-ASPX and ASPX-to-ASP navigation both stay inside the iframe', async ({ page }) => {
    await page.goto('/AngularShell/');
    const frame = page.frameLocator('iframe');

    await frame.getByRole('link', { name: '/legacy-page.aspx' }).click();
    await expect(frame.locator('body')).toContainText('ASPX page');
    expect(childFramePathname(page)).toBe('/legacy-page.aspx');

    await frame.getByRole('link', { name: '/legacy-page.asp', exact: true }).click();
    await expect(frame.locator('body')).toContainText('Classic ASP page');
    expect(childFramePathname(page)).toBe('/legacy-page.asp');

    expect(outerPathname(page)).toBe('/AngularShell/');
  });

  test('Back and Forward traverse iframe history without leaving the container', async ({ page }) => {
    await page.goto('/AngularShell/');
    const frame = page.frameLocator('iframe');

    await frame.getByRole('link', { name: '/legacy-page.asp', exact: true }).click();
    await expect(frame.locator('body')).toContainText('Classic ASP page');

    // Not page.goBack(): that waits for the OUTER document's 'load' event,
    // which never fires here — per the HTML spec's joint session history,
    // Back steps the iframe back without reloading the top-level document
    // (verified manually in Chrome; this is the behavior being asserted,
    // not a workaround for a flaky wait).
    await page.evaluate(() => window.history.back());
    await expect(frame.locator('body')).toContainText('Stands in for the real ASP Classic entry page');
    expect(childFramePathname(page)).toBe('/default.asp');
    expect(outerPathname(page)).toBe('/AngularShell/');

    await page.evaluate(() => window.history.forward());
    await expect(frame.locator('body')).toContainText('Classic ASP page');
    expect(childFramePathname(page)).toBe('/legacy-page.asp');
    expect(outerPathname(page)).toBe('/AngularShell/');
  });

  test('refresh resets the iframe to /default.asp — accepted Phase-1 behavior', async ({ page }) => {
    await page.goto('/AngularShell/');
    const frame = page.frameLocator('iframe');

    await frame.getByRole('link', { name: '/legacy-page.asp', exact: true }).click();
    await expect(frame.locator('body')).toContainText('Classic ASP page');

    await page.reload();
    await expect(page.locator('iframe')).toHaveAttribute('src', '/default.asp');
    await expect(frame.locator('body')).toContainText('Stands in for the real ASP Classic entry page');
  });
});

test.describe('direct-click popup and download from inside the iframe', () => {
  test('a direct click opens a same-origin popup', async ({ page }) => {
    await page.goto('/AngularShell/');
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.frameLocator('iframe').locator('#popup-link').click(),
    ]);
    await popup.waitForLoadState();
    expect(new URL(popup.url()).pathname).toBe('/legacy-page.asp');
    await expect(popup.locator('body')).toContainText('Popup');
    await popup.close();
  });

  test('a direct click on a download link triggers a download, not a navigation', async ({ page }) => {
    await page.goto('/AngularShell/');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.frameLocator('iframe').locator('#download-link').click(),
    ]);
    expect(download.suggestedFilename()).toBe('sample.txt');

    // The iframe's own document must still be /default.asp — a download must
    // not navigate the frame away from it. Checking the <iframe src>
    // attribute would not prove this: that attribute is the initial
    // declarative value and never changes on internal navigation, so it
    // would read as "unchanged" even if the frame's live document had
    // actually navigated elsewhere. Check the live child frame instead.
    expect(childFramePathname(page)).toBe('/default.asp');
    await expect(page.frameLocator('iframe').locator('body')).toContainText(
      'Stands in for the real ASP Classic entry page'
    );
  });
});

test.describe('postback-style form submission inside the iframe', () => {
  test('submitting the form completes without breaking or navigating out of the iframe', async ({ page }) => {
    await page.goto('/AngularShell/');
    const frame = page.frameLocator('iframe');

    await frame.locator('input[name="q"]').fill('a submitted value');
    await frame.getByRole('button', { name: 'Submit' }).click();

    // The simulator re-renders /default.asp on POST, same as a real
    // WebForms postback returning the same page — still inside the iframe,
    // at the same URL, outer container untouched.
    expect(childFramePathname(page)).toBe('/default.asp');
    await expect(frame.locator('body')).toContainText('Stands in for the real ASP Classic entry page');
    expect(outerPathname(page)).toBe('/AngularShell/');
  });
});

test.describe('startup failure diagnostics', () => {
  test('a failed legacy-container script load displays a visible, reportable failure message', async ({ page }) => {
    // Simulates the one failure mode startup-failure.ts's
    // bootstrapApplication().catch() cannot cover: main.js itself never
    // loading at all, not main.js loading and then throwing. See the
    // inline <script> in legacy-container's index.html.
    await page.route('**/AngularShell/main-*.js', (route) => route.abort());
    await page.goto('/AngularShell/');

    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('failed to start');

    // A reference id is present for correlating with the console error, not
    // just a bare "something went wrong".
    const text = await alert.textContent();
    expect(text).toMatch(/[a-z0-9]{6,}/i);

    // Nothing else renders in place of the failed app — no stray iframe
    // from a half-started bootstrap.
    await expect(page.locator('iframe')).toHaveCount(0);
  });
});
