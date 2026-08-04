import { createApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  FederatedFeature,
  FeatureManifestEntry,
  PLATFORM_LOGGER,
  RUNTIME_CONFIG,
  RuntimeConfig,
} from '@company/shared-core';

/**
 * Which page to preview and how to reach its registration module.
 *
 * This map exists only for the standalone dev harness — it is never published
 * or federated, so it's fine for it to know about both entry files directly
 * rather than going through the exposes map. Production code never imports
 * both pricing-search.register and pricing-details.register from one bundle;
 * this file legitimately does, for local development only.
 */
const PREVIEW_ENTRIES: Record<string, { exposedModule: string; load: () => Promise<{ default: FederatedFeature }> }> = {
  'ca-pricing-search': { exposedModule: './pricing-search', load: () => import('./pricing-search.register') },
  'ca-pricing-details': { exposedModule: './pricing-details', load: () => import('./pricing-details.register') },
};

/** Minimal stand-in for the shell so this provider can run on its own port. */
const runtimeConfig: RuntimeConfig = {
  environment: 'development-standalone',
  assetBasePath: '/ui',
};

const logger = {
  event: (name: string, data?: Record<string, unknown>) => console.info(`[standalone] ${name}`, data ?? {}),
  error: (name: string, error: unknown) => console.error(`[standalone] ${name}`, error),
};

const requested = new URLSearchParams(location.search).get('page');
const elementName = requested && requested in PREVIEW_ENTRIES ? requested : 'ca-pricing-search';
const entry = PREVIEW_ENTRIES[elementName];

const manifestEntry: FeatureManifestEntry = {
  remoteName: 'pricing',
  remoteEntry: './remoteEntry.json',
  exposedModule: entry.exposedModule,
  elementName,
  featureVersion: 'dev-standalone',
  contractVersion: '1.x',
  enabled: true,
};

Promise.all([
  createApplication({
    providers: [
      provideBrowserGlobalErrorListeners(),
      { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
      { provide: PLATFORM_LOGGER, useValue: logger },
    ],
  }),
  entry.load(),
])
  .then(([appRef, module]) => {
    document.body.appendChild(document.createElement(elementName));
    return module.default.register({
      shellInjector: appRef.injector,
      runtimeConfig,
      feature: manifestEntry,
      logger,
    });
  })
  .catch((err) => console.error(err));
