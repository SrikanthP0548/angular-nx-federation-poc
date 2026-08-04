import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { BffErrorResponse, PLATFORM_LOGGER } from '@company/angular-platform-contract';
import { PricingDataService } from '../pricing-data.service';
import { PricingResponse } from '../pricing-models';

/**
 * The migrated pricing page (doc section 7). Rendered as the custom element
 * defined in the runtime manifest (`ca-pricing-page`); the `customer-id`
 * attribute set by the ASPX host maps to the `customerId` input.
 */
@Component({
  selector: 'pricing-page-internal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe],
  template: `
    <section class="pricing">
      <h1>Customer pricing <span class="badge">v1.1</span></h1>

      @if (loading()) {
        <p class="state" role="status">Loading pricing…</p>
      } @else if (error(); as err) {
        <div class="state error" role="alert">
          <strong>{{ err.message }}</strong>
          @if (err.retryable) {
            <button type="button" (click)="reload()">Retry</button>
          }
          <code>Reference: {{ err.traceId }}</code>
        </div>
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
    .pricing {
      font-family: system-ui, sans-serif;
      max-width: 52rem;
      margin: 1rem;
    }
    h1 { font-size: 1.4rem; }
    .badge { font-size: 0.7rem; background: #0a7; color: #fff; padding: 0.15rem 0.45rem; border-radius: 999px; vertical-align: middle; }
    .meta { display: flex; gap: 1.5rem; color: #555; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border-bottom: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    .num { text-align: right; }
    .state { padding: 1rem 0; }
    .error {
      border: 1px solid #d33;
      border-radius: 6px;
      background: #fdf3f3;
      color: #611;
      padding: 1rem;
      display: grid;
      gap: 0.5rem;
      justify-items: start;
    }
  `,
})
export class PricingPage {
  /** Set by the ASPX host as the `customer-id` attribute (doc section 7.4). */
  readonly customerId = input<string>('');

  private readonly data = inject(PricingDataService);
  private readonly logger = inject(PLATFORM_LOGGER);

  protected readonly loading = signal(false);
  protected readonly pricing = signal<PricingResponse | null>(null);
  protected readonly error = signal<BffErrorResponse | null>(null);

  constructor() {
    effect(() => {
      const id = this.customerId();
      if (id) {
        this.load(id);
      }
    });
  }

  protected reload(): void {
    const id = this.customerId();
    if (id) {
      this.load(id);
    }
  }

  private load(customerId: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.data.getPricing(customerId).subscribe({
      next: (response) => {
        this.pricing.set(response);
        this.loading.set(false);
        this.logger.event('feature.page.ready', { page: 'pricing', customerId });
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        // The BFF returns the stable error contract (doc section 9.3);
        // anything else (network failure, proxy error) gets normalized here.
        const bffError: BffErrorResponse =
          err.error && typeof err.error === 'object' && 'code' in err.error
            ? (err.error as BffErrorResponse)
            : {
                traceId: `local-${Date.now().toString(36)}`,
                code: 'PRICING_NOT_AVAILABLE',
                message: 'Pricing data is currently unavailable.',
                retryable: true,
                validationErrors: [],
              };
        this.error.set(bffError);
        this.logger.error('feature.api.failed', err, { page: 'pricing', code: bffError.code });
      },
    });
  }
}
