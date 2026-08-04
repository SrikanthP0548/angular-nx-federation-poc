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
 *
 * The trade-off is that secondary entry points must be enumerated. A shared
 * bundle's own static imports have to resolve through the import map, and a
 * missing one is not a build error — it surfaces at runtime as
 * "Unable to resolve specifier". `@angular/common/http` is listed because the
 * shared `@angular/platform-browser` bundle imports it for its transfer-cache
 * code path, even in an app that never uses HttpClient.
 */
export const SHARED_PACKAGES = Object.freeze([
  '@angular/core',
  '@angular/common',
  '@angular/common/http',
  '@angular/platform-browser',
  '@angular/elements',
  'rxjs',
  // Imported by the shared @angular/core, @angular/common/http and
  // @angular/elements bundles. `includeSecondaries` does not pick it up for a
  // non-Angular package, so it is listed explicitly.
  'rxjs/operators',
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

/**
 * Packages whose secondary entry points must all be shared.
 *
 * A shared bundle's own static imports resolve through the import map, so a
 * secondary entry point that is pruned as "unused" still breaks at runtime if
 * another shared bundle imports it — `@angular/platform-browser` imports
 * `@angular/common/http`, and `@angular/core` imports `rxjs/operators`, in
 * code paths this app never executes. Pruning is by usage in *app* code,
 * which is the wrong question.
 *
 * tools/verify-bundle.mjs turns the resulting failure mode into a build gate
 * by checking every bare specifier in the shared bundles against the import map.
 */
const KEEP_ALL_SECONDARIES = new Set(['@angular/core', '@angular/common', 'rxjs']);

/** Builds the `shared` map for a `withNativeFederation` config. */
export function sharedPackages() {
  return Object.fromEntries(
    SHARED_PACKAGES.map((name) => [
      name,
      KEEP_ALL_SECONDARIES.has(name)
        ? { ...SHARED_PACKAGE_OPTIONS, includeSecondaries: { keepAll: true } }
        : { ...SHARED_PACKAGE_OPTIONS },
    ])
  );
}
