import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DEFAULT_LEGACY_ENTRY_URL, isValidLegacyEntryUrl, LEGACY_ENTRY_URL } from './legacy-entry-url';
import { emitTelemetry } from './telemetry';

/**
 * Hosts the existing ASP/ASPX application inside a same-origin iframe.
 *
 * This is the entire Phase-1 scope: no header, navigation, authentication,
 * federation wiring, or iframe/browser URL synchronization. See
 * ANGULAR_APP_SHELL_ARCHITECTURE.md §8-9.
 */
@Component({
  selector: 'app-legacy-application-host',
  templateUrl: './legacy-application-host.component.html',
  styleUrl: './legacy-application-host.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyApplicationHostComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly requestedUrl = inject(LEGACY_ENTRY_URL);

  /**
   * Falls back to the known-safe default rather than trusting an invalid
   * injected value. A DI override that fails validation is a configuration
   * bug, not a reason to frame an unintended origin — but a silent fallback
   * would hide that bug indefinitely, so it's reported.
   */
  protected readonly legacyUrl: string = this.resolveLegacyUrl();

  private resolveLegacyUrl(): string {
    if (isValidLegacyEntryUrl(this.requestedUrl)) {
      return this.requestedUrl;
    }
    emitTelemetry('legacy-container.invalid-entry-url', {
      requested: this.requestedUrl,
      fallback: DEFAULT_LEGACY_ENTRY_URL,
    });
    return DEFAULT_LEGACY_ENTRY_URL;
  }

  /**
   * `iframe[src]` is a RESOURCE_URL sanitization context: Angular refuses a
   * plain string here. Trusting it is safe only because `legacyUrl` above
   * has already been validated as root-relative and same-origin.
   */
  protected readonly legacyUrlSafe: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.legacyUrl);
}
