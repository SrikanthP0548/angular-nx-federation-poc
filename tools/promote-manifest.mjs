/**
 * Manifest promotion pipeline (doc sections 12.2 and 13.3).
 *
 *   node tools/promote-manifest.mjs pricing 1.4.2
 *
 * Points a logical feature key at a published artifact version. This is the
 * entire deployment action for a feature release — and the entire rollback
 * action too. No shell rebuild, no ASPX redeployment.
 *
 * Validation before promotion:
 *   - the artifact exists at the immutable published path
 *   - its checksums still match what was published
 *   - its contract version is compatible with the deployed shell
 *   - its Angular version matches the shell's
 *   - the previous version stays on disk for rollback
 *
 * Promotion is atomic: the new manifest is written to a temp file and
 * renamed over the live one, so no request ever reads a partial manifest.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const [featureKey, version] = process.argv.slice(2);
if (!featureKey || !version) {
  console.error('usage: node tools/promote-manifest.mjs <featureKey> <version>');
  process.exit(1);
}

const repoRoot = path.resolve(import.meta.dirname, '..');
const publishRoot = path.join(repoRoot, 'publish', 'ui');
const manifestPath = path.join(publishRoot, 'manifest.json');

const SHELL_CONTRACT_MAJOR = '1';

function fail(message) {
  console.error(`promotion rejected: ${message}`);
  process.exit(1);
}

const artifactDir = path.join(publishRoot, featureKey, version);
if (!fs.existsSync(artifactDir)) {
  fail(`no published artifact at ui/${featureKey}/${version}`);
}

const metadataPath = path.join(artifactDir, 'build-metadata.json');
if (!fs.existsSync(metadataPath)) {
  fail(`ui/${featureKey}/${version} has no build-metadata.json`);
}
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Artifact integrity (doc section 12.2).
const checksums = JSON.parse(fs.readFileSync(path.join(artifactDir, 'checksums.json'), 'utf8'));
for (const [relative, expected] of Object.entries(checksums)) {
  if (relative === 'checksums.json') continue;
  const actual = `sha256-${createHash('sha256').update(fs.readFileSync(path.join(artifactDir, relative))).digest('hex')}`;
  if (actual !== expected) {
    fail(`checksum mismatch for ${relative} — the published artifact was modified after publication`);
  }
}

// Compatibility gates (doc sections 4.3, 12.2).
if (metadata.platformContract.split('.')[0] !== SHELL_CONTRACT_MAJOR) {
  fail(`contract ${metadata.platformContract} is incompatible with shell contract ${SHELL_CONTRACT_MAJOR}.x`);
}

const shellMetadataPath = path.join(publishRoot, 'shell', 'current', 'build-metadata.json');
if (fs.existsSync(shellMetadataPath)) {
  const shellMetadata = JSON.parse(fs.readFileSync(shellMetadataPath, 'utf8'));
  const [shellMajor, shellMinor] = shellMetadata.angularVersion.split('.');
  const [remoteMajor, remoteMinor] = metadata.angularVersion.split('.');
  if (shellMajor !== remoteMajor || shellMinor !== remoteMinor) {
    fail(
      `Angular ${metadata.angularVersion} in the remote does not match ${shellMetadata.angularVersion} in the deployed shell`
    );
  }
}

// The remote's own federation metadata is the source of truth for how the
// shell must load it.
const remoteEntry = JSON.parse(fs.readFileSync(path.join(artifactDir, 'remoteEntry.json'), 'utf8'));
const exposedKeys = remoteEntry.exposes.map((e) => e.key);
if (!exposedKeys.includes(metadata.exposedModule)) {
  fail(`remote does not expose ${metadata.exposedModule} (exposes: ${exposedKeys.join(', ')})`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const existing = manifest.features[featureKey];
if (!existing) {
  fail(`feature key "${featureKey}" is not defined in the manifest`);
}

const previousVersion = existing.featureVersion;
if (previousVersion !== version && !fs.existsSync(path.join(publishRoot, featureKey, previousVersion))) {
  console.warn(`  warning: previous version ${previousVersion} is no longer on disk — rollback would fail`);
}

manifest.features[featureKey] = {
  ...existing,
  remoteName: metadata.remoteName,
  remoteEntry: `/ui/${featureKey}/${version}/remoteEntry.json`,
  exposedModule: metadata.exposedModule,
  featureVersion: version,
  contractVersion: metadata.platformContract,
};

// Atomic promotion.
const tempPath = `${manifestPath}.${process.pid}.tmp`;
fs.writeFileSync(tempPath, JSON.stringify(manifest, null, 2) + '\n');
fs.renameSync(tempPath, manifestPath);

console.info(`promoted ${featureKey}: ${previousVersion} -> ${version}`);
console.info(`  rollback with: node tools/promote-manifest.mjs ${featureKey} ${previousVersion}`);
