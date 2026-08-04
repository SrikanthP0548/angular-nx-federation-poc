/**
 * Build provenance.
 *
 * Publishing must never trust a `dist/` directory it did not just produce: a
 * stale or partial build is indistinguishable from a fresh one on disk. The
 * build stamps its output with the id of the execution that produced it, and
 * publishing refuses anything whose stamp is missing or from another run.
 *
 * `BUILD_RUN_ID` is required rather than defaulted, because a per-process
 * fallback would silently pass — each tool invocation is its own process, so
 * every one would mint an id that matches only itself. Requiring the value to
 * come from the surrounding execution is what makes the check structural.
 * The `build` and `publish` npm scripts and Nx targets set it.
 */
import fs from 'node:fs';
import path from 'node:path';

const MARKER_FILE = '.build-run.json';

export function requireRunId(action) {
  const runId = process.env['BUILD_RUN_ID'];
  if (!runId) {
    throw new Error(
      `BUILD_RUN_ID is not set, so ${action} cannot prove which execution produced this output. ` +
        `Use the publish target (which depends on build and sets it) rather than calling this script directly.`
    );
  }
  return runId;
}

export function writeBuildMarker(outputDir) {
  const runId = requireRunId('stamping the build');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, MARKER_FILE),
    JSON.stringify({ runId, builtAt: new Date().toISOString() }, null, 2)
  );
  return runId;
}

/** Throws unless `outputDir` was produced by the current execution. Fails closed. */
export function assertBuiltInThisRun(outputDir) {
  const expected = requireRunId('publishing');
  const markerPath = path.join(outputDir, MARKER_FILE);

  if (!fs.existsSync(markerPath)) {
    throw new Error(
      `no build marker in ${outputDir} — publishing requires output from a build in this same execution, ` +
        `and an existing dist/ is never evidence of one.`
    );
  }

  const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
  if (marker.runId !== expected) {
    throw new Error(
      `${outputDir} was built by run "${marker.runId}" but this is run "${expected}" — ` +
        `refusing to publish a stale artifact.`
    );
  }
  return marker;
}

export { MARKER_FILE };
