/**
 * Publishes a built artifact to an immutable versioned location, with the
 * metadata and checksums the promotion gates depend on.
 *
 *   node tools/publish-artifact.mjs shell 0.2.0
 *   node tools/publish-artifact.mjs pricing 1.0.0
 *
 * Publishing never overwrites an existing version — immutability is what
 * makes both aggressive caching and instant rollback safe — and never trusts
 * a `dist/` it did not just produce (see tools/build-marker.mjs).
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { assertBuiltInThisRun, MARKER_FILE } from './build-marker.mjs';
import {
  listProviderDirs,
  readDescriptor,
  readRegistryKeys,
  validateAgainstRemoteEntry,
  validateDescriptor,
} from './provider-descriptors.mjs';

const [artifactName, version] = process.argv.slice(2);
const repoRoot = path.resolve(import.meta.dirname, '..');

/** Artifacts are discovered from the provider descriptors, plus the shell. */
function buildArtifactMap() {
  const artifacts = {
    shell: { dist: 'dist/apps/shell/browser', publishDir: 'publish/ui/shell', providerDir: null },
  };
  for (const dir of listProviderDirs()) {
    const descriptor = readDescriptor(dir);
    artifacts[descriptor.artifact] = {
      dist: `dist/apps/providers/${dir}/browser`,
      publishDir: `publish/ui/${descriptor.artifact}`,
      providerDir: dir,
    };
  }
  return artifacts;
}

const ARTIFACTS = buildArtifactMap();

if (!artifactName || !version) {
  console.error(`usage: node tools/publish-artifact.mjs <${Object.keys(ARTIFACTS).join('|')}> <version>`);
  process.exit(1);
}

const config = ARTIFACTS[artifactName];
if (!config) {
  console.error(`unknown artifact "${artifactName}" (expected: ${Object.keys(ARTIFACTS).join(', ')})`);
  process.exit(1);
}

const source = path.join(repoRoot, config.dist);
if (!fs.existsSync(source)) {
  console.error(`build output missing: ${config.dist}\nrun the build first`);
  process.exit(1);
}

// Build provenance: fails closed on a missing or stale marker.
try {
  assertBuiltInThisRun(source);
} catch (err) {
  console.error(`publish rejected: ${err.message}`);
  process.exit(1);
}

const target = path.join(repoRoot, config.publishDir, version);
if (fs.existsSync(target)) {
  console.error(`refusing to overwrite published version ${artifactName}@${version} — published artifacts are immutable`);
  process.exit(1);
}

const remoteEntryPath = path.join(source, 'remoteEntry.json');
const remoteEntry = fs.existsSync(remoteEntryPath)
  ? JSON.parse(fs.readFileSync(remoteEntryPath, 'utf8'))
  : null;

// Providers must publish a descriptor consistent with their registry and with
// the artifact the build actually produced.
let pages = null;
if (config.providerDir) {
  const { descriptor, problems } = validateDescriptor(config.providerDir, {
    registryKeys: readRegistryKeys(config.providerDir),
  });
  const artifactProblems = remoteEntry ? validateAgainstRemoteEntry(descriptor, remoteEntry) : ['no remoteEntry.json in build output'];
  const all = [...problems, ...artifactProblems];
  if (all.length > 0) {
    console.error(`publish rejected for ${artifactName}:`);
    for (const problem of all) console.error(`  - ${problem}`);
    process.exit(1);
  }
  pages = descriptor.pages;
}

fs.cpSync(source, target, { recursive: true });
// The marker is provenance for publishing, not part of the deployed artifact.
fs.rmSync(path.join(target, MARKER_FILE), { force: true });

function checksumTree(dir, base = dir) {
  const out = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(out, checksumTree(full, base));
    } else {
      out[path.relative(base, full)] = `sha256-${createHash('sha256').update(fs.readFileSync(full)).digest('hex')}`;
    }
  }
  return out;
}

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: repoRoot }).toString().trim();
} catch {
  // Publishing outside a git checkout is allowed; the metadata records it.
}

const angularVersion = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'node_modules/@angular/core/package.json'), 'utf8')
).version;

const metadata = {
  artifact: artifactName,
  version,
  commit,
  builtAt: new Date().toISOString(),
  angularVersion,
  platformContract: '1.x',
  ...(remoteEntry ? { remoteName: remoteEntry.name } : {}),
  ...(pages ? { exposedModule: readDescriptor(config.providerDir).exposedModule, pages } : {}),
};

fs.writeFileSync(path.join(target, 'build-metadata.json'), JSON.stringify(metadata, null, 2));
fs.writeFileSync(path.join(target, 'checksums.json'), JSON.stringify(checksumTree(target), null, 2));

// The shell is referenced by every host page through one stable URL, so it
// also gets a mutable `current` pointer with a short cache lifetime.
if (artifactName === 'shell') {
  const current = path.join(repoRoot, config.publishDir, 'current');
  fs.rmSync(current, { recursive: true, force: true });
  fs.cpSync(target, current, { recursive: true });
  console.info(`  updated shell/current -> ${version}`);
}

console.info(`published ${artifactName}@${version} to ${path.relative(repoRoot, target)}`);
if (pages) {
  console.info(`  serves: ${pages.map((p) => `${p.featureKey} (${p.elementName})`).join(', ')}`);
}
