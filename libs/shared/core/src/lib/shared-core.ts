import {
  EnvironmentInjector,
  EnvironmentProviders,
  InjectionToken,
  Provider,
  Type,
} from '@angular/core';

/**
 * Shared core: the only compile-time contract between the shell and the
 * feature providers, and the only workspace library shared as a federation
 * singleton.
 *
 * It is versioned semantically. A provider declares the contract range it
 * supports, and the shell rejects an incompatible provider before rendering.
 *
 * Nothing here may import another workspace library — this is the root of the
 * dependency graph, and the ESLint boundary rules enforce it.
 */
export const PLATFORM_CONTRACT_VERSION = '1.0';

/** Non-sensitive runtime configuration supplied by the shell. */
export interface RuntimeConfig {
  environment: string;
  /** Base path for federated UI assets, e.g. `/ui`. */
  assetBasePath: string;
}

/** Structured telemetry surface shared with providers. */
export interface PlatformLogger {
  event(name: string, data?: Record<string, unknown>): void;
  error(name: string, error: unknown, data?: Record<string, unknown>): void;
}

/** One feature entry in the environment runtime manifest. */
export interface FeatureManifestEntry {
  remoteName: string;
  /** URL of the provider's federation metadata. */
  remoteEntry: string;
  /** Module the provider exposes that default-exports a {@link FederatedFeature}. */
  exposedModule: string;
  /** Custom-element tag this feature registers, e.g. `ca-pricing-search`. */
  elementName: string;
  featureVersion: string;
  /** Contract range the provider supports, e.g. `1.x`. */
  contractVersion: string;
  enabled: boolean;
  /**
   * Published artifact directory, when it differs from the feature key.
   * Needed because one provider artifact can serve several feature keys.
   * The shell ignores this; only the promotion tooling reads it.
   */
  artifact?: string;
}

/** Environment-specific runtime manifest — the deployment control plane. */
export interface RuntimeManifest {
  schemaVersion: string;
  environment: string;
  shell: { version: string };
  features: Record<string, FeatureManifestEntry>;
}

/**
 * What a feature library exports from its public barrel — exactly one of
 * these, and never the component class itself. A page's component is an
 * implementation detail; exporting it invites cross-page imports that the
 * boundary rules exist to prevent.
 */
export interface PageDefinition {
  component: Type<unknown>;
  providers: Array<Provider | EnvironmentProviders>;
}

/** The shape a feature library's barrel satisfies when loaded dynamically. */
export type PageModule = Record<string, unknown>;

/** Context the shell passes to a provider's register() function. */
export interface FeatureRegistrationContext {
  shellInjector: EnvironmentInjector;
  runtimeConfig: RuntimeConfig;
  feature: FeatureManifestEntry;
  logger: PlatformLogger;
}

/**
 * What a provider reports back after registering a custom element.
 *
 * There is deliberately no `dispose`: custom-element definitions cannot be
 * unregistered, so tearing down the page injector while the tag stays defined
 * would leave any later instantiation resolving against a destroyed injector.
 * Page injectors live for the document lifetime.
 */
export interface RegisteredFeature {
  elementNames: readonly string[];
}

/** The default export of every provider's exposed registration module. */
export interface FederatedFeature {
  contractVersion: string;
  register(context: FeatureRegistrationContext): Promise<RegisteredFeature>;
}

/** Tokens letting feature code reach platform services through the shell injector. */
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('platform.runtime-config');
export const PLATFORM_LOGGER = new InjectionToken<PlatformLogger>('platform.logger');

/**
 * Whether a provider's declared contract range (e.g. `1.x`) is compatible
 * with the shell's contract version. Majors must match.
 */
export function isContractCompatible(
  remoteRange: string,
  shellVersion: string = PLATFORM_CONTRACT_VERSION
): boolean {
  return remoteRange.split('.')[0] === shellVersion.split('.')[0];
}
