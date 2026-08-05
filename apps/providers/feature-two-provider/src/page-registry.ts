import type { PageDefinition } from '@company/shared-core';

/**
 * Which pages this deployment unit contains. Each entry is a dynamic import,
 * so a page's code is downloaded only when that page is the one requested.
 *
 * Kept in its own module so the descriptor/registry consistency test can read
 * the keys without pulling in registration logic.
 */
export const PAGE_REGISTRY: Record<string, () => Promise<PageDefinition>> = {
  'ca-feature-two': async () => (await import('@company/features/feature-two')).FEATURE_TWO_PAGE,
};
