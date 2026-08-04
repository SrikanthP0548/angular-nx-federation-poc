/**
 * Remote registration module (doc section 7.2).
 *
 * This is the only module the Pricing remote exposes through federation.
 * The shell loads it dynamically and calls `register()`, passing the shell
 * injector so Angular, HttpClient and platform services are shared
 * singletons rather than a second bundled runtime.
 */
import { createEnvironmentInjector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import type {
  FederatedFeature,
  FeatureRegistrationContext,
  RegisteredFeature,
} from '@company/angular-platform-contract';
import { PricingPage } from './app/pages/pricing-page';
import { pricingProviders } from './feature-providers';

const feature: FederatedFeature = {
  contractVersion: '1.0',

  async register(context: FeatureRegistrationContext): Promise<RegisteredFeature> {
    const elementName = context.feature.elementName;

    // Registration must be idempotent (doc section 4.3): a tag can only be
    // defined once per document, and the host page may re-run the loader.
    if (!customElements.get(elementName)) {
      const featureInjector = createEnvironmentInjector(
        pricingProviders,
        context.shellInjector,
        'pricing-feature'
      );

      const element = createCustomElement(PricingPage, {
        injector: featureInjector,
      });
      customElements.define(elementName, element);
    }

    context.logger.event('feature.pricing.registered', {
      elementName,
      featureVersion: context.feature.featureVersion,
    });

    return { elementNames: [elementName] };
  },
};

export default feature;
