export interface PricingItem {
  productCode: string;
  description: string;
  listPrice: number;
  discountPercent: number;
  netPrice: number;
}

export interface CustomerPricing {
  customerId: string;
  customerName: string;
  currency: string;
  effectiveDate: string;
  items: PricingItem[];
}
