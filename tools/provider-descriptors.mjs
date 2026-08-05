/**
 * Reads and validates the `pages.json` descriptor each provider publishes.
 *
 * The descriptor is the machine-readable provider contract: it tells the
 * publishing and promotion tools which feature keys an artifact serves, which
 * custom element each one registers, and which federation `exposes` key
 * carries its code. Parsing `federation.config.mjs`/entry-file source instead
 * of trusting the descriptor blindly is what lets promotion catch drift
 * between what pages.json claims and what the code actually does.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const PROVIDERS_DIR = path.join(repoRoot, 'apps', 'providers');

const SUPPORTED_SCHEMA = '1.1';

/**
 * A custom element name must contain a hyphen and start with a lowercase
 * letter; the spec also reserves a handful of hyphenated SVG/MathML names.
 */
const VALID_ELEMENT_NAME = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;
const RESERVED_ELEMENT_NAMES = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

/** Custom-element name keys inside a createFederatedFeature({...}) call. */
const REGISTERED_KEY = /['"]([a-z][a-z0-9-]*)['"]\s*:/g;

/** Lists provider directory names, e.g. ['pricing-provider', ...]. */
export function listProviderDirs() {
  if (!fs.existsSync(PROVIDERS_DIR)) return [];
  return fs
    .readdirSync(PROVIDERS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(PROVIDERS_DIR, e.name, 'pages.json')))
    .map((e) => e.name)
    .sort();
}

function descriptorPath(providerDir) {
  return path.join(PROVIDERS_DIR, providerDir, 'pages.json');
}

export function readDescriptor(providerDir) {
  return JSON.parse(fs.readFileSync(descriptorPath(providerDir), 'utf8'));
}

/**
 * Reads a provider's `federation.config.mjs` and returns its `exposes` map as
 * `{ key: sourceFilePath }`, sourceFilePath relative to the repo root exactly
 * as authored.
 *
 * Regex over the raw source, not a dynamic `import()` of the config: importing
 * it would run `withNativeFederation()`'s full normalization pipeline, which
 * isn't needed just to validate shape and is slower and more fragile for a
 * lightweight descriptor check than reading a small, consistently-formatted
 * object literal.
 */
export function readExposesMap(providerDir) {
  const configPath = path.join(PROVIDERS_DIR, providerDir, 'federation.config.mjs');
  const source = fs.readFileSync(configPath, 'utf8');
  const block = source.match(/exposes:\s*\{([\s\S]*?)\n\s*\},/);
  if (!block) return {};
  const entries = [...block[1].matchAll(/['"](\.[^'"]+)['"]\s*:\s*['"](\.[^'"]+)['"]/g)];
  return Object.fromEntries(entries.map(([, key, file]) => [key, file]));
}

/** Extracts custom-element-name keys from a createFederatedFeature({...}) call in `source`. */
function extractRegisteredKeys(source) {
  const startIdx = source.indexOf('createFederatedFeature(');
  const body = startIdx === -1 ? source : source.slice(startIdx);
  return [...body.matchAll(REGISTERED_KEY)].map((m) => m[1]);
}

/**
 * Element names an exposed entry file actually registers.
 *
 * Two shapes exist in this workspace and both are handled: a thin entry file
 * that inlines `createFederatedFeature({ 'name': ... })` directly (the
 * pricing pages), or one that calls `createFederatedFeature(PAGE_REGISTRY)`
 * with the object literal living in a sibling `page-registry.ts` (the
 * single-page providers, left as-is per the per-page-exposes change so their
 * working registry pattern isn't disturbed for no reason).
 */
export function readRegisteredElementNames(absoluteSourceFilePath) {
  const source = fs.readFileSync(absoluteSourceFilePath, 'utf8');
  const inline = extractRegisteredKeys(source);
  if (inline.length > 0) return inline;

  const siblingRegistry = path.join(path.dirname(absoluteSourceFilePath), 'page-registry.ts');
  if (fs.existsSync(siblingRegistry)) {
    return extractRegisteredKeys(fs.readFileSync(siblingRegistry, 'utf8'));
  }
  return [];
}

/**
 * Validates one descriptor in isolation. Returns an array of problems; empty
 * means valid. Cross-provider checks live in {@link validateAllProviders}.
 *
 * Also flags an exposed key with no claiming page: an unclaimed key can never
 * be promoted, since no manifest entry can name it.
 */
