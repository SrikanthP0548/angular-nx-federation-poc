import { expect, test } from '@playwright/test';
import { ASSET_PATH, ScriptRecorder, TRACERS } from './support';

test.describe('lazy page architecture', () => {
  for (const [featureKey, tracer] of Object.entries(TRACERS)) {
    test(`${featureKey} loads from the single application artifact`, async ({ page }) => {
      const scripts = new ScriptRecorder(page);
      await page.goto(`/${featureKey}.html`);
      await expect(page.getByRole('heading', { name: tracer })).toBeVisible();
      await scripts.settled();

      expect(scripts.urls.length).toBeGreaterThan(1);
      for (const url of scripts.urls) expect(url).toContain(ASSET_PATH);
      expect(
        scripts.urls.some((url) => new RegExp(`/${featureKey}-[^/]+\\.js$`).test(new URL(url).pathname)),
        `expected a lazy artifact prefixed with "${featureKey}-"`,
      ).toBe(true);
      expect(scripts.urls.some((url) => /remoteEntry|importmap|manifest/.test(url))).toBe(false);
    });
  }

  test('pricing search does not download pricing details', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-search.html?customerId=1001');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();

    expect(await scripts.containing(TRACERS['pricing-search'])).toHaveLength(1);
    expect(await scripts.containing(TRACERS['pricing-details'])).toEqual([]);
  });

  test('pricing details does not download pricing search', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/pricing-details.html?customerId=1001&productCode=IRS-10Y');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-details'] })).toBeVisible();

    expect(await scripts.containing(TRACERS['pricing-details'])).toHaveLength(1);
    expect(await scripts.containing(TRACERS['pricing-search'])).toEqual([]);
  });

  test('both pricing pages reuse the same extracted data-access chunk', async ({ page }) => {
    const searchScripts = new ScriptRecorder(page);
    await page.goto('/pricing-search.html?customerId=1001');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    const searchData = await searchScripts.containing('Northwind Trading Ltd');

    const detailsScripts = new ScriptRecorder(page);
    await page.goto('/pricing-details.html?customerId=1001&productCode=IRS-10Y');
    await expect(page.getByRole('heading', { name: TRACERS['pricing-details'] })).toBeVisible();
    const detailsData = await detailsScripts.containing('Northwind Trading Ltd');

    expect(searchData).toHaveLength(1);
    expect(detailsData).toHaveLength(1);
    expect(detailsData[0]).toBe(searchData[0]);
  });
});
