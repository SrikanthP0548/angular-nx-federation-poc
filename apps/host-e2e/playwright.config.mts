import { defineConfig, devices } from '@playwright/test';

/**
 * Architecture tests run against the host simulator serving PUBLISHED
 * artifacts, not against a dev server. The dev build is unsplit and unhashed
 * and served from a different origin, so testing it would prove something
 * other than what ships.
 *
 * Browsers are pinned to the installed Chrome and Edge channels rather than
 * Playwright's bundled Chromium, because those are the browsers the target
 * environment runs. If a channel is not installed its project fails to launch,
 * which is the correct outcome — a silent fall back to Chromium would report
 * a pass for a browser that was never exercised.
 */
const baseURL = process.env['BASE_URL'] || 'http://localhost:44300';

export default defineConfig({
  testDir: './src',
  // container-e2e/ and real-iis-e2e/ each have their own config
  // (playwright.container.config.mts) and CI job: they exercise
  // legacy-container and, opt-in via EXTERNAL_BASE_URL, a real IIS box —
  // published/reached independently of `npm run release`. Without this,
  // testDir's default recursion would silently fold those specs into this
  // suite's result, changing what "green" means here for anyone who hasn't
  // published the container or pointed at a real IIS host — exactly what
  // keeping them isolated is for.
  testIgnore: ['**/container-e2e/**', '**/real-iis-e2e/**'],
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: 1,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    // Every spec asserts on what the network actually delivered, so a warm
    // cache would silently invalidate the singleton and lazy-loading claims.
    launchOptions: { args: ['--disable-application-cache'] },
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  webServer: {
    command: 'node tools/host-simulator/server.js',
    url: `${baseURL}/ui/manifest.json`,
    cwd: new URL('../..', import.meta.url).pathname,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
