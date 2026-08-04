import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  listProviderDirs,
  readDescriptor,
  readRegistryKeys,
  validateAllProviders,
  validateDescriptor,
} from './provider-descriptors.mjs';

test('every provider has a valid descriptor matching its registry', () => {
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

test('the pricing provider serves two pages from one artifact', () => {
  const descriptor = readDescriptor('pricing-provider');
  assert.equal(descriptor.artifact, 'pricing');
  assert.deepEqual(
    descriptor.pages.map((p) => p.featureKey),
    ['pricing-search', 'pricing-details']
  );
});

test('registry keys are actually readable — the validation is not vacuous', () => {
  // If the regex silently matched nothing, every registry/descriptor check
  // above would pass without comparing anything.
  assert.deepEqual(readRegistryKeys('pricing-provider'), ['ca-pricing-search', 'ca-pricing-details']);
  assert.deepEqual(readRegistryKeys('feature-two-provider'), ['ca-feature-two']);
});

test('a registry key missing from the descriptor is reported', () => {
  const { problems } = validateDescriptor('pricing-provider', {
    registryKeys: ['ca-pricing-search', 'ca-pricing-details', 'ca-undeclared-page'],
  });
  assert.ok(
    problems.some((p) => p.includes('ca-undeclared-page') && p.includes('pages.json does not declare it')),
    `expected an undeclared-registry-key problem, got: ${problems.join('; ')}`
  );
});

test('a descriptor entry missing from the registry is reported', () => {
  const { problems } = validateDescriptor('pricing-provider', { registryKeys: ['ca-pricing-search'] });
  assert.ok(
    problems.some((p) => p.includes('ca-pricing-details') && p.includes('the registry does not serve it')),
    `expected a missing-registry-key problem, got: ${problems.join('; ')}`
  );
});
