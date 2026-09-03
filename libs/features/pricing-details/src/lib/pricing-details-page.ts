import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { PLATFORM_LOGGER } from '@company/platform-core';
import { CustomerPricing, PricingDataService } from '@company/data-access/pricing';

/**
 * The pricing detail page — a single product line for one customer.
 *
 * Deployed in the same provider artifact as the search page, but in its own
 * library and its own lazily-imported chunk. "Product pricing detail" is this
 * page's tracer string; the E2E specs assert it never appears in any chunk
 * downloaded by the search page.
 */
@Component({
  selector: 'feature-pricing-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, PercentPipe],
  template: `
    <section class="page">
      <h1>Product pricing detail</h1>

      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      } @else if (item(); as line) {
        <dl>
          <dt>Customer</dt>
          <dd>{{ pricing()?.customerName }} ({{ customerId() }})</dd>
          <dt>Product</dt>
          <dd>{{ line.productCode }} — {{ line.description }}</dd>
          <dt>List price</dt>
          <dd>{{ line.listPrice | currency: currency() }}</dd>
          <dt>Discount</dt>
          <dd>{{ line.discountPercent / 100 | percent: '1.0-2' }}</dd>
          <dt>Net price</dt>
          <dd class="net">{{ line.netPrice | currency: currency() }}</dd>
        </dl>
      }
    </section>
  `,
  styles: `
    .page { font-family: system-ui, sans-serif; max-width: 40rem; margin: 1rem; }
    h1 { font-size: 1.4rem; }
    dl { display: grid; grid-template-columns: 10rem 1fr; gap: 0.5rem 1rem; }
    dt { color: #555; }
    dd { margin: 0; font-weight: 500; }
    .net { font-size: 1.15rem; }
    .error {
      border: 1px solid #d33; border-radius: 6px; background: #fdf3f3;
      color: #611; padding: 1rem;
    }
  `,
})
export class PricingDetailsPage {
  /** Set by the host page as `customer-id` and `product-code` attributes. */
  readonly customerId = input<string>('');
  readonly productCode = input<string>('');

  private readonly data = inject(PricingDataService);
  private readonly logger = inject(PLATFORM_LOGGER);

  protected readonly pricing = signal<CustomerPricing | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly currency = computed(() => this.pricing()?.currency ?? 'USD');
  protected readonly item = computed(() =>
    this.pricing()?.items.find((i) => i.productCode === this.productCode())
  );

  constructor() {
    effect(() => {
      const id = this.customerId();
      if (id) {
        this.load(id);
      }
    });

    // A valid customer with an unknown product is a distinct failure from an
    // unknown customer, and reads as a blank page unless reported.
    effect(() => {
      if (this.pricing() && this.productCode() && !this.item()) {
        this.error.set(`No pricing line for product ${this.productCode()}`);
      }
    });
  }

  private load(customerId: string): void {
    this.error.set(null);
    this.data.getCustomerPricing(customerId).subscribe({
      next: (pricing) => {
        this.pricing.set(pricing);
        this.logger.event('feature.page.ready', { page: 'pricing-details', customerId });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.logger.error('feature.page.failed', err, { page: 'pricing-details', customerId });
      },
    });
  }
}
