/**
 * Shell loader.
 *
 * This file is the stable entry script referenced by every host page. It must
 * stay free of runtime imports of shared packages:
 * native federation has to initialize the shared-dependency import map
 * BEFORE any module that consumes shared packages is loaded, which is why
 * the Angular bootstrap lives in `bootstrap.ts` behind a dynamic import.
 */
import { initFederation } from '@angular-architects/native-federation';
import type { RuntimeManifest, FeatureManifestEntry } from '@company/shared-core';
import { renderShellFailure } from './shell-failure';
import { resolveShellBaseUrl } from './resolve-shell-base-url';

const SUPPORTED_MANIFEST_SCHEMA = '1.0';
const DEFAULT_MANIFEST_URL = '/ui/manifest.json';

/** Must match PLATFORM_CONTRACT_VERSION's major; asserted by tools/contract-consistency.test.mjs. */
const SHELL_CONTRACT_MAJOR = '1';

/**
 * The shell is served from /ui/shell/current/ but hosted by pages at
 * arbitrary paths. Its own federation metadata must therefore be resolved
 * against the shell's asset location, not the host document — otherwise the
 * shared-dependency import map is never installed and the first Angular
 * import fails to resolve. See resolve-shell-base-url.ts for why this isn't
 * `import.meta.url`; tools/shell-base-url.test.mjs covers it directly.
 */
const SHELL_BASE_URL = resolveShellBaseUrl();

async function loadRuntimeManifest(url: string): Promise<RuntimeManifest> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`shell.manifest.failed: HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as RuntimeManifest;
}

/** Manifest validation before anything is loaded. */
function selectFeature(manifest: RuntimeManifest, featureKey: string): FeatureManifestEntry {
  if (manifest.schemaVersion !== SUPPORTED_MANIFEST_SCHEMA) {
    throw new Error(`shell.manifest.failed: unsupported schemaVersion ${manifest.schemaVersion}`);
  }
  const entry = manifest.features[featureKey];
  if (!entry) {
    throw new Error(`shell.manifest.failed: unknown feature key "${featureKey}"`);
  }
  if (!entry.enabled) {
    throw new Error(`shell.feature.disabled: feature "${featureKey}" is disabled in this environment`);
  }
  if (!entry.remoteName || !entry.exposedModule || !entry.remoteEntry) {
    throw new Error(`shell.manifest.failed: incomplete entry for feature "${featureKey}"`);
  }
  // Reject an incompatible provider before any of its code is fetched.
  // The check is duplicated here rather than imported from shared-core,
  // because this module runs before the import map exists — see the note at
  // the top of the file. bootstrap.ts re-checks using shared-core's own
  // implementation, and tools/contract-consistency.test.mjs asserts the two agree.
  if (entry.contractVersion.split('.')[0] !== SHELL_CONTRACT_MAJOR) {
    throw new Error(
      `shell.feature.incompatible: feature "${featureKey}" requires contract ${entry.contractVersion}, shell provides ${SHELL_CONTRACT_MAJOR}.x`
    );
  }
  return entry;
}

async function startShell(): Promise<void> {
  const host = document.querySelector<HTMLElement>('[data-angular-feature]');
  if (!host) {
    // Not an error. The shell loader lives in the shared host template, so it
    // runs on pages that host no migrated feature at all. Those pages must
    // cost nothing beyond the shell itself: no manifest fetch, no provider
    // request, no feature code. Treating this as a failure would put an error
    // panel on every unmigrated page.
    console.info('[shell] shell.idle — no data-angular-feature on this page, nothing to load');
    window.dispatchEvent(new CustomEvent('shell-telemetry', { detail: { name: 'shell.idle' } }));
    return;
  }
  const featureKey = host.dataset['angularFeature'];
  if (!featureKey) {
    throw new Error('shell.start.failed: data-angular-feature is empty');
  }

  const manifestUrl = host.dataset['manifestUrl'] ?? DEFAULT_MANIFEST_URL;
  const manifest = await loadRuntimeManifest(manifestUrl);
  const feature = selectFeature(manifest, featureKey);

  // Map the manifest entry onto the native-federation runtime: only the
  // selected provider is initialized for this document.
  await initFederation(
    { [feature.remoteName]: feature.remoteEntry },
    { hostRemoteEntry: { url: `${SHELL_BASE_URL}remoteEntry.json` } }
  );

  // Only now is it safe to pull in Angular (shared, singleton).
  const { bootstrapFeature } = await import('./bootstrap');
  await bootstrapFeature({ host, manifest, feature });
}

startShell().catch((err) => {
  console.error('[shell] startup failed', err);
  const host = document.querySelector<HTMLElement>('[data-angular-feature]');
  renderShellFailure(host, err);
});
