/**
 * Bundle inspection gate (doc sections 6.4, 10.4 and 15.2).
 *
 *   node tools/verify-bundle.mjs dist/apps/pricing-remote/browser
 *
 * The single most important build gate in this architecture: a remote that
 * silently ships its own Angular runtime still *works*, so nothing fails
 * until two Angular copies are live in one page and injection, change
 * detection or element registration break in ways that are very hard to
 * diagnose. This check must run in every remote pipeline.
 */
import fs from 'node:fs';
import path from 'node:path';

const distDir = process.argv[2];
if (!distDir) {
  console.error('usage: node tools/verify-bundle.mjs <dist-browser-dir>');
  process.exit(1);
}

const remoteEntryPath = path.join(distDir, 'remoteEntry.json');
if (!fs.existsSync(remoteEntryPath)) {
  console.error(`no remoteEntry.json in ${distDir} — is this a federated remote build?`);
  process.exit(1);
}

const remoteEntry = JSON.parse(fs.readFileSync(remoteEntryPath, 'utf8'));
const failures = [];

const REQUIRED_SINGLETONS = ['@angular/core', '@angular/common', '@angular/elements', 'rxjs'];
const shared = new Map(remoteEntry.shared.map((s) => [s.packageName, s]));

for (const pkg of REQUIRED_SINGLETONS) {
  const entry = shared.get(pkg);
  if (!entry) {
    failures.push(`${pkg} is not declared as a shared dependency — it would be bundled into the remote`);
    continue;
  }
  if (!entry.singleton) {
    failures.push(`${pkg} is shared but not singleton — a second instance could load at runtime`);
  }
  if (!entry.strictVersion) {
    failures.push(`${pkg} is shared without strictVersion — a version mismatch would fail silently`);
  }
}

// Every chunk of the remote's own code must reach Angular through a bare
// specifier, which the import map resolves to the single shared instance.
// A relative import of an Angular package is the signature of a private
// copy bundled into the remote — the exact thing that puts two Angular
// runtimes in one page.
//
// Searching for `ɵɵ`-prefixed symbols does NOT work here: a remote's own
// components legitimately emit `ɵɵdefineComponent` as AOT output, so that
// test flags every healthy build.
const sharedFiles = new Set(remoteEntry.shared.map((s) => s.outFileName));
const ANGULAR_PACKAGE = /^(@angular\/[\w-]+|rxjs)(\/.*)?$/;
const IMPORT_SOURCE = /(?:^|\s)(?:import|export)[^'"]*?from\s*["']([^"']+)["']/gm;

for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
  if (sharedFiles.has(entry.name)) continue;
  if (entry.name === 'polyfills.js') continue;

  const content = fs.readFileSync(path.join(distDir, entry.name), 'utf8');
  for (const [, source] of content.matchAll(IMPORT_SOURCE)) {
    // A relative import that resolves into one of the shared out-files means
    // the chunk bypassed the import map and pinned a private copy.
    if (source.startsWith('.') && sharedFiles.has(path.basename(source))) {
      failures.push(
        `${entry.name} imports "${source}" relatively — it must import the bare specifier so the shared instance is used`
      );
    }
  }
}

// Every Angular package the remote's code imports by bare specifier has to
// be declared shared, or the import map has nothing to resolve it to.
const importedAngularPackages = new Set();
for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.js') || sharedFiles.has(entry.name)) continue;
  const content = fs.readFileSync(path.join(distDir, entry.name), 'utf8');
  for (const [, source] of content.matchAll(IMPORT_SOURCE)) {
    if (ANGULAR_PACKAGE.test(source)) importedAngularPackages.add(source);
  }
}
for (const pkg of importedAngularPackages) {
  if (!shared.has(pkg)) {
    failures.push(`${pkg} is imported by remote code but is not declared shared — it would resolve to a private copy`);
  }
}

if (failures.length > 0) {
  console.error('bundle verification FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.info(`bundle verification passed for ${remoteEntry.name}`);
console.info(`  shared singletons: ${REQUIRED_SINGLETONS.join(', ')}`);
console.info(`  exposes: ${remoteEntry.exposes.map((e) => e.key).join(', ')}`);
