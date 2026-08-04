import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

/**
 * Shared platform providers. Every feature resolves platform services from
 * this single shell environment through its child EnvironmentInjector, which
 * is what keeps the Angular runtime and the platform tokens singletons.
 *
 * Deliberately no router, no hydration/SSR, no root component, and no
 * HttpClient — this POC's features use in-memory data, so adding HTTP would
 * put a shared package in the graph that nothing actually needs.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
