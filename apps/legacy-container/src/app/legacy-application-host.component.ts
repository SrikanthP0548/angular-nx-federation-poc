import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  containerUrlForLegacyPath,
  DEFAULT_LEGACY_ENTRY_URL,
  isValidLegacyEntryUrl,
  LEGACY_ENTRY_URL,
  legacyUrlFromLocation,
} from './legacy-entry-url';
import { emitTelemetry } from './telemetry';

/**
 * Hosts the existing ASP/ASPX application inside a same-origin iframe.
 *
 * Navigation remains owned by the legacy application. The container mirrors
 * the current same-origin iframe URL into `?path=` so refresh can restore the
 * active legacy page without introducing Angular routes for legacy pages.
 */
@Component({
  selector: 'app-legacy-application-host',
  templateUrl: './legacy-application-host.component.html',
  styleUrl: './legacy-application-host.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyApplicationHostComponent implements OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly requestedUrl = inject(LEGACY_ENTRY_URL);
  private observedFrameWindow: Window | null = null;
  private readonly onSameDocumentNavigation = () =>
    this.syncContainerUrlFromFrame();

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
      fallback: DEFAULT_LEGACY_ENTRY_URL,
    });
    return DEFAULT_LEGACY_ENTRY_URL;
  }

  /**
   * `iframe[src]` is a RESOURCE_URL sanitization context: Angular refuses a
   * plain string here. Trusting it is safe only because `legacyUrl` above
   * has already been validated as root-relative and same-origin.
   */
  protected readonly legacyUrlSafe: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(this.legacyUrl);

  protected onLegacyFrameLoad(event: Event): void {
    const frame = event.currentTarget as HTMLIFrameElement | null;
    this.observeFrameWindow(frame?.contentWindow ?? null);
    this.syncContainerUrlFromFrame();
  }

  ngOnDestroy(): void {
    this.stopObservingFrameWindow();
  }

  private observeFrameWindow(frameWindow: Window | null): void {
    this.stopObservingFrameWindow();
    this.observedFrameWindow = frameWindow;
    if (!frameWindow) {
      return;
    }
    try {
      frameWindow.addEventListener('hashchange', this.onSameDocumentNavigation);
      frameWindow.addEventListener('popstate', this.onSameDocumentNavigation);
    } catch {
      this.observedFrameWindow = null;
      emitTelemetry('legacy-container.iframe-location-unavailable');
    }
  }

  private stopObservingFrameWindow(): void {
    if (!this.observedFrameWindow) {
      return;
    }
    try {
      this.observedFrameWindow.removeEventListener(
        'hashchange',
        this.onSameDocumentNavigation,
      );
      this.observedFrameWindow.removeEventListener(
        'popstate',
        this.onSameDocumentNavigation,
      );
    } catch {
      // A frame that became cross-origin cannot be inspected or detached.
    }
    this.observedFrameWindow = null;
  }

  private syncContainerUrlFromFrame(): void {
    if (!this.observedFrameWindow) {
      return;
    }

    let legacyPath: string;
    try {
      if (this.observedFrameWindow.location.href === 'about:blank') {
        return;
      }
      legacyPath = legacyUrlFromLocation(this.observedFrameWindow.location);
    } catch {
      emitTelemetry('legacy-container.iframe-location-unavailable');
      return;
    }

    if (!isValidLegacyEntryUrl(legacyPath)) {
      emitTelemetry('legacy-container.invalid-iframe-url');
      return;
    }

    const nextContainerUrl = containerUrlForLegacyPath(
      window.location.href,
      legacyPath,
    );
    const currentContainerUrl =
      window.location.pathname + window.location.search + window.location.hash;
    if (nextContainerUrl !== currentContainerUrl) {
      window.history.replaceState(window.history.state, '', nextContainerUrl);
    }
  }
}
