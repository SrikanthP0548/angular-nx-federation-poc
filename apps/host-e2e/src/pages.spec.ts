import { expect, test } from '@playwright/test';
import { TRACERS } from './support';

/** Every feature entry has a host page, and each renders its own page. */
test.describe('host pages', () => {
  test('pricing search renders customer pricing', async ({ page }) => {
    await page.goto('/pricing-search.html?customerId=1001');

    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();
    await expect(page.getByText('Northwind Trading Ltd (1001)')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(5); // header + 4 products
  });

  test('pricing details renders one product line for a different customer', async ({ page }) => {
    await page.goto('/pricing-details.html?customerId=1002&productCode=EQ-OPT');

    await expect(page.getByRole('heading', { name: TRACERS['pricing-details'] })).toBeVisible();
    await expect(page.getByText('Contoso Capital Partners (1002)')).toBeVisible();
    await expect(page.getByText('EQ-OPT — Equity Options Clearing')).toBeVisible();
  });

  test('feature two renders from its lazy page library', async ({ page }) => {
    await page.goto('/feature-two.html?reference=SSI-9902');

    await expect(page.getByRole('heading', { name: TRACERS['feature-two'] })).toBeVisible();
    await expect(page.getByText('Reference: SSI-9902')).toBeVisible();
  });

  test('feature three renders from its lazy page library', async ({ page }) => {
    await page.goto('/feature-three.html?desk=Credit');

    await expect(page.getByRole('heading', { name: TRACERS['feature-three'] })).toBeVisible();
    await expect(page.getByText('Desk: Credit')).toBeVisible();
  });

  test('a lazy page resolves platform tokens from the loader injector', async ({ page }) => {
    await page.goto('/feature-two.html');

    await expect(page.getByText(/environment: local-integration/)).toBeVisible();
  });

  test('host page values are HTML-encoded', async ({ page }) => {
    await page.goto(`/pricing-search.html?customerId=${encodeURIComponent('"><script>alert(1)</script>')}`);

    const injected = await page.locator('script:not([type])').count();
    expect(injected).toBe(0);
  });
});
