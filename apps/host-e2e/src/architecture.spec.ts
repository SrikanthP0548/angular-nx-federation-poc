import { expect, test } from '@playwright/test';
import { ScriptRecorder, SHELL_PATH, TRACERS } from './support';

/**
 * The claims the architecture stands or falls on. These assert on what the
 * network actually delivered, in a fresh context with a cold cache — a warm
 * cache would make both claims unfalsifiable.
 */
test.describe('runtime ownership', () => {
  const FRAMEWORK = ['_angular_core', '_angular_common', '_angular_platform_browser', '_angular_elements', 'rxjs'];

  for (const [featureKey, tracer] of Object.entries(TRACERS)) {
    test(`${featureKey}: every framework file comes from the shell, never a provider`, async ({ page }) => {
      const scripts = new ScriptRecorder(page);
      await page.goto(`/${featureKey}.html`);
      await expect(page.getByRole('heading', { name: tracer })).toBeVisible();
      await scripts.settled();

      const framework = scripts.urls.filter((u) => FRAMEWORK.some((f) => u.includes(f)));
      expect(framework.length).toBeGreaterThan(0);

      for (const url of framework) {
        expect(url, `${url} must be served by the shell`).toContain(SHELL_PATH);
      }
      // Angular legitimately ships several secondary entry points, so the
      // claim is "one copy of each file", not "one file".
      const duplicated = framework.filter((u, i) => framework.indexOf(u) !== i);
      expect(duplicated, 'no framework file may be requested twice').toEqual([]);
    });
  }

  test('shared-core is fetched once, from the shell', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-search.html');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    await scripts.settled();

    const sharedCore = scripts.urls.filter((u) => u.includes('shared_core'));
    expect(sharedCore).toHaveLength(1);
    expect(sharedCore[0]).toContain(SHELL_PATH);
  });
});

test.describe('lazy per-page loading', () => {
  test('the search page never downloads the details page', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-search.html?customerId=1001');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    await scripts.settled();

    expect(await scripts.containing(TRACERS['pricing-search'])).toHaveLength(1);
    expect(
      await scripts.containing(TRACERS['pricing-details']),
      'the sibling page in the same artifact must not be downloaded'
    ).toEqual([]);
  });

  test('the details page never downloads the search page', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-details.html?customerId=1001&productCode=IRS-10Y');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-details'] })).toBeVisible();
    await scripts.settled();

    expect(await scripts.containing(TRACERS['pricing-details'])).toHaveLength(1);
    expect(await scripts.containing(TRACERS['pricing-search'])).toEqual([]);
  });

  test('shared domain code arrives in its own chunk, not duplicated into each page', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-search.html?customerId=1001');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    await scripts.settled();

    // The data-access fixtures are used by both pricing pages.
    const withFixtures = await scripts.containing('Northwind Trading Ltd');
    const withPage = await scripts.containing(TRACERS['pricing-search']);
    expect(withFixtures).toHaveLength(1);
    expect(withFixtures[0], 'shared domain code must not be inlined into the page chunk').not.toBe(withPage[0]);
  });
});
