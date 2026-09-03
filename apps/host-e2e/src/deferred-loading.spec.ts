import { expect, test } from '@playwright/test';
import { ScriptRecorder, TRACERS } from './support';

test.describe('deferred Angular loading', () => {
  test('an unmigrated page downloads only the framework-free loader', async ({ page }) => {
    const scripts = new ScriptRecorder(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /javascript downloaded/i })).toBeVisible();
    await scripts.settled();

    expect(scripts.urls.map((url) => new URL(url).pathname)).toEqual(['/ui/current/main.js']);
    const [loader] = await scripts.settled();
    expect(loader.text.length, 'the framework-free loader must remain small').toBeLessThan(10_000);
    for (const tracer of Object.values(TRACERS)) {
      expect(await scripts.containing(tracer)).toEqual([]);
    }
  });

  test('opening a feature downloads only that page implementation', async ({ page }) => {
    await page.goto('/');
    const scripts = new ScriptRecorder(page);

    await page.getByRole('link', { name: TRACERS['pricing-search'] }).first().click();
    await expect(page.getByRole('heading', { name: TRACERS['pricing-search'] })).toBeVisible();

    expect(await scripts.containing(TRACERS['pricing-search'])).toHaveLength(1);
    expect(await scripts.containing(TRACERS['pricing-details'])).toEqual([]);
    expect(await scripts.containing(TRACERS['feature-two'])).toEqual([]);
    expect(await scripts.containing(TRACERS['feature-three'])).toEqual([]);
  });

  test('no runtime manifest or federation metadata is requested', async ({ page }) => {
    const forbidden: string[] = [];
    page.on('request', (request) => {
      if (/manifest\.json|remoteEntry\.json|importmap\.json/.test(request.url())) {
        forbidden.push(request.url());
      }
    });

    await page.goto('/feature-two.html');
    await expect(page.getByRole('heading', { name: TRACERS['feature-two'] })).toBeVisible();
    expect(forbidden).toEqual([]);
  });
});
