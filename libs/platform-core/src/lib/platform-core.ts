import {
  EnvironmentInjector,
  EnvironmentProviders,
  InjectionToken,
  Provider,
  Type,
} from '@angular/core';

/** Non-sensitive configuration supplied by the host application. */
export interface RuntimeConfig {
  environment: string;
  assetBasePath: string;
}

/** Structured telemetry surface shared by the loader and every page. */
export interface PlatformLogger {
  event(name: string, data?: Record<string, unknown>): void;
  error(name: string, error: unknown, data?: Record<string, unknown>): void;
}

/** The complete public contract of a page library. */
export interface PageDefinition {
  component: Type<unknown>;
  providers: Array<Provider | EnvironmentProviders>;
}

/** One entry in the loader's compile-time, lazy feature registry. */
export interface FeatureDefinition {
  elementName: string;
  loadPage(): Promise<PageDefinition>;
}

/** Context shared with the page-specific child injector and telemetry. */
export interface ElementRegistrationContext {
  parentInjector: EnvironmentInjector;
  runtimeConfig: RuntimeConfig;
  featureKey: string;
  logger: PlatformLogger;
}

export interface RegisteredElement {
  elementName: string;
}

export interface ElementRegistrar {
  register(
    definition: FeatureDefinition,
    context: ElementRegistrationContext
  ): Promise<RegisteredElement>;
}

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('platform.runtime-config');
export const PLATFORM_LOGGER = new InjectionToken<PlatformLogger>('platform.logger');
