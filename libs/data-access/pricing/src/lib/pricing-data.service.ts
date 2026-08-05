import { Injectable, Provider } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CustomerPricing } from './pricing-models';
import { findCustomerPricing } from './pricing-fixtures';

/**
 * Data access shared by both pricing pages.
 *
 * Deliberately not `providedIn: 'root'` — it is provided by the page injector
 * created during registration, so its lifetime matches the page's rather than
 * the shell's.
 */
@Injectable()
export class PricingDataService {
  getCustomerPricing(customerId: string): Observable<CustomerPricing> {
    const pricing = findCustomerPricing(customerId);
    return pricing
      ? of(pricing)
      : throwError(() => new Error(`No pricing profile exists for customer ${customerId}`));
  }
}

/**
 * Providers a page declares when it needs pricing data. Keeping the provider
 * strategy inside the data-access library means a page never hard-codes how
 * the service is constructed.
 */
export function providePricingData(): Provider[] {
  return [PricingDataService];
}
