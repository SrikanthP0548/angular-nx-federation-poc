import type { FeatureDefinition } from '@company/platform-core';

/**
 * Compile-time composition root. Every page stays a lazy import, so inclusion
 * in this build does not mean inclusion in the browser's initial download.
 */
export const FEATURE_REGISTRY: Readonly<Record<string, FeatureDefinition>> = Object.freeze({
  'pricing-search': {
    elementName: 'ca-pricing-search',
    loadPage: async () => (await import('./feature-loaders/pricing-search')).FEATURE_PAGE,
  },
  'pricing-details': {
    elementName: 'ca-pricing-details',
    loadPage: async () => (await import('./feature-loaders/pricing-details')).FEATURE_PAGE,
  },
  'feature-two': {
    elementName: 'ca-feature-two',
    loadPage: async () => (await import('./feature-loaders/feature-two')).FEATURE_PAGE,
  },
  'feature-three': {
    elementName: 'ca-feature-three',
    loadPage: async () => (await import('./feature-loaders/feature-three')).FEATURE_PAGE,
  },
});
