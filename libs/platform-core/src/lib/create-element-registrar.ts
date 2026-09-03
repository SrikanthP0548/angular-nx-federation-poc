import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import {
  ElementRegistrar,
  ElementRegistrationContext,
  FeatureDefinition,
  RegisteredElement,
} from './platform-core';

/**
 * Creates the document-scoped registrar used by the loader.
 *
 * Registrations are serialized per tag, rejected attempts are retryable, and
 * foreign definitions are treated as collisions. A child injector is cleaned
 * up only before customElements.define(); after that irreversible commit point
 * it must live for the rest of the document.
 */
export function createElementRegistrar(): ElementRegistrar {
  const inFlight = new Map<string, Promise<RegisteredElement>>();
  const ownedElements = new Set<string>();

  async function registerElement(
    definition: FeatureDefinition,
    context: ElementRegistrationContext
  ): Promise<RegisteredElement> {
    const { elementName } = definition;

    if (customElements.get(elementName) && !ownedElements.has(elementName)) {
      throw new Error(
        `element.register.collision: custom element "${elementName}" is already registered outside this loader`
      );
    }

    const page = await definition.loadPage();
    let pageInjector: EnvironmentInjector | undefined;

    try {
      pageInjector = createEnvironmentInjector(page.providers, context.parentInjector, elementName);
      const element = createCustomElement(page.component, { injector: pageInjector });
      customElements.define(elementName, element);
    } catch (error) {
      pageInjector?.destroy();
      throw error;
    }

    ownedElements.add(elementName);
    const result: RegisteredElement = { elementName };

    try {
      context.logger.event('feature.register.completed', {
        featureKey: context.featureKey,
        elementName,
      });
    } catch (error) {
      console.error('[loader] telemetry failed after element registration was committed', error);
    }

    return result;
  }

  return {
    register(
      definition: FeatureDefinition,
      context: ElementRegistrationContext
    ): Promise<RegisteredElement> {
      const existing = inFlight.get(definition.elementName);
      if (existing) return existing;

      const pending = registerElement(definition, context).catch((error) => {
        inFlight.delete(definition.elementName);
        throw error;
      });

      inFlight.set(definition.elementName, pending);
      return pending;
    },
  };
}
