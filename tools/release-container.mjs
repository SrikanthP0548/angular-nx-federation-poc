/**
 * Cross-platform entry point for building and publishing legacy-container.
 *
 * Controlled release (explicit version):
 *   ARTIFACT_VERSION=1.2.3 npm run release:container       # bash
 *   $env:ARTIFACT_VERSION='1.2.3'; npm run release:container # PowerShell
 *
 * Local IIS fixture (automatic unique prerelease version):
 *   npm run release:container:local
 *
 * Nx still owns the build -> stamp -> publish dependency chain. This wrapper
 * only supplies environment values without relying on shell-specific syntax.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const localMode = process.argv.includes('--local');
const generatedVersion = `0.0.0-local.${Date.now()}`;
const version =
  process.env.ARTIFACT_VERSION || (localMode ? generatedVersion : '');

if (!version) {
  console.error(
    'ARTIFACT_VERSION is required, e.g. set it to 1.2.3 before running npm run release:container; ' +
      'for a disposable local version use npm run release:container:local',
  );
  process.exit(1);
}

const runId =
  process.env.BUILD_RUN_ID || `container-${Date.now()}-${process.pid}`;
const nxCli = path.join(repoRoot, 'node_modules', 'nx', 'dist', 'bin', 'nx.js');

console.info(`releasing legacy-container@${version} (run ${runId})`);

const result = spawnSync(
  process.execPath,
  [nxCli, 'run', 'legacy-container:publish'],
  {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      ARTIFACT_VERSION: version,
      BUILD_RUN_ID: runId,
    },
  },
);

if (result.error) {
  console.error(`failed to start container release: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
