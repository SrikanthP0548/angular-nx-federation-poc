import { InjectionToken } from '@angular/core';

/**
 * The legacy application's entry point, loaded into the host iframe.
 *
 * Root-relative by design: from `/AngularShell/`, a relative `default.asp`
 * would resolve against the current path and load `/AngularShell/default.asp`
 * instead of the legacy application. See ANGULAR_APP_SHELL_ARCHITECTURE.md §9.
 */
export const DEFAULT_LEGACY_ENTRY_URL = '/default.asp';

/**
 * Injected rather than hard-coded so tests can override it without touching
 * the component. Production code must not wire this to a query parameter or
 * any other unrestricted runtime input — see `isValidLegacyEntryUrl` for why.
 */
export const LEGACY_ENTRY_URL = new InjectionToken<string>('LEGACY_ENTRY_URL', {
  providedIn: 'root',
  factory: () => DEFAULT_LEGACY_ENTRY_URL,
});

/**
 * Guards against the value ever becoming a disguised cross-origin iframe
 * target, should a runtime-configurable source (query string, remote config)
 * be introduced later. Every check below defeats a specific bypass:
 *
 * - a value that doesn't start with exactly one "/" rejects both relative
 *   paths (which would resolve against the wrong base) and protocol-relative
 *   URLs like "//evil.com" (which look root-relative but load a foreign
 *   origin).
 * - resolving against `window.location.origin` and comparing `origin` back
 *   catches absolute URLs, and browser-specific quirks such as backslashes
 *   being treated as path separators for special schemes.
 * - re-serializing the resolved URL and comparing it to the original input
 *   catches dot-segment and encoded-dot-segment normalization tricks
 *   (e.g. "/%2e%2e/evil") that leave the origin unchanged but the
 *   effective path different from what was supplied.
 */
export function isValidLegacyEntryUrl(value: string, origin: string = window.location.origin): boolean {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return false;
  }
  let resolved: URL;
  try {
    resolved = new URL(value, origin);
  } catch {
    return false;
  }
  if (resolved.origin !== origin) {
    return false;
  }
  const canonical = resolved.pathname + resolved.search + resolved.hash;
  return canonical === value;
}
