import { expect, test } from '@playwright/test';
import { ScriptRecorder, SHELL_PATH, TRACERS } from './support';

/**
 * The landing page hosts no feature, which is the ordinary state of an
 * unmigrated page: the shell loader sits in the shared host template and runs
 * everywhere. Such a page must cost nothing beyond the shell — no manifest
 * fetch, no provider request, no feature code — and navigating to a feature
 * page is what pulls exactly one provider down.
 */
const PROVIDER_PATHS = ['/ui/pricing/', '/ui/feature-two/', '/ui/feature-three/'];

test.describe('deferred feature loading', () => {
  test('the landing page downloads no provider or feature code', async ({ page }) => {
    const scripts = new ScriptRecorder(page);

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /javascript downloaded/i })).toBeVisible();
    await scripts.settled();

    for (const providerPath of PROVIDER_PATHS) {
      expect(scripts.matching(providerPath), `${providerPath} must not be requested`).toEqual([]);
    }
    // Not one of the four page implementations may be present.
    for (const tracer of Object.values(TRACERS)) {
      expect(await scripts.containing(tracer), `"${tracer}" must not be downloaded`).toEqual([]);
    }
    // Everything it did fetch came from the shell.
    expect(scripts.urls.length).toBeGreaterThan(0);
    for (const url of scripts.urls) {
      expect(url).toContain(SHELL_PATH);
    }
  });

  test('the landing page does not even fetch the manifest', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => r.url().includes('manifest.json') && requests.push(r.url()));

    await page.goto('/');
    await expect(page.getByRole('heading', { name: /javascript downloaded/i })).toBeVisible();

    // The shell stops as soon as it finds no feature element, before any
    // manifest work. A page with nothing to host should pay nothing.
    expect(requests).toEqual([]);
  });

  test('the landing page reports no provider code, and reports it truthfully', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/');

    const readout = page.locator('#downloads');
    await expect(readout).toContainText('No feature provider code downloaded on this page.');
    await scripts.settled();

    // The panel is a demo aid, so its claim is cross-checked against the
    // network rather than trusted.
    for (const providerPath of PROVIDER_PATHS) {
      expect(scripts.matching(providerPath)).toEqual([]);
    }
  });

  test('clicking a menu item downloads that provider, and only that one', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /javascript downloaded/i })).toBeVisible();

    // Record only what the navigation itself causes.
    const scripts = new ScriptRecorder(page);
    await page.getByRole('link', { name: 'Customer pricing search' }).first().click();
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    await scripts.settled();

    expect(scripts.matching('/ui/pricing/').length).toBeGreaterThan(0);
    expect(scripts.matching('/ui/feature-two/')).toEqual([]);
    expect(scripts.matching('/ui/feature-three/')).toEqual([]);

    // And within the pricing artifact, still only the requested page.
    expect(await scripts.containing(TRACERS['pricing-search'])).toHaveLength(1);
    expect(await scripts.containing(TRACERS['pricing-details'])).toEqual([]);
  });

  test('each menu item downloads its own provider only', async ({ page }) => {
    for (const [featureKey, expectedPath] of [
      ['feature-two', '/ui/feature-two/'],
      ['feature-three', '/ui/feature-three/'],
    ] as const) {
      await page.goto('/');
      const scripts = new ScriptRecorder(page);

      await page.getByRole('link', { name: TRACERS[featureKey] }).first().click();
      await expect(page.getByRole('heading', { name: TRACERS[featureKey] })).toBeVisible();
      await scripts.settled();

      expect(scripts.matching(expectedPath).length).toBeGreaterThan(0);
      for (const other of PROVIDER_PATHS.filter((p) => p !== expectedPath)) {
        expect(scripts.matching(other), `${featureKey} must not pull ${other}`).toEqual([]);
      }
    }
  });
});
