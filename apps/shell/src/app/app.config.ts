import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';

/**
 * Shared platform providers (doc section 6.1): every remote resolves
 * HTTP, error handling and platform services from this single shell
 * environment through its child EnvironmentInjector.
 *
 * Deliberately no router, no hydration/SSR and no root component: the shell
 * upgrades custom elements already present in the legacy host document.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withFetch())],
};
