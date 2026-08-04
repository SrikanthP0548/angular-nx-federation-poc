/**
 * The shell loader (apps/shell/src/main.ts) cannot import the platform
 * contract package at runtime: it executes before Native Federation installs
 * the shared-dependency import map, so a value import there fails to
 * resolve. It therefore re-declares the contract major version locally.
 *
 * That duplication is only safe if something enforces the two stay equal —
 * this test is that enforcement. Without it, bumping the contract to 2.0
 * would leave the shell silently accepting 1.x remotes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

const contractSource = fs.readFileSync(
  path.join(repoRoot, 'libs/platform/contract/src/lib/contract.ts'),
  'utf8'
);
const loaderSource = fs.readFileSync(path.join(repoRoot, 'apps/shell/src/main.ts'), 'utf8');

test('the shell loader\'s contract major matches PLATFORM_CONTRACT_VERSION', () => {
  const contractMatch = contractSource.match(/PLATFORM_CONTRACT_VERSION\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(contractMatch, 'PLATFORM_CONTRACT_VERSION not found in the contract library');

  const loaderMatch = loaderSource.match(/SHELL_CONTRACT_MAJOR\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(loaderMatch, 'SHELL_CONTRACT_MAJOR not found in the shell loader');

  const contractMajor = contractMatch[1].split('.')[0];
  assert.equal(
    loaderMatch[1],
    contractMajor,
    `shell loader declares contract major ${loaderMatch[1]} but the contract package is ${contractMatch[1]}`
  );
});

test('the shell loader has no runtime import of the contract package', () => {
  // A value import here would break every page: main.js runs before the
  // import map exists, so the bare specifier cannot resolve.
  const contractImports = [...loaderSource.matchAll(/^import\s+([^;]*?)\s+from\s+['"]@company\/angular-platform-contract['"]/gm)];

  for (const [statement, clause] of contractImports) {
    assert.ok(
      clause.trimStart().startsWith('type '),
      `shell loader imports the contract package at runtime: ${statement.trim()}`
    );
  }
});
