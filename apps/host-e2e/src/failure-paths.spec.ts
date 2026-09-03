import { expect, test } from '@playwright/test';
import { replaceHostMarkup } from './support';

const FALLBACK = /This page is temporarily unavailable/;

test.describe('failure paths', () => {
  test('an unknown feature key produces a controlled fallback', async ({ page }) => {
    await replaceHostMarkup(page, { 'data-angular-feature="pricing-search"': 'data-angular-feature="unknown"' });

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    await expect(page.getByRole('alert')).toContainText(/Reference: loader-/);
  });

  test('a mismatched custom-element tag produces a controlled fallback', async ({ page }) => {
    await replaceHostMarkup(page, {
      '<ca-pricing-search': '<ca-wrong-element',
      '</ca-pricing-search>': '</ca-wrong-element>',
    });

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
  });

  test('a foreign custom-element definition is rejected as a collision', async ({ page }) => {
    await page.addInitScript(() => {
      customElements.define('ca-pricing-search', class extends HTMLElement {});
    });

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
  });
});
