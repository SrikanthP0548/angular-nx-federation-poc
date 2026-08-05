/**
 * Federation build gate.
 *
 *   node tools/verify-bundle.mjs                       # every built artifact
 *   node tools/verify-bundle.mjs dist/apps/shell/browser
 *
 * Three failures this catches, all of which produce a clean build and break
 * only at runtime:
 *
 *  1. A workspace library silently shared as a singleton. Native Federation
 *     shares every tsconfig.base.json path entry unless `sharedMappings` is
 *     set, so a new feature library becomes a strict-version singleton pinned
 *     to the root package version without anyone editing a config.
 *
 *  2. shared-core NOT shared. Its InjectionTokens are compared by identity, so
 *     a second copy makes every inject() of them throw NullInjectorError at
 *     first render. This is the more dangerous direction, and asserting the
 *     absence of (1) does not catch it.
 *
 *  3. A bare specifier with no import-map entry. A shared bundle's own static
 *     imports must resolve through the map, and pruning is by usage in app
 *     code — the wrong question. @angular/platform-browser imports
 *     @angular/common/http, and @angular/core imports rxjs/operators, in
 *     paths this app never executes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SHARED_MAPPINGS } from './federation-sharing.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

/** Bare specifiers imported or re-exported by a module. */
const IMPORT_SOURCE = /(?:^|[\s;])(?:import|export)[^'"]*?from\s*["']([^"']+)["']/gm;

function tsconfigPathKeys() {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tsconfig.base.json'), 'utf8'));
  return new Set(Object.keys(tsconfig.compilerOptions?.paths ?? {}));
}

function discoverArtifacts() {
  const roots = [path.join(repoRoot, 'dist/apps/shell'), ...globProviderDists()];
  return roots.map((r) => path.join(r, 'browser')).filter((d) => fs.existsSync(path.join(d, 'remoteEntry.json')));
}

function globProviderDists() {
  const providersDist = path.join(repoRoot, 'dist/apps/providers');
  if (!fs.existsSync(providersDist)) return [];
  return fs
    .readdirSync(providersDist, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(providersDist, e.name));
}

/**
 * The shell's import map, which is installed first and therefore resolves
 * specifiers for every provider loaded into the document. A provider's own
 * map is only the delta it contributes, so checking a provider against its
 * own map alone reports specifiers that resolve perfectly well at runtime.
 */
function readShellImports() {
  const shellMap = path.join(repoRoot, 'dist/apps/shell/browser/importmap.json');
  if (!fs.existsSync(shellMap)) return new Set();
  return new Set(Object.keys(JSON.parse(fs.readFileSync(shellMap, 'utf8')).imports ?? {}));
}

function verifyArtifact(distDir, workspacePathKeys, shellImports) {
  const failures = [];
  const remoteEntry = JSON.parse(fs.readFileSync(path.join(distDir, 'remoteEntry.json'), 'utf8'));
  const shared = new Map(remoteEntry.shared.map((s) => [s.packageName, s]));

  // An npm external always carries the bundle-group name; a workspace mapping
  // never does. That is the definitive classifier.
  const mappings = remoteEntry.shared.filter((s) => !('bundle' in s)).map((s) => s.packageName);

  // (1) No workspace library shared unless allowlisted.
  for (const name of mappings) {
    if (!SHARED_MAPPINGS.includes(name)) {
      failures.push(
        `workspace library "${name}" appears in remoteEntry.shared. Native Federation shares every ` +
          `tsconfig.base.json path entry unless sharedMappings is set — add it to tools/federation-sharing.mjs ` +
          `only if it must be a cross-artifact singleton, otherwise the allowlist is out of sync with the configs.`
      );
    }
  }
  // Belt and braces: a path key that reached `shared` some other way.
  for (const name of workspacePathKeys) {
    if (shared.has(name) && !SHARED_MAPPINGS.includes(name)) {
      failures.push(`workspace path "${name}" is shared but not allowlisted`);
    }
  }

  // (2) Every allowlisted mapping present and a strict singleton.
  for (const name of SHARED_MAPPINGS) {
    const entry = shared.get(name);
    if (!entry) {
      failures.push(
        `"${name}" is NOT shared by this artifact — it therefore carries a private copy, so its ` +
          `InjectionToken instances differ from the shell's and every inject() of them will throw ` +
          `NullInjectorError at first render.`
      );
      continue;
    }
    if (!entry.singleton) failures.push(`"${name}" is shared but not singleton — a second instance could load`);
    if (!entry.strictVersion) failures.push(`"${name}" is shared without strictVersion — a mismatch would fail silently`);
  }

  // Framework packages that are present must be strict singletons. Presence
  // itself is not required: an artifact that never touches @angular/forms
  // legitimately does not share it.
  for (const entry of remoteEntry.shared) {
    if (!('bundle' in entry)) continue;
    if (!entry.singleton) failures.push(`"${entry.packageName}" is shared but not singleton`);
    if (!entry.strictVersion) failures.push(`"${entry.packageName}" is shared without strictVersion`);
  }

  // (3) Every bare specifier resolvable through the import map.
  const importMapPath = path.join(distDir, 'importmap.json');
  if (fs.existsSync(importMapPath)) {
    const importMap = JSON.parse(fs.readFileSync(importMapPath, 'utf8'));
    // Workspace mappings are registered at runtime from remoteEntry.json
    // rather than appearing in importmap.json, so they resolve too.
    const resolvable = new Set([
      ...Object.keys(importMap.imports ?? {}),
      ...shellImports,
      ...mappings,
      ...SHARED_MAPPINGS,
    ]);

    for (const file of fs.readdirSync(distDir)) {
      if (!file.endsWith('.js')) continue;
      const content = fs.readFileSync(path.join(distDir, file), 'utf8');
      for (const [, specifier] of content.matchAll(IMPORT_SOURCE)) {
        if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('http')) continue;
        // Skip specifiers built from template literals — those are runtime
        // constructions, not static bare specifiers.
        if (specifier.includes('${')) continue;
        // Native Federation's own chunk aliases are registered at load time
        // from remoteEntry.json, never from importmap.json.
        if (specifier.startsWith('@nf-internal/')) continue;
        if (!resolvable.has(specifier)) {
          failures.push(
            `${file} imports "${specifier}" but nothing in the import map resolves it — ` +
              `add it to SHARED_PACKAGES in tools/federation-sharing.mjs. ` +
              `This fails at runtime with "Unable to resolve specifier", not at build time.`
          );
        }
      }
    }
  }

  return { name: remoteEntry.name ?? path.basename(distDir), failures: [...new Set(failures)] };
}

const explicit = process.argv[2];
const artifacts = explicit ? [path.resolve(repoRoot, explicit)] : discoverArtifacts();

if (artifacts.length === 0) {
  console.error('no built federation artifacts found — run the build first');
  process.exit(1);
}

const workspacePathKeys = tsconfigPathKeys();
const shellImports = readShellImports();
let failed = false;

for (const distDir of artifacts) {
  if (!fs.existsSync(path.join(distDir, 'remoteEntry.json'))) {
    console.error(`no remoteEntry.json in ${distDir} — is this a federated build?`);
    failed = true;
    continue;
  }
  const { name, failures } = verifyArtifact(distDir, workspacePathKeys, shellImports);
  if (failures.length > 0) {
    failed = true;
    console.error(`FAILED ${name} (${path.relative(repoRoot, distDir)}):`);
    for (const failure of failures) console.error(`  - ${failure}`);
  } else {
    console.info(`ok ${name} — shared mappings: ${SHARED_MAPPINGS.join(', ')}`);
  }
}

process.exit(failed ? 1 : 0);
