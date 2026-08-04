/**
 * Shell loader (doc sections 2.1 and 6.3).
 *
 * This file is the stable entry script referenced by the legacy host page
 * (AngularHost.Master). It must stay free of static Angular imports:
 * native federation has to initialize the shared-dependency import map
 * BEFORE any module that consumes shared packages is loaded, which is why
 * the Angular bootstrap lives in `bootstrap.ts` behind a dynamic import.
 */
import { initFederation } from '@angular-architects/native-federation';
import type { RuntimeManifest, FeatureManifestEntry } from '@company/angular-platform-contract';
import { renderShellFailure } from './shell-failure';

const SUPPORTED_MANIFEST_SCHEMA = '1.0';
const DEFAULT_MANIFEST_URL = '/ui/manifest.json';

/** Must match PLATFORM_CONTRACT_VERSION's major; asserted by the contract lib's tests. */
const SHELL_CONTRACT_MAJOR = '1';

/**
 * The shell is served from /ui/shell/current/ but hosted by pages at
 * arbitrary paths (/Pricing.aspx, /Reports.aspx, ...). Its own federation
 * metadata must therefore be resolved against the shell's asset location,
 * not the host document — otherwise the shared-dependency import map is
 * never installed and the first Angular import fails to resolve.
 */
const SHELL_BASE_URL = new URL('.', import.meta.url).href;

async function loadRuntimeManifest(url: string): Promise<RuntimeManifest> {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`shell.manifest.failed: HTTP ${response.status} for ${url}`);
  }
  return (await response.json()) as RuntimeManifest;
}

/** Manifest validation before anything is loaded (doc section 12.2). */
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
  // Reject an incompatible remote before any of its code is fetched
  // (doc section 6.1). The check is duplicated here rather than imported
  // from the contract package, because this module runs before the import
  // map exists — see the note at the top of the file. bootstrap.ts re-checks
  // using the contract package's own implementation, and the contract
  // library's tests assert the two agree.
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
    throw new Error('shell.start.failed: no element with data-angular-feature found');
  }
  const featureKey = host.dataset['angularFeature'];
  if (!featureKey) {
    throw new Error('shell.start.failed: data-angular-feature is empty');
  }

  const manifestUrl = host.dataset['manifestUrl'] ?? DEFAULT_MANIFEST_URL;
  const manifest = await loadRuntimeManifest(manifestUrl);
  const feature = selectFeature(manifest, featureKey);

  // Map the platform manifest entry onto the native-federation runtime:
  // only the selected remote is initialized for this page.
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
