/**
 * Small, independently-testable pieces of the release pipeline, extracted
 * out of publish-artifact.mjs and promote-manifest.mjs so each one has a
 * dedicated regression test instead of only ever being exercised as part of
 * a full CLI run. Behavior-preserving extraction — the CLI scripts import
 * these rather than reimplementing the logic inline.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A published version becomes a filesystem directory name directly
 * (`path.join(publishDir, version)`), and it can come from CI parameters
 * (`ARTIFACT_VERSION`) rather than a hard-coded constant — so it must be
 * validated as untrusted input, not trusted as an operator-supplied literal.
 *
 * Strict SemVer, allow-listed rather than block-listed: rejecting "/", "\",
 * "..", absolute paths, and encoded traversal forms individually is easy to
 * get wrong (miss a variant, e.g. a backslash on Windows, or a percent-encoded
 * ".."). Requiring the whole string to match this shape instead means every
 * one of those is rejected as a side effect of not being valid SemVer — none
 * of that character set is legal in any SemVer component — not because it
 * was explicitly anticipated and blocked.
 */
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export function isValidPublishVersion(version) {
  return typeof version === 'string' && SEMVER_RE.test(version);
}

/**
 * Removes status lines for paths that are release OUTPUT rather than a
 * build INPUT (e.g. `publish/ui/manifest.json`, which publishing and
 * promotion both legitimately write) from raw `git status --porcelain`
 * output.
 *
 * Matches by suffix, not a fixed column offset: the porcelain status-prefix
 * width is not constant — a staged-only change reports narrower than a
 * staged-and-modified one — confirmed by inspecting real output rather than
 * assuming the documented format held in practice.
 */
export function filterReleaseOutputPaths(rawStatus, excludePaths) {
  return rawStatus
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .filter((line) => !excludePaths.some((p) => line.endsWith(p)))
    .join('\n');
}

/**
 * Whether the working tree has uncommitted changes, excluding release
 * output paths. Returns `{ dirty: false, status: null }` outside a git
 * checkout — publishing without git is allowed; the caller records that in
 * metadata rather than treating it as clean or dirty.
 */
export function checkWorkingTree(repoRoot, excludePaths) {
  let raw;
  try {
    raw = execSync('git status --porcelain', { cwd: repoRoot }).toString().trim();
  } catch {
    return { dirty: false, status: null };
  }
  const status = filterReleaseOutputPaths(raw, excludePaths);
  return { dirty: Boolean(status), status };
}

/**
 * Verifies every file in `checksums` against what's actually on disk under
 * `dir`. Returns an array of human-readable mismatch messages — empty means
 * every file matches. `checksums.json` itself is the one legitimate
 * exclusion: it is written after the tree is hashed, so it cannot contain
 * its own hash.
 */
