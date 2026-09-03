import { describe, expect, it } from 'vitest';
import { FEATURE_REGISTRY } from './feature-registry';

describe('feature registry', () => {
  it('contains every migrated page', () => {
    expect(Object.keys(FEATURE_REGISTRY).sort()).toEqual([
      'feature-three',
      'feature-two',
      'pricing-details',
      'pricing-search',
    ]);
  });

  it('uses one unique, valid custom-element name per feature', () => {
    const elementNames = Object.values(FEATURE_REGISTRY).map((feature) => feature.elementName);

    expect(new Set(elementNames).size).toBe(elementNames.length);
    for (const elementName of elementNames) {
      expect(elementName).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/);
    }
  });

  it('keeps every page behind a loader function', () => {
    for (const feature of Object.values(FEATURE_REGISTRY)) {
      expect(feature.loadPage).toBeTypeOf('function');
    }
  });
});
