/**
 * The single definition of what is shared across federation artifacts.
 *
 * Imported by the shell's federation config, every provider's federation
 * config, and tools/verify-bundle.mjs. One definition with five consumers, so
 * the shell and the providers cannot drift out of agreement — a one-sided
 * allowlist produces a silently duplicated module rather than an error.
 */

/**
 * npm packages shared as singletons. `shareAll()` is deliberately not used:
 * it derives the list from package.json at build time, so the set of shared
 * framework packages could change without anyone editing a config.
 */
export const SHARED_PACKAGES = Object.freeze([
  '@angular/core',
  '@angular/common',
  '@angular/platform-browser',
  '@angular/elements',
  'rxjs',
]);

/**
 * Workspace libraries shared as singletons — an allowlist, never a wildcard.
 *
 * Native Federation turns EVERY `tsconfig.base.json` path entry into a shared
 * mapping when `sharedMappings` is unset, so without this list each feature
 * library silently becomes a strict-version singleton pinned to the root
 * package.json version.
 *
 * Only shared-core belongs here, and it must stay here: its InjectionToken
 * objects are compared by identity, so a second copy makes every
 * `inject(RUNTIME_CONFIG)` inside a provider throw NullInjectorError at first
 * render — from a completely clean build. Feature and data-access libraries
 * are bundled into their provider instead; nothing outside a provider holds a
 * reference to them, so there is no identity to preserve.
 */
export const SHARED_MAPPINGS = Object.freeze(['@company/shared-core']);

/** Shared-dependency options applied to every entry in SHARED_PACKAGES. */
export const SHARED_PACKAGE_OPTIONS = Object.freeze({
  singleton: true,
  strictVersion: true,
  requiredVersion: 'auto',
  build: 'package',
});

/** Builds the `shared` map for a `withNativeFederation` config. */
export function sharedPackages() {
  return Object.fromEntries(
    SHARED_PACKAGES.map((name) => [
      name,
      name === '@angular/core'
        ? // Secondary entry points of @angular/core must all resolve to the
          // same instance, so they are kept rather than pruned as unused.
          { ...SHARED_PACKAGE_OPTIONS, includeSecondaries: { keepAll: true } }
        : { ...SHARED_PACKAGE_OPTIONS },
    ])
  );
}
