/**
 * Minimal structured telemetry for legacy-container: a `console.warn`/`error`
 * plus a mirrored DOM CustomEvent, so a host page or an E2E spec can
 * subscribe without this app depending on anything beyond the platform.
 *
 * Deliberately a separate, distinctly-named event from the federation
 * shell's `shell-telemetry` (apps/shell/src/telemetry.ts) rather than a
 * shared import: legacy-container is intentionally non-federated (see the
 * type:container module-boundary constraint), and reusing the same event
 * name for a conceptually different app would make consumers guess which
 * schema a given event actually carries.
 */
const EVENT_NAME = 'legacy-container-telemetry';

export function emitTelemetry(name: string, data?: Record<string, unknown>): void {
  console.warn(`[legacy-container telemetry] ${name}`, data ?? {});
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { name, data } }));
}
