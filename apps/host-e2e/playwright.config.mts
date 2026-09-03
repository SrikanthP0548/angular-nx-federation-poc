import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env['BASE_URL'] || 'http://127.0.0.1:44300';

export default defineConfig({
  testDir: './src',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: 1,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    launchOptions: { args: ['--disable-application-cache'] },
  },
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
  webServer: {
    command: 'node tools/host-simulator/server.js',
    url: `${baseURL}/ui/current/main.js`,
    cwd: new URL('../..', import.meta.url).pathname,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
});
