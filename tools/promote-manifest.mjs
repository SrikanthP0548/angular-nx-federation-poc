/**
 * Points a logical feature key at a published artifact version.
 *
 *   node tools/promote-manifest.mjs pricing-search 1.1.0
 *
 * This is the entire deployment action for a feature release — and the entire
 * rollback action too. No shell rebuild, no host page redeployment.
 *
 * Validation before promotion:
 *   - the artifact exists at its immutable published path
 *   - its checksums still match what was published (checksums.json itself is
 *     the one exclusion — it's written after the tree is hashed, so it can't
 *     contain its own hash)
 *   - it actually serves the element name this feature key expects, so a
 *     manifest/artifact mismatch can't surface in production as a blank page
 *   - its contract version is compatible with the deployed shell
 *   - its Angular version matches the shell's
 *   - the previous version stays on disk for rollback
 *
 * One provider artifact can serve several feature keys, so the artifact
 * directory below is not necessarily the feature key.
 *
 * Promotion is atomic: the manifest is written to a temp file and renamed
 * over the live one, so no request ever reads a partial manifest.
 */
import fs from 'node:fs';
import path from 'node:path';
import { verifyChecksums } from './release-helpers.mjs';

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

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const existing = manifest.features[featureKey];
if (!existing) {
  fail(`feature key "${featureKey}" is not defined in the manifest`);
}

const artifactName = existing.artifact ?? featureKey;
const artifactDir = path.join(publishRoot, artifactName, version);
if (!fs.existsSync(artifactDir)) {
  fail(`no published artifact at ui/${artifactName}/${version}`);
}

const metadataPath = path.join(artifactDir, 'build-metadata.json');
if (!fs.existsSync(metadataPath)) {
  fail(`ui/${artifactName}/${version} has no build-metadata.json`);
}
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

const checksums = JSON.parse(fs.readFileSync(path.join(artifactDir, 'checksums.json'), 'utf8'));
const checksumProblems = verifyChecksums(artifactDir, checksums);
if (checksumProblems.length > 0) {
  fail(checksumProblems[0]);
}

const served = metadata.pages ?? [];
const servedEntry = served.find((p) => p.featureKey === featureKey);
if (!servedEntry) {
  fail(
    `${artifactName}@${version} does not serve feature "${featureKey}" ` +
      `(serves: ${served.map((p) => p.featureKey).join(', ') || 'nothing'})`
  );
}
if (servedEntry.elementName !== existing.elementName) {
  fail(
    `manifest expects element "${existing.elementName}" for "${featureKey}" ` +
      `but ${artifactName}@${version} registers "${servedEntry.elementName}"`
  );
}

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
      `Angular ${metadata.angularVersion} in the provider does not match ${shellMetadata.angularVersion} in the deployed shell`
    );
  }
}

const remoteEntry = JSON.parse(fs.readFileSync(path.join(artifactDir, 'remoteEntry.json'), 'utf8'));
const exposedKeys = remoteEntry.exposes.map((e) => e.key);
if (!exposedKeys.includes(servedEntry.exposedModule)) {
  fail(`provider does not expose ${servedEntry.exposedModule} (exposes: ${exposedKeys.join(', ')})`);
}

const previousVersion = existing.featureVersion;
if (previousVersion !== version && !fs.existsSync(path.join(publishRoot, artifactName, previousVersion))) {
  console.warn(`  warning: previous version ${previousVersion} is no longer on disk — rollback would fail`);
}

manifest.features[featureKey] = {
  ...existing,
  remoteName: metadata.remoteName,
  remoteEntry: `/ui/${artifactName}/${version}/remoteEntry.json`,
  exposedModule: servedEntry.exposedModule,
  featureVersion: version,
  contractVersion: metadata.platformContract,
};

const tempPath = `${manifestPath}.${process.pid}.tmp`;
fs.writeFileSync(tempPath, JSON.stringify(manifest, null, 2) + '\n');
fs.renameSync(tempPath, manifestPath);

console.info(`promoted ${featureKey}: ${previousVersion} -> ${version} (artifact ${artifactName})`);
console.info(`  rollback with: node tools/promote-manifest.mjs ${featureKey} ${previousVersion}`);
