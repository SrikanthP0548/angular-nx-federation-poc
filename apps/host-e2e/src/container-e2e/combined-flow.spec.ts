import { expect, test } from '@playwright/test';

/**
 * The complete combined path, unmodified at every layer:
 *
 *   /AngularShell/ -> legacy-container -> iframe -> legacy page
 *     -> data-angular-feature -> existing federation shell -> selected
 *     provider -> Angular custom element
 *
 * legacy-container itself has no federation wiring (see the type:container
 * module-boundary constraint) — every script here belongs to whichever
 * document actually asked for it, which is exactly what these tests check.
 *
 * That direct feature-host pages keep working *outside* the container, and
 * that a page loads exactly one provider, are already covered by
 * pages.spec.ts and architecture.spec.ts against the un-iframed simulator —
 * not duplicated here.
 */

test('a federated Angular feature renders correctly inside an iframe-hosted legacy page', async ({ page }) => {
  await page.goto('/AngularShell/');
  const frame = page.frameLocator('iframe');

  await frame.getByRole('link', { name: '/legacy-page.aspx' }).click();

  const pricingSearch = frame.locator('ca-pricing-search');
  await expect(pricingSearch).toContainText('Customer pricing search');
  await expect(pricingSearch).toContainText('Northwind Trading Ltd');
});

test('the outer container never fetches federation code — only the iframe document does', async ({ page }) => {
  const outerScripts: string[] = [];
  const iframeScripts: string[] = [];
  page.on('response', (response) => {
    if (!response.url().endsWith('.js')) return;
    (response.frame() === page.mainFrame() ? outerScripts : iframeScripts).push(response.url());
  });

  await page.goto('/AngularShell/');
  await page.frameLocator('iframe').getByRole('link', { name: '/legacy-page.aspx' }).click();
  await expect(page.frameLocator('iframe').locator('ca-pricing-search')).toContainText('Customer pricing search');

  expect(outerScripts.some((url) => url.includes('/ui/'))).toBe(false);
  expect(outerScripts.every((url) => url.includes('/AngularShell/'))).toBe(true);
  expect(iframeScripts.filter((url) => url.endsWith('/ui/shell/current/main.js'))).toHaveLength(1);
  expect(iframeScripts.some((url) => url.includes('/ui/pricing/'))).toBe(true);
});
