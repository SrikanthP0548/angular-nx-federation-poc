import { createFederatedFeature } from '@company/shared-core';

/**
 * Exposed as './pricing-search'. One exposed key, one page — the filename this
 * compiles to is derived from the exposes key itself (not this source file's
 * name), so the published artifact carries a self-descriptive
 * `pricing-search-<hash>.js` rather than a generic `register-<hash>.js`.
 */
export default createFederatedFeature({
  'ca-pricing-search': async () => (await import('@company/features/pricing-search')).PRICING_SEARCH_PAGE,
});
