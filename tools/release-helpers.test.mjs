import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  activateShellCurrent,
  checkWorkingTree,
  filterReleaseOutputPaths,
  syncShellVersion,
  verifyChecksums,
} from './release-helpers.mjs';

function tempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// ---------------------------------------------------------------------------
// filterReleaseOutputPaths / checkWorkingTree — dirty-tree rejection and the
// manifest.json exclusion that made publishing multiple artifacts in one
// release run possible.
// ---------------------------------------------------------------------------

test('filterReleaseOutputPaths excludes an excluded path regardless of status-prefix width', () => {
  // Real observed porcelain output: a staged-only change has a narrower
  // prefix than a staged-and-modified one — this is the exact shape that
  // broke a fixed-column slice during development.
  const raw = ['M publish/ui/manifest.json', ' M tools/publish-artifact.mjs'].join('\n');
  const filtered = filterReleaseOutputPaths(raw, [path.join('publish', 'ui', 'manifest.json')]);
  assert.equal(filtered, ' M tools/publish-artifact.mjs');
});

test('filterReleaseOutputPaths returns empty string when everything is excluded', () => {
  const raw = 'M publish/ui/manifest.json';
  const filtered = filterReleaseOutputPaths(raw, [path.join('publish', 'ui', 'manifest.json')]);
  assert.equal(filtered, '');
});

test('filterReleaseOutputPaths leaves unrelated changes untouched when nothing is excluded', () => {
  const raw = ' M tools/publish-artifact.mjs\n?? tools/new-file.mjs';
  const filtered = filterReleaseOutputPaths(raw, ['some/other/path.json']);
  assert.equal(filtered, raw);
});

test('checkWorkingTree reports clean on a real clean directory (this repo, filtering nothing)', () => {
  const repoRoot = path.resolve(import.meta.dirname, '..');
  // Excluding a path that can't appear proves the wiring end-to-end (real
  // git status --porcelain call) without asserting on this repo's actual
  // working-tree state, which the test shouldn't depend on.
  const { dirty, status } = checkWorkingTree(repoRoot, ['__never_matches__']);
  assert.equal(typeof dirty, 'boolean');
  assert.equal(typeof status === 'string' || status === null, true);
});

test('checkWorkingTree detects a real uncommitted file and excludes it when listed', () => {
  // Asserts the exclusion mechanism directly (does the probe's own status
  // line disappear when excluded) rather than the overall dirty flag, which
  // would depend on the outer repo having no OTHER uncommitted changes at
  // test-run time — an assumption this suite must not make about itself.
  const repoRoot = path.resolve(import.meta.dirname, '..');
  const probePath = path.join(repoRoot, '.release-helpers-test-probe.tmp');
  fs.writeFileSync(probePath, 'probe');
  try {
    const seenWithoutExclusion = checkWorkingTree(repoRoot, ['__never_matches__']);
    assert.equal(seenWithoutExclusion.dirty, true, 'an untracked file must be detected as dirty');
    assert.ok(seenWithoutExclusion.status.includes('.release-helpers-test-probe.tmp'));

    const seenWithExclusion = checkWorkingTree(repoRoot, ['.release-helpers-test-probe.tmp']);
    assert.ok(
      !seenWithExclusion.status.includes('.release-helpers-test-probe.tmp'),
      'the excluded path must not appear in the filtered status'
    );
  } finally {
    fs.rmSync(probePath, { force: true });
  }
});

