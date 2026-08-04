import { createApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  FeatureManifestEntry,
  PLATFORM_LOGGER,
  RUNTIME_CONFIG,
  RuntimeConfig,
} from '@company/shared-core';
import feature from './register';
import { PAGE_REGISTRY } from './page-registry';

/** Minimal stand-in for the shell so this provider can run on its own port. */
const runtimeConfig: RuntimeConfig = {
  environment: 'development-standalone',
  assetBasePath: '/ui',
};

const logger = {
  event: (name: string, data?: Record<string, unknown>) => console.info(`[standalone] ${name}`, data ?? {}),
  error: (name: string, error: unknown) => console.error(`[standalone] ${name}`, error),
};

// Which page to preview, so a provider serving several pages can preview each.
const requested = new URLSearchParams(location.search).get('page');
const elementName = requested && requested in PAGE_REGISTRY ? requested : 'ca-pricing-search';

const manifestEntry: FeatureManifestEntry = {
  remoteName: 'pricing',
  remoteEntry: './remoteEntry.json',
  exposedModule: './register',
  elementName,
  featureVersion: 'dev-standalone',
  contractVersion: '1.x',
  enabled: true,
};

createApplication({
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
    { provide: PLATFORM_LOGGER, useValue: logger },
  ],
})
  .then((appRef) => {
    document.body.appendChild(document.createElement(elementName));
    return feature.register({
      shellInjector: appRef.injector,
      runtimeConfig,
      feature: manifestEntry,
      logger,
    });
  })
  .catch((err) => console.error(err));
