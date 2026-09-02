/**
 * End-to-end tests for the actual `node tools/publish-container.mjs` CLI —
 * not the extracted release-helpers.mjs functions (already unit-tested in
 * release-helpers.test.mjs), but the script's own argv handling, exit codes,
 * and filesystem effects, run as a real subprocess exactly as CI invokes it.
 *
 * Fully isolated: a fresh `fs.mkdtempSync` root is created once per run of
 * this file, with its own copy of the four tools/*.mjs files this script
 * actually needs, a symlinked node_modules (for the @angular/core version
 * read), and its own git repository — never the real repo's dist/, publish/,
 * or git history. This is deliberate, not incidental:
 *
 *  - Earlier versions of this file operated directly on the real
 *    dist/apps/legacy-container/browser and publish/angular-shell/current —
 *    `npm test` running this file left the real dist/ output deleted. A
 *    fixed-name backup/restore for `current` masked part of that, but never
 *    covered dist/, and fixed-name paths (backup dir, dirty-tree marker)
 *    were themselves unsafe under a parallel or interrupted run.
 *  - Testing "rejects a dirty working tree" against the real repo is also
 *    unsound on its own: this repo is very often genuinely dirty during
 *    active development, so an assertion that publishing merely gets
 *    rejected would pass whether or not the rejection was actually caused
 *    by anything this test did — a vacuous pass. Running against a freshly
 *    git-init'd, freshly committed temp repo (with dist/ and publish/
 *    gitignored, mirroring the real repo) makes both the "clean" and
 *    "dirty" cases genuine, and lets the dirty-tree assertion check for the
 *    specific marker file this test introduced, not just "something is
 *    dirty".
 *
 * `mkdtempSync` also solves parallel-safety and interrupted-run safety for
 * free: every run gets an OS-guaranteed-unique directory, so two concurrent
 * invocations (or a crashed prior run) can never collide or corrupt shared
 * state — there is no shared state to corrupt.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const TOOLS_FILES = ['publish-container.mjs', 'release-helpers.mjs', 'build-marker.mjs', 'stamp-build.mjs'];

let tmpRoot;

const distDir = () => path.join(tmpRoot, 'dist', 'apps', 'legacy-container', 'browser');
const publishDir = () => path.join(tmpRoot, 'publish', 'angular-shell');
const currentDir = () => path.join(publishDir(), 'current');

const runTag = Date.now() % 100000;
const testVersion = (suffix) => `0.0.${runTag}-e2e-${suffix}`;

function git(args) {
  return execFileSync('git', args, { cwd: tmpRoot, encoding: 'utf8' });
}

function buildFixtureDist() {
  const dir = distDir();
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><html></html>');
  fs.writeFileSync(path.join(dir, 'main.js'), 'console.log("fixture");');
}

function stamp(runId) {
  execFileSync('node', ['tools/stamp-build.mjs', 'dist/apps/legacy-container/browser'], {
    cwd: tmpRoot,
    env: { ...process.env, BUILD_RUN_ID: runId },
  });
}

function runPublish(args, { runId = 'e2e-run', allowDirty = false } = {}) {
  return execFileSync('node', ['tools/publish-container.mjs', ...args], {
    cwd: tmpRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BUILD_RUN_ID: runId,
      // Explicitly cleared, not just omitted: this test's own env must not
      // inherit ALLOW_DIRTY_PUBLISH from whatever shell invoked `npm test`.
      ALLOW_DIRTY_PUBLISH: allowDirty ? '1' : '',
    },
  });
}

/** execFileSync throws on non-zero exit, with .status/.stdout/.stderr populated. */
function expectPublishToFail(args, opts) {
  try {
    runPublish(args, opts);
    assert.fail(`expected "node tools/publish-container.mjs ${args.join(' ')}" to fail, but it succeeded`);
  } catch (err) {
    if (err.stderr === undefined) throw err; // a real assertion failure, not the expected process failure
    return err;
  }
}

before(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-container-e2e-'));

  fs.mkdirSync(path.join(tmpRoot, 'tools'), { recursive: true });
  for (const file of TOOLS_FILES) {
    fs.cpSync(path.join(repoRoot, 'tools', file), path.join(tmpRoot, 'tools', file));
  }
  // publish-container.mjs reads node_modules/@angular/core/package.json for
  // the recorded Angular version — a symlink avoids copying node_modules.
  fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(tmpRoot, 'node_modules'), 'dir');

  // Mirrors the real repo's own .gitignore treatment of these two paths, so
  // fixture builds and publishes don't make the tree look dirty on their
  // own — only the dedicated dirty-tree test's own marker file does.
  fs.writeFileSync(path.join(tmpRoot, '.gitignore'), 'dist\npublish\n');

  git(['init', '-q']);
  git(['config', 'user.email', 'e2e-test@example.com']);
  git(['config', 'user.name', 'E2E Test']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'fixture baseline']);
});

