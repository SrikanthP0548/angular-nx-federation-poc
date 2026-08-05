import type { Page, Response } from '@playwright/test';

/** Tracer strings, each unique to one feature library's template. */
export const TRACERS = {
  'pricing-search': 'Customer pricing search',
  'pricing-details': 'Product pricing detail',
  'feature-two': 'Settlement instructions',
  'feature-three': 'Counterparty limits',
} as const;

export const SHELL_PATH = '/ui/shell/current/';

/**
 * Records the body of every JavaScript response, so assertions can be made on
 * what was actually delivered.
 *
 * Filenames prove nothing here: federation chunks are content-hashed
 * anonymous names regardless of `outputHashing`, so "did this page download
 * the other page's code" can only be answered by looking inside the bodies.
 */
export class ScriptRecorder {
  readonly urls: string[] = [];
  private readonly bodies: Array<Promise<{ url: string; text: string }>> = [];

  constructor(page: Page) {
    page.on('response', (response: Response) => {
      const url = response.url();
      if (!url.endsWith('.js')) return;
      this.urls.push(url);
      this.bodies.push(
        response
          .text()
          .then((text) => ({ url, text }))
          .catch(() => ({ url, text: '' }))
      );
    });
  }

  async settled() {
    return Promise.all(this.bodies);
  }

  /** URLs matching a substring, e.g. '/ui/pricing/'. */
  matching(fragment: string) {
    return this.urls.filter((u) => u.includes(fragment));
  }

  async containing(needle: string) {
    return (await this.settled()).filter((r) => r.text.includes(needle)).map((r) => r.url);
  }
}

/**
 * Serves a modified manifest for one navigation, so failure paths can be
 * exercised without mutating published state.
 */
export async function withManifest(page: Page, mutate: (manifest: any) => void) {
  await page.route('**/ui/manifest.json', async (route) => {
    const response = await route.fetch();
    const manifest = await response.json();
    mutate(manifest);
    await route.fulfill({ json: manifest });
  });
}
