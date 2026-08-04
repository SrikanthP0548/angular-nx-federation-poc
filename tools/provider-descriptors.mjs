/**
 * Reads and validates the `pages.json` descriptor each provider publishes.
 *
 * The descriptor is the machine-readable provider contract: it tells the
 * publishing and promotion tools which feature keys an artifact serves and
 * which custom element each one registers. Parsing `page-registry.ts` instead
 * would be fragile, so the registry is validated *against* this file rather
 * than being the source of truth for tooling.
 */
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const PROVIDERS_DIR = path.join(repoRoot, 'apps', 'providers');

const SUPPORTED_SCHEMA = '1.0';

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

/** Lists provider directory names, e.g. ['pricing-provider', ...]. */
export function listProviderDirs() {
  if (!fs.existsSync(PROVIDERS_DIR)) return [];
  return fs
    .readdirSync(PROVIDERS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(PROVIDERS_DIR, e.name, 'pages.json')))
    .map((e) => e.name)
    .sort();
}

export function descriptorPath(providerDir) {
  return path.join(PROVIDERS_DIR, providerDir, 'pages.json');
}

export function readDescriptor(providerDir) {
  return JSON.parse(fs.readFileSync(descriptorPath(providerDir), 'utf8'));
}

/** Registry keys, read from the provider's page-registry.ts object literal. */
export function readRegistryKeys(providerDir) {
  const source = fs.readFileSync(path.join(PROVIDERS_DIR, providerDir, 'src', 'page-registry.ts'), 'utf8');
  const body = source.slice(source.indexOf('PAGE_REGISTRY'));
  return [...body.matchAll(/'([a-z][a-z0-9-]*)'\s*:/g)].map((m) => m[1]);
}

/**
 * Validates one descriptor in isolation. Returns an array of problems; empty
 * means valid. Cross-provider checks live in {@link validateAllProviders}.
 */
export function validateDescriptor(providerDir, { registryKeys } = {}) {
  const problems = [];
  const descriptor = readDescriptor(providerDir);

  if (descriptor.schemaVersion !== SUPPORTED_SCHEMA) {
    problems.push(`unsupported schemaVersion "${descriptor.schemaVersion}" (expected ${SUPPORTED_SCHEMA})`);
  }
  for (const field of ['artifact', 'remoteName', 'exposedModule']) {
    if (!descriptor[field]) problems.push(`missing "${field}"`);
  }
  if (!Array.isArray(descriptor.pages) || descriptor.pages.length === 0) {
    problems.push('"pages" must be a non-empty array');
    return { descriptor, problems };
  }

  const seenKeys = new Set();
  const seenElements = new Set();
  for (const page of descriptor.pages) {
    const { featureKey, elementName } = page;
    if (!featureKey) problems.push('a page is missing "featureKey"');
    if (!elementName) problems.push(`page "${featureKey}" is missing "elementName"`);
    if (featureKey && seenKeys.has(featureKey)) problems.push(`duplicate featureKey "${featureKey}"`);
    if (elementName && seenElements.has(elementName)) problems.push(`duplicate elementName "${elementName}"`);
    seenKeys.add(featureKey);
    seenElements.add(elementName);

    if (elementName && !VALID_ELEMENT_NAME.test(elementName)) {
      problems.push(
        `"${elementName}" is not a valid custom element name — it must start with a lowercase letter and contain a hyphen`
      );
    }
    if (elementName && RESERVED_ELEMENT_NAMES.has(elementName)) {
      problems.push(`"${elementName}" is a reserved custom element name`);
    }
  }

  // Registry/descriptor agreement, both directions: either gap is a runtime
  // blank page — a descriptor entry with no registry key fails at
  // registration, and a registry key with no descriptor entry can never be
  // promoted because nothing declares its feature key.
  if (registryKeys) {
    const declared = new Set(descriptor.pages.map((p) => p.elementName));
    for (const key of registryKeys) {
      if (!declared.has(key)) problems.push(`registry serves "${key}" but pages.json does not declare it`);
    }
    for (const name of declared) {
      if (!registryKeys.includes(name)) problems.push(`pages.json declares "${name}" but the registry does not serve it`);
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
 */
export function validateAllProviders() {
  const problems = [];
  const featureKeyOwner = new Map();
  const elementOwner = new Map();

  for (const dir of listProviderDirs()) {
    const { descriptor, problems: own } = validateDescriptor(dir, { registryKeys: readRegistryKeys(dir) });
    problems.push(...own.map((p) => `${dir}: ${p}`));

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

/** Validates a descriptor against the artifact actually produced by the build. */
export function validateAgainstRemoteEntry(descriptor, remoteEntry) {
  const problems = [];
  if (remoteEntry.name !== descriptor.remoteName) {
    problems.push(`built remote is named "${remoteEntry.name}" but pages.json says "${descriptor.remoteName}"`);
  }
  const exposed = remoteEntry.exposes.map((e) => e.key);
  if (!exposed.includes(descriptor.exposedModule)) {
    problems.push(`artifact does not expose "${descriptor.exposedModule}" (exposes: ${exposed.join(', ')})`);
  }
  return problems;
}