export function verifyChecksums(dir, checksums) {
  const problems = [];
  for (const [relative, expected] of Object.entries(checksums)) {
    if (relative === 'checksums.json') continue;
    const filePath = path.join(dir, relative);
    if (!fs.existsSync(filePath)) {
      problems.push(`${relative} is listed in checksums.json but missing from the artifact`);
      continue;
    }
    const actual = `sha256-${createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;
    if (actual !== expected) {
      problems.push(`checksum mismatch for ${relative} — the published artifact was modified after publication`);
    }
  }
  return problems;
}

/**
 * Updates `manifest.shell.version` in the runtime manifest at `manifestPath`
 * and writes it atomically (temp file + rename). Returns `false` without
 * writing if the manifest doesn't exist yet. Left as its own function so a
 * shell publish that fails partway can't leave a torn manifest.json.
 */
export function syncShellVersion(manifestPath, version, { pid = process.pid } = {}) {
  if (!fs.existsSync(manifestPath)) return false;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.shell = { ...manifest.shell, version };
  const tempPath = `${manifestPath}.${pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(manifest, null, 2) + '\n');
  fs.renameSync(tempPath, manifestPath);
  return true;
}

/**
 * Recursively hashes every file under `dir`, keyed by path relative to
 * `base`. Extracted so a non-federation publish script (e.g. legacy-container,
 * which has no remoteEntry/provider descriptor) can produce a checksums.json
 * identical in shape to publish-artifact.mjs's without duplicating the walk.
 * publish-artifact.mjs keeps its own inline copy for now — behavior-identical,
 * left alone rather than refactored, per the isolated/additive constraint on
 * this change.
 */
export function checksumTree(dir, base = dir) {
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

/**
 * Copies `source` into a same-pid-scoped staging directory under
 * `publishDir`, rather than directly into `<publishDir>/<version>`, and
 * throws if that version already exists. A copy interrupted partway
 * (crash, disk full, kill) leaves only a stray `.tmp-<pid>` directory
 * behind — never a partial version directory sitting at the real,
 * immutable-by-name path, which a retry of the same version could then
 * never get past (the existence check would see it and refuse forever,
 * with no way to recover except a manual delete). Pair with
 * `finalizeVersionPublish` once the staged copy is fully written (metadata,
 * checksums, whatever else the caller adds) to make it visible atomically.
 */
export function beginVersionPublish(publishDir, source, version, { pid = process.pid } = {}) {
  const target = path.join(publishDir, version);
  if (fs.existsSync(target)) {
    throw new Error(`refusing to overwrite published version "${version}" — published artifacts are immutable`);
  }
  const staging = path.join(publishDir, `.${version}.tmp-${pid}`);
  fs.rmSync(staging, { recursive: true, force: true });
  fs.cpSync(source, staging, { recursive: true });
  return staging;
}

/**
 * Renames a directory staged by `beginVersionPublish` into its final,
 * immutable `<publishDir>/<version>` name — a single atomic syscall on
 * POSIX, so the version is either fully absent or fully present, never
 * partial. Re-checks immutability immediately before the rename (not just
 * relying on `beginVersionPublish`'s earlier check) to close the race where
 * a second process publishes the same version in between.
 */
export function finalizeVersionPublish(publishDir, staging, version) {
  const target = path.join(publishDir, version);
  if (fs.existsSync(target)) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw new Error(`refusing to overwrite published version "${version}" — published artifacts are immutable`);
  }
  fs.renameSync(staging, target);
  return target;
}

/**
 * Activates a new shell version at `<publishDir>/current`, replacing
 * whatever was there.
 *
 * Builds the replacement fully under a temp name first, then swaps it in
 * with two directory renames (each atomic on POSIX) rather than
 * delete-then-recursive-copy, which leaves a real window where a concurrent
 * request could see `current` missing or half-written. POSIX rename cannot
 * replace a non-empty directory in one step, so the old `current` is moved
 * aside rather than overwritten directly — that move is itself atomic, and
 * the moment the new directory lands at `current` is a single syscall, not a
 * copy loop.
 *
 * Tolerant of stale `.current-tmp-*`/`.current-old-*` leftovers from a
 * previous run that crashed mid-swap under a different pid: this run's own
 * temp names are pid-scoped, so a stale leftover from another pid never
 * collides with — and is never touched by — a fresh run.
 */
export function activateShellCurrent(publishDir, sourceDir, { pid = process.pid } = {}) {
  const current = path.join(publishDir, 'current');
  const stagedNew = path.join(publishDir, `.current-tmp-${pid}`);
  const staleOld = path.join(publishDir, `.current-old-${pid}`);

  fs.rmSync(stagedNew, { recursive: true, force: true });
  fs.cpSync(sourceDir, stagedNew, { recursive: true });
  if (fs.existsSync(current)) {
    fs.renameSync(current, staleOld);
  }
  fs.renameSync(stagedNew, current);
  fs.rmSync(staleOld, { recursive: true, force: true });
}
