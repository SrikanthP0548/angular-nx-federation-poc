import { InjectionToken } from '@angular/core';

/**
 * The legacy application's entry point, loaded into the host iframe.
 *
 * Root-relative by design: from `/AngularShell/`, a relative `default.asp`
 * would resolve against the current path and load `/AngularShell/default.asp`
 * instead of the legacy application. See ANGULAR_APP_SHELL_ARCHITECTURE.md §9.
 */
export const DEFAULT_LEGACY_ENTRY_URL = '/default.asp';
export const LEGACY_PATH_QUERY_PARAMETER = 'path';

/**
 * Reads the requested legacy page from the container URL. URLSearchParams
 * performs the one required decoding pass; decoding the value again would
 * turn encoded input into a different URL and weaken validation.
 *
 * Duplicate path parameters are ambiguous and intentionally return an
 * invalid value so the component's existing validation/fallback path handles
 * them like any other unsafe request.
 */
export function legacyEntryUrlFromSearch(search: string): string {
  const requestedPaths = new URLSearchParams(search).getAll(
    LEGACY_PATH_QUERY_PARAMETER,
  );
  if (requestedPaths.length === 0) {
    return DEFAULT_LEGACY_ENTRY_URL;
  }
  return requestedPaths.length === 1 ? requestedPaths[0] : '';
}

/**
 * Injected so tests can override it without touching the component. Runtime
 * values from the query string are still treated as untrusted and pass
 * through `isValidLegacyEntryUrl` before they become an iframe resource URL.
 */
export const LEGACY_ENTRY_URL = new InjectionToken<string>('LEGACY_ENTRY_URL', {
  providedIn: 'root',
  factory: () => legacyEntryUrlFromSearch(window.location.search),
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
export function isValidLegacyEntryUrl(
  value: string,
  origin: string = window.location.origin,
): boolean {
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
  const normalizedPath = resolved.pathname.toLowerCase();
  if (
    normalizedPath === '/angularshell' ||
    normalizedPath.startsWith('/angularshell/')
  ) {
    return false;
  }
  const canonical = resolved.pathname + resolved.search + resolved.hash;
  return canonical === value;
}

export function legacyUrlFromLocation(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): string {
  return location.pathname + location.search + location.hash;
}

/**
 * Produces a same-document container URL for history.replaceState. Other
 * query parameters and the container fragment are preserved. The default
 * legacy landing page keeps the clean `/AngularShell/` URL.
 */
export function containerUrlForLegacyPath(
  containerHref: string,
  legacyPath: string,
): string {
  const containerUrl = new URL(containerHref);
  if (legacyPath === DEFAULT_LEGACY_ENTRY_URL) {
    containerUrl.searchParams.delete(LEGACY_PATH_QUERY_PARAMETER);
  } else {
    containerUrl.searchParams.set(LEGACY_PATH_QUERY_PARAMETER, legacyPath);
  }
  return containerUrl.pathname + containerUrl.search + containerUrl.hash;
}