export function validateDescriptor(providerDir, overrides = {}) {
  const problems = [];
  const descriptor = overrides.descriptor ?? readDescriptor(providerDir);
  const exposesMap = overrides.exposesMap ?? readExposesMap(providerDir);

  if (descriptor.schemaVersion !== SUPPORTED_SCHEMA) {
    problems.push(`unsupported schemaVersion "${descriptor.schemaVersion}" (expected ${SUPPORTED_SCHEMA})`);
  }
  for (const field of ['artifact', 'remoteName']) {
    if (!descriptor[field]) problems.push(`missing "${field}"`);
  }
  if (!Array.isArray(descriptor.pages) || descriptor.pages.length === 0) {
    problems.push('"pages" must be a non-empty array');
    return { descriptor, problems };
  }

  const seenKeys = new Set();
  const seenElements = new Set();
  const seenExposedModules = new Set();

  for (const page of descriptor.pages) {
    const { featureKey, elementName, exposedModule } = page;

    if (!featureKey) problems.push('a page is missing "featureKey"');
    if (!elementName) problems.push(`page "${featureKey}" is missing "elementName"`);
    if (!exposedModule) problems.push(`page "${featureKey}" is missing "exposedModule"`);

    if (featureKey && seenKeys.has(featureKey)) problems.push(`duplicate featureKey "${featureKey}"`);
    if (elementName && seenElements.has(elementName)) problems.push(`duplicate elementName "${elementName}"`);
    if (exposedModule && seenExposedModules.has(exposedModule)) {
      problems.push(`duplicate exposedModule "${exposedModule}" — two pages cannot share one exposed key`);
    }
    seenKeys.add(featureKey);
    seenElements.add(elementName);
    seenExposedModules.add(exposedModule);

    if (elementName && !VALID_ELEMENT_NAME.test(elementName)) {
      problems.push(
        `"${elementName}" is not a valid custom element name — it must start with a lowercase letter and contain a hyphen`
      );
    }
    if (elementName && RESERVED_ELEMENT_NAMES.has(elementName)) {
      problems.push(`"${elementName}" is a reserved custom element name`);
    }

    if (!exposedModule) continue;

    const sourceFile = exposesMap[exposedModule];
    if (!sourceFile) {
      problems.push(
        `page "${featureKey}" declares exposedModule "${exposedModule}" but federation.config.mjs does not ` +
          `expose it (exposes: ${Object.keys(exposesMap).join(', ') || 'nothing'})`
      );
      continue;
    }

    const absolute = path.join(repoRoot, sourceFile);
    const registered = fs.existsSync(absolute) ? readRegisteredElementNames(absolute) : [];
    if (elementName && !registered.includes(elementName)) {
      problems.push(
        `page "${featureKey}" expects exposedModule "${exposedModule}" to register "${elementName}", but it ` +
          `actually registers: ${registered.join(', ') || 'nothing'}`
      );
    }
  }

  const claimedModules = new Set(descriptor.pages.map((p) => p.exposedModule));
  for (const key of Object.keys(exposesMap)) {
    if (!claimedModules.has(key)) {
      problems.push(`federation.config.mjs exposes "${key}" but pages.json does not declare a page for it`);
    }
  }

  return { descriptor, problems };
}

/**
 * Validates every provider, including uniqueness ACROSS providers.
 *
 * Two providers claiming the same element name cannot collide at runtime —
 * the shell loads one provider per document — but the manifest could route a
 * feature key to the wrong artifact, and the ambiguity only gets harder to
 * unwind as providers multiply.
 *
 * A duplicate `artifact` name is checked for the same reason:
 * publish-artifact.mjs keys its artifact map by `descriptor.artifact`, so a
 * collision would silently make one provider unreachable by name — whichever
 * is processed last in the map wins, the other can never be published or
 * promoted again through the normal CLI.
 */
export function validateAllProviders() {
  const problems = [];
  const featureKeyOwner = new Map();
  const elementOwner = new Map();
  const artifactOwner = new Map();
  const remoteNameOwner = new Map();

  for (const dir of listProviderDirs()) {
    const { descriptor, problems: own } = validateDescriptor(dir);
    problems.push(...own.map((p) => `${dir}: ${p}`));

    if (descriptor.artifact) {
      const priorArtifact = artifactOwner.get(descriptor.artifact);
      if (priorArtifact) {
        problems.push(`artifact "${descriptor.artifact}" is claimed by both ${priorArtifact} and ${dir}`);
      } else {
        artifactOwner.set(descriptor.artifact, dir);
      }
    }

    if (descriptor.remoteName) {
      const priorRemote = remoteNameOwner.get(descriptor.remoteName);
      if (priorRemote) {
        problems.push(`remoteName "${descriptor.remoteName}" is claimed by both ${priorRemote} and ${dir}`);
      } else {
        remoteNameOwner.set(descriptor.remoteName, dir);
      }
    }

    for (const page of descriptor.pages ?? []) {
      const priorKey = featureKeyOwner.get(page.featureKey);
      if (priorKey) {
        problems.push(`featureKey "${page.featureKey}" is claimed by both ${priorKey} and ${dir}`);
      } else {
        featureKeyOwner.set(page.featureKey, dir);
      }

      const priorElement = elementOwner.get(page.elementName);
      if (priorElement) {
        problems.push(`elementName "${page.elementName}" is claimed by both ${priorElement} and ${dir}`);
      } else {
        elementOwner.set(page.elementName, dir);
      }
    }
  }

  return problems;
}

/**
 * Validates a descriptor against the artifact the build actually produced —
 * per page, since one artifact can expose several keys. This is what catches
 * drift between what pages.json claims and what esbuild really emitted.
 */
export function validateAgainstRemoteEntry(descriptor, remoteEntry) {
  const problems = [];
  if (remoteEntry.name !== descriptor.remoteName) {
    problems.push(`built remote is named "${remoteEntry.name}" but pages.json says "${descriptor.remoteName}"`);
  }
  const exposed = remoteEntry.exposes.map((e) => e.key);
  for (const page of descriptor.pages ?? []) {
    if (!exposed.includes(page.exposedModule)) {
      problems.push(
        `artifact does not expose "${page.exposedModule}" for feature "${page.featureKey}" (exposes: ${exposed.join(', ')})`
      );
    }
  }
  return problems;
}
