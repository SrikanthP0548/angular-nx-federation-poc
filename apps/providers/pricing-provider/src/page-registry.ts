import type { PageDefinition } from '@company/shared-core';

/**
 * Which pages this deployment unit contains — the late-binding seam of the
 * whole architecture.
 *
 * Page libraries know nothing about which provider ships them, so moving a
 * page to a different provider is a one-line change here plus a manifest
 * entry. That is what keeps page count from driving app count.
 *
 * Each entry is a dynamic import, so loading `ca-pricing-search` never
 * downloads the details page's code. Converting any of these to a static
 * import would silently reunify the pages into one chunk.
 *
 * Kept in its own module so the descriptor/registry consistency test can read
 * the keys without pulling in registration logic.
 */
export const PAGE_REGISTRY: Record<string, () => Promise<PageDefinition>> = {
  'ca-pricing-search': async () => (await import('@company/features/pricing-search')).PRICING_SEARCH_PAGE,
  'ca-pricing-details': async () => (await import('@company/features/pricing-details')).PRICING_DETAILS_PAGE,
};
