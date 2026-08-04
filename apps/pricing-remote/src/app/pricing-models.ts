/** Angular-facing DTOs for the pricing page (doc section 9.2, step 2). */
export interface PricingItem {
  productCode: string;
  description: string;
  listPrice: number;
  discountPercent: number;
  netPrice: number;
}

export interface PricingResponse {
  customerId: string;
  customerName: string;
  currency: string;
  effectiveDate: string;
  items: PricingItem[];
}
