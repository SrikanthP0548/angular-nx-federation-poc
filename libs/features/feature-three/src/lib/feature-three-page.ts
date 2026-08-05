import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { PLATFORM_LOGGER, RUNTIME_CONFIG } from '@company/shared-core';

/**
 * A third migrated page in a third provider.
 *
 * Tracer string: "Counterparty limits".
 */
@Component({
  selector: 'feature-three-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <h1>Counterparty limits</h1>
      <p>Desk: {{ desk() || 'unassigned' }}</p>
      <p class="env">Resolved from the shell injector — environment: {{ environment }}</p>
    </section>
  `,
  styles: `
    .page { font-family: system-ui, sans-serif; max-width: 40rem; margin: 1rem; }
    h1 { font-size: 1.4rem; }
    .env { color: #555; font-size: 0.875rem; }
  `,
})
export class FeatureThreePage {
  readonly desk = input<string>('');

  private readonly config = inject(RUNTIME_CONFIG);
  private readonly logger = inject(PLATFORM_LOGGER);

  protected readonly environment = this.config.environment;

  constructor() {
    this.logger.event('feature.page.ready', { page: 'feature-three' });
  }
}
