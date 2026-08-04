import { createApplication } from '@angular/platform-browser';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  FeatureManifestEntry,
  PLATFORM_LOGGER,
  RUNTIME_CONFIG,
  RuntimeConfig,
} from '@company/shared-core';
import feature from './register';

/** Minimal stand-in for the shell so the remote can run on its own port. */
const runtimeConfig: RuntimeConfig = {
  environment: 'development-standalone',
  apiBaseUrl: 'http://localhost:7040/api',
  assetBasePath: '/ui',
};

const manifestEntry: FeatureManifestEntry = {
  remoteName: 'pricing',
  remoteEntry: './remoteEntry.json',
  exposedModule: './register',
  elementName: 'ca-pricing-page',
  featureVersion: 'dev-standalone',
  contractVersion: '1.x',
  enabled: true,
};

const logger = {
  event: (name: string, data?: Record<string, unknown>) => console.info(`[standalone] ${name}`, data ?? {}),
  error: (name: string, error: unknown) => console.error(`[standalone] ${name}`, error),
};

createApplication({
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
    { provide: PLATFORM_LOGGER, useValue: logger },
  ],
})
  .then((appRef) =>
    feature.register({
      shellInjector: appRef.injector,
      runtimeConfig,
      feature: manifestEntry,
      logger,
    })
  )
  .catch((err) => console.error(err));
