/**
 * Stamps built output with the current execution's run id.
 *
 * Runs as an Nx target that depends on `build`, so the stamp can only exist
 * for output produced in the same invocation.
 *
 *   node tools/stamp-build.mjs dist/apps/shell/browser
 */
import path from 'node:path';
import fs from 'node:fs';
import { writeBuildMarker } from './build-marker.mjs';

const outputDir = process.argv[2];
if (!outputDir) {
  console.error('usage: node tools/stamp-build.mjs <dist-browser-dir>');
  process.exit(1);
}

const resolved = path.resolve(import.meta.dirname, '..', outputDir);
if (!fs.existsSync(resolved)) {
  console.error(`cannot stamp missing build output: ${outputDir}`);
  process.exit(1);
}

try {
  const runId = writeBuildMarker(resolved);
  console.info(`stamped ${outputDir} with run ${runId}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
