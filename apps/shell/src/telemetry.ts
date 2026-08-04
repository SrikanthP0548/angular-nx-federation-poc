import type { PlatformLogger } from '@company/shared-core';

/**
 * Structured startup/telemetry events: shell.start, shell.manifest.loaded,
 * shell.remote.load.success, shell.feature.registered, ...
 *
 * Logs to the console and mirrors every event as a DOM CustomEvent so the
 * host page — or the E2E specs — can subscribe.
 */
export class ConsolePlatformLogger implements PlatformLogger {
  event(name: string, data?: Record<string, unknown>): void {
    console.info(`[telemetry] ${name}`, data ?? {});
    window.dispatchEvent(new CustomEvent('shell-telemetry', { detail: { name, data } }));
  }

  error(name: string, error: unknown, data?: Record<string, unknown>): void {
    console.error(`[telemetry] ${name}`, error, data ?? {});
    window.dispatchEvent(new CustomEvent('shell-telemetry', { detail: { name, error: String(error), data } }));
  }
}
