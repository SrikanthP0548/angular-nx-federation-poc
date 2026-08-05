import { CustomerPricing, PricingItem } from './pricing-models';

function withNetPrice(item: Omit<PricingItem, 'netPrice'>): PricingItem {
  return {
    ...item,
    netPrice: Math.round(item.listPrice * (1 - item.discountPercent / 100) * 100) / 100,
  };
}

/**
 * In-memory fixtures. A JSON file inside a library is not copied into a
 * provider's build output without per-provider asset configuration, so the
 * data lives in TypeScript.
 */
const CUSTOMERS: Record<string, CustomerPricing> = {
  '1001': {
    customerId: '1001',
    customerName: 'Northwind Trading Ltd',
    currency: 'USD',
    effectiveDate: '2026-08-01',
    items: [
      withNetPrice({ productCode: 'FX-SPOT', description: 'FX Spot Execution', listPrice: 1250.0, discountPercent: 10 }),
      withNetPrice({ productCode: 'FX-FWD', description: 'FX Forward Contract', listPrice: 2100.5, discountPercent: 5 }),
      withNetPrice({ productCode: 'IRS-10Y', description: 'Interest Rate Swap 10Y', listPrice: 8750.0, discountPercent: 12.5 }),
      withNetPrice({ productCode: 'CDS-5Y', description: 'Credit Default Swap 5Y', listPrice: 6400.0, discountPercent: 0 }),
    ],
  },
  '1002': {
    customerId: '1002',
    customerName: 'Contoso Capital Partners',
    currency: 'EUR',
    effectiveDate: '2026-08-01',
    items: [
      withNetPrice({ productCode: 'EQ-CASH', description: 'Equity Cash Execution', listPrice: 940.0, discountPercent: 15 }),
      withNetPrice({ productCode: 'EQ-OPT', description: 'Equity Options Clearing', listPrice: 3300.75, discountPercent: 7.5 }),
    ],
  },
};

export function findCustomerPricing(customerId: string): CustomerPricing | undefined {
  return CUSTOMERS[customerId];
}
