/**
 * Publishes a built artifact to an immutable versioned location and writes
 * the build metadata + checksums the pipeline gates depend on
 * (doc sections 10.1-10.3, 11.4 step 1).
 *
 *   node tools/publish-artifact.mjs shell 3.2.0
 *   node tools/publish-artifact.mjs pricing 1.4.2
 *
 * Publishing NEVER overwrites an existing version — immutability is what
 * makes both aggressive caching and instant rollback safe.
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [artifact, version] = process.argv.slice(2);
if (!artifact || !version) {
  console.error('usage: node tools/publish-artifact.mjs <shell|pricing> <version>');
  process.exit(1);
}

const repoRoot = path.resolve(import.meta.dirname, '..');

const ARTIFACTS = {
  shell: { dist: 'dist/apps/shell/browser', publishDir: 'publish/ui/shell', remoteName: null, exposedModule: null },
  pricing: {
    dist: 'dist/apps/pricing-remote/browser',
    publishDir: 'publish/ui/pricing',
    remoteName: 'pricing',
    exposedModule: './register',
  },
};

const config = ARTIFACTS[artifact];
if (!config) {
  console.error(`unknown artifact "${artifact}" (expected: ${Object.keys(ARTIFACTS).join(', ')})`);
  process.exit(1);
}

const source = path.join(repoRoot, config.dist);
if (!fs.existsSync(source)) {
  console.error(`build output missing: ${config.dist}\nrun the build first (nx build ...)`);
  process.exit(1);
}

const target = path.join(repoRoot, config.publishDir, version);
if (fs.existsSync(target)) {
  console.error(`refusing to overwrite published version ${artifact}@${version} — published artifacts are immutable`);
  process.exit(1);
}

fs.cpSync(source, target, { recursive: true });

function checksumTree(dir, base = dir) {
  const out = {};
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(out, checksumTree(full, base));
    } else {
      const hash = createHash('sha256').update(fs.readFileSync(full)).digest('hex');
      out[path.relative(base, full)] = `sha256-${hash}`;
    }
  }
  return out;
}

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: repoRoot }).toString().trim();
} catch {
  // Publishing outside a git checkout is allowed; the metadata records it.
}

const angularVersion = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'node_modules/@angular/core/package.json'), 'utf8')
).version;

const metadata = {
  artifact,
  version,
  commit,
  builtAt: new Date().toISOString(),
  angularVersion,
  platformContract: '1.x',
  ...(config.remoteName ? { remoteName: config.remoteName, exposedModule: config.exposedModule } : {}),
};

fs.writeFileSync(path.join(target, 'build-metadata.json'), JSON.stringify(metadata, null, 2));
fs.writeFileSync(path.join(target, 'checksums.json'), JSON.stringify(checksumTree(target), null, 2));

// The shell is referenced by 100-200 ASPX pages through one stable URL, so
// it also gets a mutable `current` pointer (doc sections 8.1, 11.3).
if (artifact === 'shell') {
  const current = path.join(repoRoot, config.publishDir, 'current');
  fs.rmSync(current, { recursive: true, force: true });
  fs.cpSync(target, current, { recursive: true });
  console.info(`  updated shell/current -> ${version}`);
}

console.info(`published ${artifact}@${version} to ${path.relative(repoRoot, target)}`);