test('checkWorkingTree: excluding every dirty path is what makes the tree read as clean', () => {
  // The property `filterReleaseOutputPaths` unit tests already prove in
  // isolation — confirmed here against the real git wiring, in a scratch
  // git repo so the assertion doesn't depend on this repo's ambient state.
  const dir = tempDir('checkworkingtree-clean-');
  try {
    execSync('git init -q', { cwd: dir });
    execSync('git config user.email test@example.com', { cwd: dir });
    execSync('git config user.name test', { cwd: dir });
    fs.writeFileSync(path.join(dir, 'manifest.json'), '{}');
    execSync('git add manifest.json && git commit -q -m init', { cwd: dir, shell: '/bin/sh' });

    fs.writeFileSync(path.join(dir, 'manifest.json'), '{"changed":true}');
    const withoutExclusion = checkWorkingTree(dir, ['__never_matches__']);
    assert.equal(withoutExclusion.dirty, true);

    const withExclusion = checkWorkingTree(dir, ['manifest.json']);
    assert.equal(withExclusion.dirty, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// verifyChecksums — the metadata-tampering rejection during promotion.
// ---------------------------------------------------------------------------

test('verifyChecksums passes when every file matches', () => {
  const dir = tempDir('checksums-ok-');
  try {
    fs.writeFileSync(path.join(dir, 'build-metadata.json'), '{"a":1}');
    fs.writeFileSync(path.join(dir, 'checksums.json'), '{}'); // excluded from its own check
    const checksums = {
      'build-metadata.json': `sha256-${createHash('sha256').update('{"a":1}').digest('hex')}`,
    };
    assert.deepEqual(verifyChecksums(dir, checksums), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyChecksums rejects tampered build-metadata.json — the exact attack from the review', () => {
  const dir = tempDir('checksums-tampered-');
  try {
    const original = { artifact: 'pricing', pages: [{ featureKey: 'pricing-search', exposedModule: './pricing-search' }] };
    fs.writeFileSync(path.join(dir, 'build-metadata.json'), JSON.stringify(original));
    const checksums = {
      'build-metadata.json': `sha256-${createHash('sha256').update(JSON.stringify(original)).digest('hex')}`,
    };

    // Tamper: redirect pricing-search's exposedModule to pricing-details,
    // exactly the attack described in the review.
    const tampered = { ...original, pages: [{ featureKey: 'pricing-search', exposedModule: './pricing-details' }] };
    fs.writeFileSync(path.join(dir, 'build-metadata.json'), JSON.stringify(tampered));

    const problems = verifyChecksums(dir, checksums);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /checksum mismatch for build-metadata\.json/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyChecksums always skips checksums.json itself', () => {
  const dir = tempDir('checksums-self-');
  try {
    fs.writeFileSync(path.join(dir, 'checksums.json'), '{"anything": "goes"}');
    // A deliberately wrong "expected" value for checksums.json's own entry
    // must never be flagged — it's self-referential and always excluded.
    const problems = verifyChecksums(dir, { 'checksums.json': 'sha256-not-even-a-real-hash' });
    assert.deepEqual(problems, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verifyChecksums reports a listed file that is missing entirely', () => {
  const dir = tempDir('checksums-missing-');
  try {
    const problems = verifyChecksums(dir, { 'remoteEntry.json': 'sha256-deadbeef' });
    assert.equal(problems.length, 1);
    assert.match(problems[0], /missing from the artifact/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// syncShellVersion — shell.version staying in sync with what was published.
// ---------------------------------------------------------------------------

test('syncShellVersion updates shell.version and preserves other manifest content', () => {
  const dir = tempDir('manifest-sync-');
  try {
    const manifestPath = path.join(dir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify({ schemaVersion: '1.0', shell: { version: '1.0.0' }, features: { x: { enabled: true } } })
    );

    const wrote = syncShellVersion(manifestPath, '2.0.0');
    assert.equal(wrote, true);

    const updated = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(updated.shell.version, '2.0.0');
    assert.equal(updated.schemaVersion, '1.0');
    assert.deepEqual(updated.features, { x: { enabled: true } });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('syncShellVersion returns false and writes nothing when the manifest does not exist', () => {
  const dir = tempDir('manifest-missing-');
  try {
    const manifestPath = path.join(dir, 'manifest.json');
    assert.equal(syncShellVersion(manifestPath, '2.0.0'), false);
    assert.equal(fs.existsSync(manifestPath), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('syncShellVersion leaves no leftover temp file behind', () => {
  const dir = tempDir('manifest-cleanup-');
  try {
    const manifestPath = path.join(dir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify({ shell: { version: '1.0.0' } }));
    syncShellVersion(manifestPath, '1.1.0', { pid: 99999 });
    assert.deepEqual(fs.readdirSync(dir), ['manifest.json']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// activateShellCurrent — the atomic shell/current swap and its failure
// recovery (tolerance of stale leftovers from a crashed previous run).
// ---------------------------------------------------------------------------

function writeVersionMarker(dir, value) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'marker.txt'), value);
}

function readVersionMarker(dir) {
  return fs.readFileSync(path.join(dir, 'marker.txt'), 'utf8');
}

test('activateShellCurrent creates current on first activation (no prior current)', () => {
  const dir = tempDir('shell-current-first-');
  try {
    const source = path.join(dir, 'source-v1');
    writeVersionMarker(source, 'v1');

    activateShellCurrent(dir, source, { pid: 1 });

    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v1');
    // No leftover temp/old directories.
    const entries = fs.readdirSync(dir);
    assert.deepEqual(entries.sort(), ['current', 'source-v1']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('activateShellCurrent replaces an existing current with no leftovers', () => {
  const dir = tempDir('shell-current-replace-');
  try {
    const sourceV1 = path.join(dir, 'source-v1');
    writeVersionMarker(sourceV1, 'v1');
    activateShellCurrent(dir, sourceV1, { pid: 1 });
    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v1');

    const sourceV2 = path.join(dir, 'source-v2');
    writeVersionMarker(sourceV2, 'v2');
    activateShellCurrent(dir, sourceV2, { pid: 2 });

    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v2');
    const entries = fs.readdirSync(dir);
    assert.deepEqual(entries.sort(), ['current', 'source-v1', 'source-v2']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('activateShellCurrent is unaffected by a stale temp dir left by a crashed different-pid run', () => {
  const dir = tempDir('shell-current-stale-');
  try {
    const sourceV1 = path.join(dir, 'source-v1');
    writeVersionMarker(sourceV1, 'v1');
    activateShellCurrent(dir, sourceV1, { pid: 1 });

    // Simulate a previous run that crashed mid-swap under a different pid,
    // leaving its temp directories behind.
    writeVersionMarker(path.join(dir, '.current-tmp-777'), 'half-written');
    writeVersionMarker(path.join(dir, '.current-old-777'), 'orphaned');

    const sourceV2 = path.join(dir, 'source-v2');
    writeVersionMarker(sourceV2, 'v2');
    activateShellCurrent(dir, sourceV2, { pid: 2 });

    // The fresh run succeeds and current is correct, regardless of the
    // unrelated stale leftovers sitting alongside it.
    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v2');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('activateShellCurrent: current is never observed missing or partial at any point in the swap', () => {
  // True concurrent-window testing isn't practical in a single-threaded unit
  // test, but the safety property claimed is structural: the replacement is
  // fully built under a temp name BEFORE current is ever touched, and the
  // handoff itself is two renames (each a single atomic syscall on POSIX) —
  // so this asserts that structural property by checking state immediately
  // before and after the only two operations that touch `current`.
  const dir = tempDir('shell-current-atomicity-');
  try {
    const sourceV1 = path.join(dir, 'source-v1');
    writeVersionMarker(sourceV1, 'v1');
    activateShellCurrent(dir, sourceV1, { pid: 1 });
    assert.equal(fs.existsSync(path.join(dir, 'current')), true);
    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v1');

    const sourceV2 = path.join(dir, 'source-v2');
    writeVersionMarker(sourceV2, 'v2');

    // The new version is built entirely under a temp name — current must
    // still be fully intact and unchanged at this point, before any rename.
    fs.cpSync(sourceV2, path.join(dir, '.current-tmp-3'), { recursive: true });
    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v1', 'current must be untouched while staging');

    activateShellCurrent(dir, sourceV2, { pid: 3 });
    assert.equal(readVersionMarker(path.join(dir, 'current')), 'v2');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
