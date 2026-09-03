import type { PlatformLogger } from '@company/platform-core';

/** Console telemetry mirrored to the host document as DOM events. */
export class ConsolePlatformLogger implements PlatformLogger {
  event(name: string, data?: Record<string, unknown>): void {
    console.info(`[telemetry] ${name}`, data ?? {});
    window.dispatchEvent(new CustomEvent('loader-telemetry', { detail: { name, data } }));
  }

  error(name: string, error: unknown, data?: Record<string, unknown>): void {
    console.error(`[telemetry] ${name}`, error, data ?? {});
    window.dispatchEvent(
      new CustomEvent('loader-telemetry', { detail: { name, error: String(error), data } })
    );
  }
}
