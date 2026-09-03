/**
 * Publishes the legacy-container build to an immutable versioned location,
 * with atomic activation of the `current` pointer that `/AngularShell/` is
 * served from.
 *
 *   node tools/publish-container.mjs 1.0.0
 *
 * Deliberately separate from publish-artifact.mjs and never invoked by
 * `npm run release`: legacy-container is not a federation artifact — no
 * remoteEntry, no provider descriptor, no runtime-manifest entry (see
 * "Explicit Phase-1 decisions" in ANGULAR_SHELL_COEXISTENCE_PLAN.md) — so it
 * skips the provider-descriptor validation that script runs, and publishing
 * it has no effect on shell/pricing/feature-two/feature-three publishing.
 *
 * What IS shared, not reimplemented: the build-marker provenance check
 * (proves *when* dist/ was produced), the dirty-working-tree gate, the
 * checksum walk, and the atomic current-swap (`activateShellCurrent`, which
 * despite its name is a generic directory swap — see release-helpers.mjs).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { assertBuiltInThisRun, MARKER_FILE } from './build-marker.mjs';
import {
  activateShellCurrent,
  beginVersionPublish,
  checksumTree,
  checkWorkingTree,
  finalizeVersionPublish,
  isValidPublishVersion,
} from './release-helpers.mjs';

// argv keeps the CLI useful on its own; ARTIFACT_VERSION lets Nx invoke this
// without shell-specific $VAR/%VAR% expansion, so the same target works from
// PowerShell, cmd.exe, bash, and CI.
const version = process.argv[2] ?? process.env.ARTIFACT_VERSION;
const repoRoot = path.resolve(import.meta.dirname, '..');

if (!version) {
  console.error(
    'usage: node tools/publish-container.mjs <version> (or set ARTIFACT_VERSION)',
  );
  process.exit(1);
}
if (!isValidPublishVersion(version)) {
  // version becomes a directory name below (publish/angular-shell/<version>) —
  // reject anything that isn't strict SemVer before it ever reaches a path.
  console.error(
    `invalid version "${version}" — expected strict SemVer, e.g. 1.2.3 or 1.2.3-ci`,
  );
  process.exit(1);
}

const dist = 'dist/apps/legacy-container/browser';
const source = path.join(repoRoot, dist);
if (!fs.existsSync(source)) {
  console.error(`build output missing: ${dist}\nrun the build first`);
  process.exit(1);
}

try {
  assertBuiltInThisRun(source);
} catch (err) {
  console.error(`publish rejected: ${err.message}`);
  process.exit(1);
}

const { dirty, status: gitStatus } = checkWorkingTree(repoRoot, []);
if (dirty && !process.env.ALLOW_DIRTY_PUBLISH) {
  console.error('publish rejected: working tree is not clean');
  console.error(`  ${gitStatus.split('\n').join('\n  ')}`);
  console.error(
    'commit or stash first, or set ALLOW_DIRTY_PUBLISH=1 to publish anyway (recorded as dirty in build-metadata.json)',
  );
  process.exit(1);
}

const publishDir = path.join(repoRoot, 'publish', 'angular-shell');

// Staged under a temp name, not copied straight to <publishDir>/<version>:
// an interrupted copy must never leave a partial directory sitting at the
// real, immutable-by-name path, which a retry of this exact version could
// then never get past.
let staging;
try {
  staging = beginVersionPublish(publishDir, source, version);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
fs.rmSync(path.join(staging, MARKER_FILE), { force: true });

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: repoRoot })
    .toString()
    .trim();
} catch {
  // Publishing outside a git checkout is allowed; the metadata records it.
}

const angularVersion = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, 'node_modules/@angular/core/package.json'),
    'utf8',
  ),
).version;

const metadata = {
  artifact: 'legacy-container',
  version,
  commit,
  dirty,
  builtAt: new Date().toISOString(),
  angularVersion,
};

fs.writeFileSync(
  path.join(staging, 'build-metadata.json'),
  JSON.stringify(metadata, null, 2),
);
fs.writeFileSync(
  path.join(staging, 'checksums.json'),
  JSON.stringify(checksumTree(staging), null, 2),
);

let target;
try {
  target = finalizeVersionPublish(publishDir, staging, version);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

activateShellCurrent(publishDir, target);
console.info(`  updated angular-shell/current -> ${version}`);
console.info(
  `published legacy-container@${version} to ${path.relative(repoRoot, target)}`,
);