after(() => {
  if (tmpRoot) fs.rmSync(tmpRoot, { recursive: true, force: true });
});

test('rejects a missing version argument', () => {
  const err = (() => {
    try {
      execFileSync('node', ['tools/publish-container.mjs'], { cwd: tmpRoot, encoding: 'utf8' });
      assert.fail('expected rejection');
    } catch (e) {
      return e;
    }
  })();
  assert.match(err.stderr, /usage: node tools\/publish-container\.mjs/);
});

test('rejects an invalid/traversing version before touching the filesystem', () => {
  buildFixtureDist();
  stamp('run-invalid');
  const err = expectPublishToFail(['../../../tmp/escaped']);
  assert.match(err.stderr, /invalid version/);
  assert.equal(fs.existsSync(path.join(tmpRoot, '..', 'tmp', 'escaped')), false);
});

test('rejects a missing build marker', () => {
  buildFixtureDist(); // deliberately not stamped
  const err = expectPublishToFail([testVersion('nomarker')]);
  assert.match(err.stderr, /no build marker/);
});

test('rejects a build stamped by a different run', () => {
  buildFixtureDist();
  stamp('run-a');
  const err = expectPublishToFail([testVersion('wrongrun')], { runId: 'run-c' });
  assert.match(err.stderr, /was built by run/);
});

test('rejects a dirty working tree unless explicitly overridden — genuinely, not vacuously', () => {
  const markerName = 'dirty-marker.tmp';
  fs.writeFileSync(path.join(tmpRoot, markerName), 'dirty');
  try {
    buildFixtureDist();
    stamp('run-dirty');
    const err = expectPublishToFail([testVersion('dirty')], { runId: 'run-dirty', allowDirty: false });
    assert.match(err.stderr, /working tree is not clean/);
    // The whole point of the isolated temp git repo: this proves the
    // rejection is actually tied to the marker THIS test created, not to
    // incidental dirtiness elsewhere — a real assertion, not a vacuous one.
    assert.match(err.stderr, /dirty-marker\.tmp/);
  } finally {
    fs.rmSync(path.join(tmpRoot, markerName), { force: true });
  }
});

test('rejects publishing over an existing (immutable) version', () => {
  const version = testVersion('dup');
  buildFixtureDist();
  stamp('run-dup-1');
  runPublish([version], { runId: 'run-dup-1' });

  buildFixtureDist();
  stamp('run-dup-2');
  const err = expectPublishToFail([version], { runId: 'run-dup-2' });
  assert.match(err.stderr, /refusing to overwrite/);
});

test('a successful publish writes correct metadata and checksums, and activates current', () => {
  const version = testVersion('ok');
  buildFixtureDist();
  stamp('run-ok');
  const stdout = runPublish([version], { runId: 'run-ok' });
  assert.match(stdout, new RegExp(`published legacy-container@${version.replace(/[.+]/g, '\\$&')}`));

  const versionDir = path.join(publishDir(), version);
  assert.equal(fs.existsSync(versionDir), true);

  const metadata = JSON.parse(fs.readFileSync(path.join(versionDir, 'build-metadata.json'), 'utf8'));
  assert.equal(metadata.artifact, 'legacy-container');
  assert.equal(metadata.version, version);
  // The temp repo is genuinely clean at this point (dist/publish
  // gitignored, no marker file present) — proves the happy path really is
  // clean, not just "ALLOW_DIRTY_PUBLISH papered over it".
  assert.equal(metadata.dirty, false);
  assert.equal(typeof metadata.builtAt, 'string');
  assert.equal(typeof metadata.commit, 'string');

  const checksums = JSON.parse(fs.readFileSync(path.join(versionDir, 'checksums.json'), 'utf8'));
  assert.deepEqual(Object.keys(checksums).sort(), ['build-metadata.json', 'index.html', 'main.js']);
  for (const [relative, expected] of Object.entries(checksums)) {
    const actual = `sha256-${createHash('sha256').update(fs.readFileSync(path.join(versionDir, relative))).digest('hex')}`;
    assert.equal(actual, expected, `checksum mismatch for ${relative}`);
  }

  // The build marker is stripped from the published copy — it's provenance
  // for this script's own gate, not part of the deployed artifact.
  assert.equal(fs.existsSync(path.join(versionDir, '.build-run.json')), false);

  // current now serves exactly this version's content.
  const currentIndex = fs.readFileSync(path.join(currentDir(), 'index.html'), 'utf8');
  const versionIndex = fs.readFileSync(path.join(versionDir, 'index.html'), 'utf8');
  assert.equal(currentIndex, versionIndex);
});
