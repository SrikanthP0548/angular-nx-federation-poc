import { createFederatedFeature } from '@company/shared-core';

/** Exposed as './pricing-details'. See pricing-search.register.ts for why. */
export default createFederatedFeature({
  'ca-pricing-details': async () => (await import('@company/features/pricing-details')).PRICING_DETAILS_PAGE,
});
