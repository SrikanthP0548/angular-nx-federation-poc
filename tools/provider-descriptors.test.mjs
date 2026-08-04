import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  listProviderDirs,
  readDescriptor,
  readExposesMap,
  readRegisteredElementNames,
  validateAllProviders,
  validateDescriptor,
} from './provider-descriptors.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

test('every provider has a valid descriptor matching its exposes map', () => {
  const problems = validateAllProviders();
  assert.deepEqual(problems, [], `descriptor validation failed:\n  ${problems.join('\n  ')}`);
});

test('all three providers are discovered', () => {
  assert.deepEqual(listProviderDirs(), [
    'feature-three-provider',
    'feature-two-provider',
    'pricing-provider',
  ]);
});

test('the pricing provider serves two pages from one artifact, each with its own exposed key', () => {
  const descriptor = readDescriptor('pricing-provider');
  assert.equal(descriptor.artifact, 'pricing');
  assert.deepEqual(
    descriptor.pages.map((p) => [p.featureKey, p.exposedModule]),
    [
      ['pricing-search', './pricing-search'],
      ['pricing-details', './pricing-details'],
    ]
  );
});

test('exposes map is actually readable from federation.config.mjs — not vacuous', () => {
  // If the regex silently matched nothing, every check below would pass
  // without comparing anything against real source.
  assert.deepEqual(readExposesMap('pricing-provider'), {
    './pricing-search': './apps/providers/pricing-provider/src/pricing-search.register.ts',
    './pricing-details': './apps/providers/pricing-provider/src/pricing-details.register.ts',
  });
});

test('registered element names are read correctly for the inline pattern (pricing pages)', () => {
  const file = path.join(repoRoot, 'apps/providers/pricing-provider/src/pricing-search.register.ts');
  assert.deepEqual(readRegisteredElementNames(file), ['ca-pricing-search']);
});

test('registered element names are read correctly for the registry-indirection pattern (feature-two/three)', () => {
  // register.ts itself has no inline object — createFederatedFeature(PAGE_REGISTRY) —
  // so this only passes if the sibling page-registry.ts fallback actually fires.
  const file = path.join(repoRoot, 'apps/providers/feature-two-provider/src/register.ts');
  assert.deepEqual(readRegisteredElementNames(file), ['ca-feature-two']);
});

test('a page whose exposedModule the provider does not expose is reported', () => {
  const { problems } = validateDescriptor('pricing-provider', {
    exposesMap: { './pricing-search': './apps/providers/pricing-provider/src/pricing-search.register.ts' },
  });
  assert.ok(
    problems.some((p) => p.includes('pricing-details') && p.includes('does not expose it')),
    `expected a missing-exposedModule problem, got: ${problems.join('; ')}`
  );
});

test('an exposed key with no page claiming it is reported', () => {
  const { problems } = validateDescriptor('pricing-provider', {
    exposesMap: {
      './pricing-search': './apps/providers/pricing-provider/src/pricing-search.register.ts',
      './pricing-details': './apps/providers/pricing-provider/src/pricing-details.register.ts',
      './pricing-history': './apps/providers/pricing-provider/src/pricing-search.register.ts',
    },
  });
  assert.ok(
    problems.some((p) => p.includes('./pricing-history') && p.includes('does not declare a page for it')),
    `expected an unclaimed-exposed-key problem, got: ${problems.join('; ')}`
  );
});

test('a page whose elementName does not match what its exposedModule actually registers is reported', () => {
  // Deliberately point ./pricing-search at pricing-details' entry file — the
  // descriptor still claims ca-pricing-search, but that file only registers
  // ca-pricing-details. This exercises real file reads, not a mock.
  const { problems } = validateDescriptor('pricing-provider', {
    exposesMap: {
      './pricing-search': './apps/providers/pricing-provider/src/pricing-details.register.ts',
      './pricing-details': './apps/providers/pricing-provider/src/pricing-details.register.ts',
    },
  });
  assert.ok(
    problems.some(
      (p) => p.includes('ca-pricing-search') && p.includes('actually registers: ca-pricing-details')
    ),
    `expected an elementName-mismatch problem, got: ${problems.join('; ')}`
  );
});

test('two pages sharing the same exposedModule is reported', () => {
  const { problems } = validateDescriptor('pricing-provider', {
    descriptor: {
      schemaVersion: '1.1',
      artifact: 'pricing',
      remoteName: 'pricing',
      pages: [
        { featureKey: 'pricing-search', elementName: 'ca-pricing-search', exposedModule: './pricing-search' },
        { featureKey: 'pricing-details', elementName: 'ca-pricing-details', exposedModule: './pricing-search' },
      ],
    },
    exposesMap: {
      './pricing-search': './apps/providers/pricing-provider/src/pricing-search.register.ts',
    },
  });
  assert.ok(
    problems.some((p) => p.includes('duplicate exposedModule "./pricing-search"')),
    `expected a duplicate-exposedModule problem, got: ${problems.join('; ')}`
  );
});

test('an old-shape descriptor (top-level exposedModule) fails the schema check', () => {
  const { problems } = validateDescriptor('pricing-provider', {
    descriptor: {
      schemaVersion: '1.0',
      artifact: 'pricing',
      remoteName: 'pricing',
      exposedModule: './register',
      pages: [{ featureKey: 'pricing-search', elementName: 'ca-pricing-search' }],
    },
  });
  assert.ok(
    problems.some((p) => p.includes('unsupported schemaVersion "1.0"')),
    `expected a schema-version problem, got: ${problems.join('; ')}`
  );
  assert.ok(
    problems.some((p) => p.includes('missing "exposedModule"')),
    `expected the per-page exposedModule to be reported missing, got: ${problems.join('; ')}`
  );
});
