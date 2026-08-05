import { expect, test } from '@playwright/test';
import { withManifest } from './support';

/**
 * Every failure below must produce the shell's controlled fallback with a
 * trace id, never a blank page. A blank page is the failure mode that costs
 * hours in production, because nothing points at which layer broke.
 */
const FALLBACK = /This page is temporarily unavailable/;

test.describe('failure paths', () => {
  test('an unknown feature key is rejected', async ({ page }) => {
    await withManifest(page, (m) => delete m.features['pricing-search']);
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    expect(errors.join('\n')).toMatch(/unknown feature key "pricing-search"/);
  });

  test('a disabled feature is rejected', async ({ page }) => {
    await withManifest(page, (m) => (m.features['pricing-search'].enabled = false));
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    expect(errors.join('\n')).toMatch(/feature.disabled/);
  });

  test('an incompatible contract is rejected before the provider is contacted', async ({ page }) => {
    await withManifest(page, (m) => (m.features['pricing-search'].contractVersion = '2.x'));
    const providerRequests: string[] = [];
    page.on('request', (r) => r.url().includes('/ui/pricing/') && providerRequests.push(r.url()));

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    // The gate exists to reject BEFORE fetching provider code, so an
    // incompatible artifact never executes.
    expect(providerRequests, 'no provider request may be made for an incompatible feature').toEqual([]);
  });

  test('an unreachable provider produces the fallback, not a blank page', async ({ page }) => {
    await withManifest(page, (m) => (m.features['pricing-search'].remoteEntry = '/ui/pricing/9.9.9/remoteEntry.json'));

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    await expect(page.getByRole('alert')).toContainText(/Reference: /);
  });

  test('an unsupported manifest schema is rejected', async ({ page }) => {
    await withManifest(page, (m) => (m.schemaVersion = '99.0'));
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

    await page.goto('/pricing-search.html');

    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    expect(errors.join('\n')).toMatch(/unsupported schemaVersion/);
  });

  test('a foreign custom element is reported as a collision', async ({ page }) => {
    // Something else in the document claimed the tag first. Silently accepting
    // it would render the wrong page implementation.
    await page.addInitScript(() => {
      customElements.define('ca-pricing-search', class extends HTMLElement {});
    });
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));

    await page.goto('/pricing-search.html');

    // Wait for the fallback before reading the console: the shell's startup is
    // asynchronous and completes well after the load event, so asserting on
    // console output straight after goto() races it and reads an empty array.
    await expect(page.getByRole('alert')).toContainText(FALLBACK);
    expect(errors.join('\n')).toMatch(/collision.*already registered outside this provider/s);
  });
});
