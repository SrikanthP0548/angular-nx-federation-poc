import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PLATFORM_LOGGER, RUNTIME_CONFIG } from '@company/platform-core';

/**
 * A second migrated page. It injects RUNTIME_CONFIG to prove that every lazy
 * page receives platform services from the loader-owned parent injector.
 *
 * Tracer string: "Settlement instructions".
 */
@Component({
  selector: 'feature-two-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Settlement instructions</h1>
      <p>Reference: {{ reference() || 'none supplied' }}</p>
      <p class="env">Resolved from the loader injector — environment: {{ environment }}</p>
    </section>
  `,
  styles: `
    .page { font-family: system-ui, sans-serif; max-width: 40rem; margin: 1rem; }
    h1 { font-size: 1.4rem; }
    .env { color: #555; font-size: 0.875rem; }
  `,
})
export class FeatureTwoPage {
  readonly reference = input<string>('');

  private readonly config = inject(RUNTIME_CONFIG);
  private readonly logger = inject(PLATFORM_LOGGER);

  protected readonly environment = this.config.environment;

  constructor() {
    this.logger.event('feature.page.ready', { page: 'feature-two' });
  }
}
