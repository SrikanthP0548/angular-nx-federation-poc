import fs from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';

/**
 * Authenticates only remote real-IIS runs through the harness Landing page.
 * The resulting Forms Auth and StateServer session cookies are reused by the
 * existing container specs. Local simulator runs never execute this setup.
 */
export default async function authenticateExternalHarness(): Promise<void> {
  const baseURL = process.env['EXTERNAL_BASE_URL']?.replace(/\/$/, '');
  if (!baseURL) return;

  const statePath = path.resolve(
    process.cwd(),
    'test-results/external-iis-auth.json',
  );
  fs.mkdirSync(path.dirname(statePath), { recursive: true });

  const api = await request.newContext({ baseURL });
  try {
    const response = await api.post('/Landing.aspx', {
      form: {
        username: 'e2e-user',
        roles: 'pricing.view',
      },
    });

    if (!response.ok() || !response.url().includes('/AngularShell/')) {
      throw new Error(
        `External harness login failed: HTTP ${response.status()} at ${response.url()}`,
      );
    }

    await api.storageState({ path: statePath });
  } finally {
    await api.dispose();
  }
}
