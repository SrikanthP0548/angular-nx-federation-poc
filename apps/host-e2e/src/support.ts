import type { Page, Response } from '@playwright/test';

export const TRACERS = {
  'pricing-search': 'Customer pricing search',
  'pricing-details': 'Product pricing detail',
  'feature-two': 'Settlement instructions',
  'feature-three': 'Counterparty limits',
} as const;

export const ASSET_PATH = '/ui/current/';

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

  settled() {
    return Promise.all(this.bodies);
  }

  async containing(needle: string) {
    return (await this.settled()).filter((response) => response.text.includes(needle)).map((response) => response.url);
  }
}

export async function replaceHostMarkup(page: Page, replacements: Record<string, string>) {
  await page.route('**/pricing-search.html*', async (route) => {
    const response = await route.fetch();
    let body = await response.text();
    for (const [from, to] of Object.entries(replacements)) body = body.replace(from, to);
    await route.fulfill({ response, body });
  });
}
