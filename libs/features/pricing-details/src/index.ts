import { PageDefinition } from '@company/platform-core';
import { providePricingData } from '@company/data-access/pricing';
import { PricingDetailsPage } from './lib/pricing-details-page';

/** The library's entire public API: one page definition. */
export const PRICING_DETAILS_PAGE: PageDefinition = {
  component: PricingDetailsPage,
  providers: [providePricingData()],
};
