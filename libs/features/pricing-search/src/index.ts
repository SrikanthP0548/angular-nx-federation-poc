import { PageDefinition } from '@company/shared-core';
import { providePricingData } from '@company/data-access/pricing';
import { PricingSearchPage } from './lib/pricing-search-page';

/**
 * The library's entire public API: one page definition.
 *
 * The component class is deliberately not exported. A page's component is an
 * implementation detail, and exporting it invites the cross-page imports the
 * dependency boundaries exist to prevent.
 */
export const PRICING_SEARCH_PAGE: PageDefinition = {
  component: PricingSearchPage,
  providers: [providePricingData()],
};
