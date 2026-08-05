import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import {
  FederatedFeature,
  FeatureRegistrationContext,
  PageDefinition,
  PLATFORM_CONTRACT_VERSION,
  RegisteredFeature,
} from './shared-core';

export type PageRegistry = Record<string, () => Promise<PageDefinition>>;

/**
 * Builds the `FederatedFeature` a provider exposes through federation.
 *
 * Lives here rather than being copied into each provider so that every
 * deployment unit registers pages identically and the lifecycle rules below
 * are tested once. Providers supply only their page registry.
 *
 * The rules, each of which exists because of a specific failure:
 *
 *  - **Concurrency.** Registration is async, so two overlapping calls can both
 *    pass a `customElements.get()` check and race to `define()`, and the loser
 *    throws `NotSupportedError`. An in-flight promise map serialises them.
 *
 *  - **Retry.** A rejected registration is evicted from that map, otherwise one
 *    transient failure poisons the page for the life of the document.
 *
 *  - **Ownership.** A tag defined but not owned by this module came from
 *    another provider or a stale artifact. Returning silently there could
 *    render the wrong page implementation, so it is a hard error.
 *
 *  - **Commit point.** `customElements.define()` cannot be undone, so once it
 *    returns the registration is committed and must not be able to fail.
 *    Ownership is recorded immediately and post-definition telemetry cannot
 *    reject — otherwise the promise would be evicted while the element stayed
 *    defined, and the retry would misreport a foreign collision for an element
 *    this module itself created.
 *
 *  - **Injector lifetime.** The page injector is destroyed only if something
 *    fails *before* the commit point; after it, the injector must outlive the
 *    call because the element definition keeps resolving against it. There is
 *    deliberately no disposal API.
 */
export function createFederatedFeature(registry: PageRegistry): FederatedFeature {
  const inFlight = new Map<string, Promise<RegisteredFeature>>();
  const ownedElements = new Set<string>();

  async function registerPage(
    elementName: string,
    context: FeatureRegistrationContext
  ): Promise<RegisteredFeature> {
    const loadPage = registry[elementName];
    if (!loadPage) {
      throw new Error(
        `feature.register.unknown-element: "${elementName}" is not served by remote ` +
          `"${context.feature.remoteName}" (serves: ${Object.keys(registry).join(', ')})`
      );
    }

    if (customElements.get(elementName) && !ownedElements.has(elementName)) {
      throw new Error(
        `feature.register.collision: custom element "${elementName}" is already registered outside this provider`
      );
    }

    const page = await loadPage();

    let featureInjector: EnvironmentInjector | undefined;
    try {
      featureInjector = createEnvironmentInjector(page.providers, context.shellInjector, elementName);
      const element = createCustomElement(page.component, { injector: featureInjector });
      customElements.define(elementName, element);
    } catch (err) {
      featureInjector?.destroy();
      throw err;
    }

    // Committed from here on. Nothing below may reject.
    ownedElements.add(elementName);
    const result: RegisteredFeature = { elementNames: [elementName] };

    try {
      context.logger.event('feature.register.completed', {
        elementName,
        featureVersion: context.feature.featureVersion,
      });
    } catch (err) {
      console.error('[provider] telemetry failed after registration was committed', err);
    }

    return result;
  }

  return {
    contractVersion: PLATFORM_CONTRACT_VERSION,

    register(context: FeatureRegistrationContext): Promise<RegisteredFeature> {
      const elementName = context.feature.elementName;

      const existing = inFlight.get(elementName);
      if (existing) {
        return existing;
      }

      const pending = registerPage(elementName, context).catch((err) => {
        inFlight.delete(elementName);
        throw err;
      });

      // Set synchronously, before any await: a concurrent call must join this
      // promise rather than start a second registration.
      inFlight.set(elementName, pending);
      return pending;
    },
  };
}
