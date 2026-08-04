/**
 * Shell bootstrap (doc section 6.3): creates one Angular application
 * environment for the current host document — without a traditional root
 * component — then loads the selected remote and invokes the platform
 * registration contract.
 */
import { createApplication } from '@angular/platform-browser';
import { loadRemoteModule } from '@angular-architects/native-federation';
import {
  FeatureManifestEntry,
  FederatedFeature,
  PLATFORM_CONTRACT_VERSION,
  PLATFORM_LOGGER,
  RUNTIME_CONFIG,
  RuntimeConfig,
  RuntimeManifest,
  isContractCompatible,
} from '@company/angular-platform-contract';
import { appConfig } from './app/app.config';
import { ConsolePlatformLogger } from './telemetry';
import { renderShellFailure } from './shell-failure';

export interface BootstrapFeatureOptions {
  host: HTMLElement;
  manifest: RuntimeManifest;
  feature: FeatureManifestEntry;
}

/**
 * Non-sensitive bootstrap configuration rendered by the host page
 * (doc section 8.2, `#angular-bootstrap-context`).
 */
function readBootstrapContext(): Partial<RuntimeConfig> & Record<string, unknown> {
  const script = document.getElementById('angular-bootstrap-context');
  if (!script?.textContent?.trim()) {
    return {};
  }
  try {
    return JSON.parse(script.textContent);
  } catch {
    console.warn('[shell] invalid #angular-bootstrap-context JSON, ignoring');
    return {};
  }
}

export async function bootstrapFeature(options: BootstrapFeatureOptions): Promise<void> {
  const { host, manifest, feature } = options;
  const logger = new ConsolePlatformLogger();
  const startedAt = performance.now();

  logger.event('shell.start', { featureKey: host.dataset['angularFeature'], shellVersion: manifest.shell.version });
  logger.event('shell.manifest.loaded', { environment: manifest.environment, featureVersion: feature.featureVersion });

  const bootstrapContext = readBootstrapContext();
  const runtimeConfig: RuntimeConfig = {
    environment: manifest.environment,
    apiBaseUrl: typeof bootstrapContext.apiBaseUrl === 'string' ? bootstrapContext.apiBaseUrl : '/api',
    assetBasePath: typeof bootstrapContext.assetBasePath === 'string' ? bootstrapContext.assetBasePath : '/ui',
  };

  // Compatibility gate BEFORE loading remote code (doc sections 6.1, 12.2).
  if (!isContractCompatible(feature.contractVersion)) {
    logger.error('shell.feature.incompatible', feature.contractVersion, { shellContract: PLATFORM_CONTRACT_VERSION });
    throw new Error(
      `shell.feature.incompatible: remote requires contract ${feature.contractVersion}, shell provides ${PLATFORM_CONTRACT_VERSION}`
    );
  }

  // One Angular environment per host document; no root component is rendered.
  const appRef = await createApplication({
    providers: [
      ...(appConfig.providers ?? []),
      { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
      { provide: PLATFORM_LOGGER, useValue: logger },
    ],
  });

  logger.event('shell.remote.load.start', { remoteName: feature.remoteName, remoteEntry: feature.remoteEntry });
  let module: { default?: FederatedFeature };
  try {
    module = await loadRemoteModule(feature.remoteName, feature.exposedModule);
  } catch (err) {
    logger.error('shell.remote.load.failed', err, { remoteName: feature.remoteName });
    renderShellFailure(host, err);
    throw err;
  }
  logger.event('shell.remote.load.success', { remoteName: feature.remoteName });

  const federatedFeature = module.default;
  if (!federatedFeature || typeof federatedFeature.register !== 'function') {
    throw new Error(`shell.remote.load.failed: ${feature.exposedModule} does not default-export a FederatedFeature`);
  }
  if (!isContractCompatible(federatedFeature.contractVersion)) {
    logger.error('shell.feature.incompatible', federatedFeature.contractVersion);
    throw new Error(
      `shell.feature.incompatible: remote module declares contract ${federatedFeature.contractVersion}`
    );
  }

  const registered = await federatedFeature.register({
    shellInjector: appRef.injector,
    runtimeConfig,
    feature,
    logger,
  });

  logger.event('shell.feature.registered', {
    elementNames: [...registered.elementNames],
    featureVersion: feature.featureVersion,
    startupMs: Math.round(performance.now() - startedAt),
  });
}
