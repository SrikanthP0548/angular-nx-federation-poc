import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

/**
 * Shared platform providers. Every page resolves platform services from this
 * one loader-owned Angular environment through a child EnvironmentInjector.
 *
 * Deliberately no router, no hydration/SSR, no root component, and no
 * HttpClient — this POC uses in-memory data, so adding HTTP would
 * put a shared package in the graph that nothing actually needs.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
