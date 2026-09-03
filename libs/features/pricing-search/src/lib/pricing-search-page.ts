import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PLATFORM_LOGGER } from '@company/platform-core';
import { CustomerPricing, PricingDataService } from '@company/data-access/pricing';

/**
 * The pricing search page.
 *
 * The selector is deliberately NOT the custom-element tag this page is
 * registered under (`ca-pricing-search`). If they matched, Angular could
 * instantiate the component itself while the browser also upgrades the tag,
 * rendering it twice.
 *
 * "Customer pricing search" is this page's tracer string — the E2E specs
 * assert it never appears in any chunk downloaded by the details page.
 */
@Component({
  selector: 'feature-pricing-search-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="page">
      <h1>Customer pricing search</h1>

      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      } @else if (pricing(); as data) {
        <p class="meta">
          <span>{{ data.customerName }} ({{ data.customerId }})</span>
          <span>Effective {{ data.effectiveDate | date: 'mediumDate' }}</span>
        </p>
        <table>
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Description</th>
              <th scope="col" class="num">List price</th>
              <th scope="col" class="num">Discount</th>
              <th scope="col" class="num">Net price</th>
            </tr>
          </thead>
          <tbody>
            @for (item of data.items; track item.productCode) {
              <tr>
                <td>{{ item.productCode }}</td>
                <td>{{ item.description }}</td>
                <td class="num">{{ item.listPrice | currency: data.currency }}</td>
                <td class="num">{{ item.discountPercent }}%</td>
                <td class="num">{{ item.netPrice | currency: data.currency }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: `
    .page { font-family: system-ui, sans-serif; max-width: 52rem; margin: 1rem; }
    h1 { font-size: 1.4rem; }
    .meta { display: flex; gap: 1.5rem; color: #555; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    .num { text-align: right; }
    .error {
      border: 1px solid #d33; border-radius: 6px; background: #fdf3f3;
      color: #611; padding: 1rem;
    }
  `,
})
export class PricingSearchPage {
  /** Set by the host page as the `customer-id` attribute. */
  readonly customerId = input<string>('');

  private readonly data = inject(PricingDataService);
  private readonly logger = inject(PLATFORM_LOGGER);

  protected readonly pricing = signal<CustomerPricing | null>(null);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.customerId();
      if (id) {
        this.load(id);
      }
    });
  }

  private load(customerId: string): void {
    this.error.set(null);
    this.data.getCustomerPricing(customerId).subscribe({
      next: (pricing) => {
        this.pricing.set(pricing);
        this.logger.event('feature.page.ready', { page: 'pricing-search', customerId });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.logger.error('feature.page.failed', err, { page: 'pricing-search', customerId });
      },
    });
  }
}
