import { createApplication } from '@angular/platform-browser';
import {
  createElementRegistrar,
  FeatureDefinition,
  PLATFORM_LOGGER,
  RegisteredElement,
  RUNTIME_CONFIG,
  RuntimeConfig,
} from '@company/platform-core';
import { appConfig } from './app/app.config';
import { ConsolePlatformLogger } from './telemetry';

export interface BootstrapFeatureOptions {
  host: HTMLElement;
  featureKey: string;
  feature: FeatureDefinition;
}

const registrar = createElementRegistrar();

function readBootstrapContext(): Partial<RuntimeConfig> {
  const script = document.getElementById('angular-bootstrap-context');
  if (!script?.textContent?.trim()) return {};

  try {
    const parsed: unknown = JSON.parse(script.textContent);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Partial<RuntimeConfig>;
    }
    console.warn('[loader] #angular-bootstrap-context must contain a JSON object, ignoring');
    return {};
  } catch {
    console.warn('[loader] invalid #angular-bootstrap-context JSON, ignoring');
    return {};
  }
}

export async function bootstrapFeature(options: BootstrapFeatureOptions): Promise<void> {
  const { host, featureKey, feature } = options;
  const logger = new ConsolePlatformLogger();
  const startedAt = performance.now();
  const context = readBootstrapContext();
  const runtimeConfig: RuntimeConfig = {
    environment: typeof context.environment === 'string' ? context.environment : 'production',
    assetBasePath: typeof context.assetBasePath === 'string' ? context.assetBasePath : '/ui',
  };

  logger.event('loader.start', { featureKey });

  if (!host.querySelector(feature.elementName)) {
    throw new Error(
      `loader.feature.host-mismatch: feature "${featureKey}" expects <${feature.elementName}> inside its host`
    );
  }

  const appRef = await createApplication({
    providers: [
      ...(appConfig.providers ?? []),
      { provide: RUNTIME_CONFIG, useValue: runtimeConfig },
      { provide: PLATFORM_LOGGER, useValue: logger },
    ],
  });

  logger.event('loader.page.load.start', { featureKey });
  let registered: RegisteredElement;
  try {
    registered = await registrar.register(feature, {
      parentInjector: appRef.injector,
      runtimeConfig,
      featureKey,
      logger,
    });
  } catch (error) {
    appRef.destroy();
    throw error;
  }

  logger.event('loader.feature.registered', {
    featureKey,
    elementName: registered.elementName,
    startupMs: Math.round(performance.now() - startedAt),
  });
}
