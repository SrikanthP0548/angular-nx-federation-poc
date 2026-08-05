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
  validateAgainstRemoteEntry,
  validateAllProviders,
  validateDescriptor,
} from './provider-descriptors.mjs';
import { activateShellCurrent, checkWorkingTree, syncShellVersion } from './release-helpers.mjs';

const [artifactName, version] = process.argv.slice(2);
const repoRoot = path.resolve(import.meta.dirname, '..');

// publish/ui/manifest.json is tracked but is release OUTPUT, not a build
// INPUT — publishing the shell writes its version here, and promotion writes
// feature routing here. Neither is read by any build, so neither changes
// whether dist/ faithfully reflects git HEAD's source. Excluding it is what
// lets `npm run release` publish shell then three providers in one
// invocation without the shell's own manifest write making the next
// artifact's publish see a "dirty" tree.
const RELEASE_OUTPUT_PATHS = [path.join('publish', 'ui', 'manifest.json')];

// Cross-provider uniqueness (featureKey, elementName, artifact, remoteName)
// is only meaningful checked globally, and `npm test` running it is not a
// guarantee for a manual `npm run release` — enforce it directly here so
// publishing can't skip the one check that catches a duplicate artifact
// name silently making a provider unreachable in the map below.
const globalProblems = validateAllProviders();
if (globalProblems.length > 0) {
  console.error('publish rejected: provider descriptors are not globally consistent:');
  for (const problem of globalProblems) console.error(`  - ${problem}`);
  process.exit(1);
}

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

// Build provenance: fails closed on a missing or stale marker. This proves
// *when* dist/ was produced, but not *what source tree* it came from — a
// dirty working tree at build time means the artifact contains changes that
// git HEAD does not, and the commit metadata below would misattribute it to
// a commit that doesn't actually contain what was published.
try {
  assertBuiltInThisRun(source);
} catch (err) {
  console.error(`publish rejected: ${err.message}`);
  process.exit(1);
}

const { dirty, status: gitStatus } = checkWorkingTree(repoRoot, RELEASE_OUTPUT_PATHS);
if (dirty && !process.env.ALLOW_DIRTY_PUBLISH) {
  console.error('publish rejected: working tree is not clean');
  console.error(`  ${gitStatus.split('\n').join('\n  ')}`);
  console.error(
    'commit or stash first, or set ALLOW_DIRTY_PUBLISH=1 to publish anyway (recorded as dirty in build-metadata.json)'
  );
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

// Providers must publish a descriptor consistent with their federation config
// and with the artifact the build actually produced.
let pages = null;
if (config.providerDir) {
  const { descriptor, problems } = validateDescriptor(config.providerDir);
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
  // Explicit rather than inferred from absence: a reader should never have
  // to wonder whether "dirty" was checked and found clean, or never checked.
  dirty,
  builtAt: new Date().toISOString(),
  angularVersion,
  platformContract: '1.x',
  ...(remoteEntry ? { remoteName: remoteEntry.name } : {}),
  // No top-level exposedModule: a provider can expose more than one key now,
  // so `pages[i].exposedModule` (already per-page from the descriptor) is the
  // only place that value legitimately lives.
  ...(pages ? { pages } : {}),
};

fs.writeFileSync(path.join(target, 'build-metadata.json'), JSON.stringify(metadata, null, 2));
fs.writeFileSync(path.join(target, 'checksums.json'), JSON.stringify(checksumTree(target), null, 2));

// The shell is referenced by every host page through one stable URL, so it
// also gets a mutable `current` pointer with a short cache lifetime.
if (artifactName === 'shell') {
  const publishDir = path.join(repoRoot, config.publishDir);
  activateShellCurrent(publishDir, target);
  console.info(`  updated shell/current -> ${version}`);

  // manifest.json's shell.version is what the shell reports in its own
  // startup telemetry; leaving it static once the shell version drifts is
  // exactly the kind of thing that quietly makes telemetry lie.
  const manifestPath = path.join(repoRoot, 'publish', 'ui', 'manifest.json');
  if (syncShellVersion(manifestPath, version)) {
    console.info(`  updated manifest.json shell.version -> ${version}`);
  }
}

console.info(`published ${artifactName}@${version} to ${path.relative(repoRoot, target)}`);
if (pages) {
  console.info(`  serves: ${pages.map((p) => `${p.featureKey} (${p.elementName})`).join(', ')}`);
}
