import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * A deliberately separate Playwright config from playwright.config.mts, not
 * an extra `testMatch` on it: legacy-container is published independently
 * (`npm run release:container`, never `npm run release`), so its readiness
 * probe and failure mode are different from the federation suite's, and a
 * failure here must never read as a federation regression. See "Add a
 * separate CI job" in ANGULAR_SHELL_COEXISTENCE_PLAN.md §3/§7.
 *
 * Same host simulator, same origin, same webServer reuse story — this is the
 * combined-flow proof, not a second application.
 */
const externalBaseURL = process.env['EXTERNAL_BASE_URL']?.replace(/\/$/, '');
const baseURL =
  externalBaseURL || process.env['BASE_URL'] || 'http://localhost:44300';
const externalAuthState = path.resolve(
  process.cwd(),
  'test-results/external-iis-auth.json',
);

export default defineConfig({
  testDir: './src',
  testMatch: externalBaseURL
    ? ['**/container-e2e/*.spec.ts', '**/real-iis-e2e/*.spec.ts']
    : '**/container-e2e/*.spec.ts',
  // External IIS is opt-in. Its real Forms Authentication flow is seeded
  // once into storage state; local simulator runs remain anonymous and
  // behave exactly as they did before this harness existed.
  globalSetup: externalBaseURL
    ? path.resolve(
        process.cwd(),
        'apps/host-e2e/src/container-e2e/external-auth.setup.ts',
      )
    : undefined,
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: 1,
  reporter: process.env['CI']
    ? [
        ['list'],
        [
          'html',
          { open: 'never', outputFolder: 'playwright-report-container' },
        ],
      ]
    : [['list']],
  use: {
    baseURL,
    storageState: externalBaseURL ? externalAuthState : undefined,
    trace: 'on-first-retry',
    launchOptions: { args: ['--disable-application-cache'] },
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'node tools/host-simulator/server.js',
        // Unlike /ui/manifest.json (tracked in git), /AngularShell/ only
        // exists once `npm run release:container` has published it — an
        // unpublished container fails this probe clearly instead of every
        // test failing separately against a 404.
        url: `${baseURL}/AngularShell/`,
        cwd: new URL('../..', import.meta.url).pathname,
        reuseExistingServer: !process.env['CI'],
        timeout: 30_000,
      },
});
