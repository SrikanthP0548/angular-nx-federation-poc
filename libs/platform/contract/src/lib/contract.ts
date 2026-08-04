import { EnvironmentInjector, InjectionToken } from '@angular/core';

/**
 * The platform contract package (doc section 4.1).
 *
 * This is the ONLY compile-time contract shared between the shell and the
 * federated remotes. It is versioned semantically: a remote declares the
 * contract range it supports, and the shell rejects incompatible remotes
 * before rendering.
 */
export const PLATFORM_CONTRACT_VERSION = '1.0';

/** Non-sensitive runtime configuration provided by the shell. */
export interface RuntimeConfig {
  environment: string;
  /** Base URL for BFF JSON APIs, e.g. `/api`. */
  apiBaseUrl: string;
  /** Base path for federated UI assets, e.g. `/ui`. */
  assetBasePath: string;
}

/** Structured telemetry/logging surface shared with remotes (doc section 15.3). */
export interface PlatformLogger {
  event(name: string, data?: Record<string, unknown>): void;
  error(name: string, error: unknown, data?: Record<string, unknown>): void;
}

/** One feature entry in the environment runtime manifest (doc section 4.2). */
export interface FeatureManifestEntry {
  remoteName: string;
  /** URL of the remote's federation metadata (remoteEntry.json for native federation). */
  remoteEntry: string;
  /** Module exposed by the remote that default-exports a {@link FederatedFeature}. */
  exposedModule: string;
  /** Custom-element tag the feature registers, e.g. `ca-pricing-page`. */
  elementName: string;
  featureVersion: string;
  /** Contract range the remote supports, e.g. `1.x`. */
  contractVersion: string;
  enabled: boolean;
}

/** Environment-specific runtime manifest — the deployment control plane (doc section 12). */
export interface RuntimeManifest {
  schemaVersion: string;
  environment: string;
  shell: { version: string };
  features: Record<string, FeatureManifestEntry>;
}

/** Context the shell passes to a remote's register() function. */
export interface FeatureRegistrationContext {
  shellInjector: EnvironmentInjector;
  runtimeConfig: RuntimeConfig;
  feature: FeatureManifestEntry;
  logger: PlatformLogger;
}

/** What a remote reports back after registering its custom elements. */
export interface RegisteredFeature {
  elementNames: readonly string[];
  dispose?: () => void;
}

/** The default export of every remote's exposed registration module. */
export interface FederatedFeature {
  contractVersion: string;
  register(context: FeatureRegistrationContext): Promise<RegisteredFeature>;
}

/** Injection tokens so feature code can inject platform services through the shell injector. */
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('platform.runtime-config');
export const PLATFORM_LOGGER = new InjectionToken<PlatformLogger>('platform.logger');

/**
 * Checks whether a remote's declared contract range (e.g. `1.x` or `1.0`)
 * is compatible with the shell's contract version (major must match).
 */
export function isContractCompatible(
  remoteRange: string,
  shellVersion: string = PLATFORM_CONTRACT_VERSION
): boolean {
  const remoteMajor = remoteRange.split('.')[0];
  const shellMajor = shellVersion.split('.')[0];
  return remoteMajor === shellMajor;
}

/** Stable frontend-facing BFF error contract (doc section 9.3). */
export interface BffErrorResponse {
  traceId: string;
  code: string;
  message: string;
  retryable: boolean;
  validationErrors: Array<{ field: string; message: string }>;
}
