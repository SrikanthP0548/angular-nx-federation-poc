import { EnvironmentProviders, Provider } from '@angular/core';
import { PricingDataService } from './app/pricing-data.service';

/**
 * Feature-scoped providers (doc section 7.3): these live in the child
 * EnvironmentInjector created during registration, so domain state stays
 * inside the remote while shared services (HttpClient, logger, runtime
 * config) resolve from the parent shell injector.
 */
export const pricingProviders: Array<Provider | EnvironmentProviders> = [PricingDataService];
