import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Angular's runtime entry points are mocked so the registration lifecycle can
 * be tested without the Angular compiler. The rules under test are about
 * ordering and bookkeeping, not about rendering.
 */
const destroySpy = vi.fn();
const createEnvironmentInjectorMock = vi.fn(() => ({ destroy: destroySpy }));
const createCustomElementMock = vi.fn();

vi.mock('@angular/core', () => ({
  createEnvironmentInjector: (...args: unknown[]) => createEnvironmentInjectorMock(...(args as [])),
  InjectionToken: class {
    constructor(public description: string) {}
  },
}));

vi.mock('@angular/elements', () => ({
  createCustomElement: (...args: unknown[]) => createCustomElementMock(...(args as [])),
}));

const { createFederatedFeature } = await import('./create-federated-feature');
import type { FeatureRegistrationContext, PageDefinition } from './shared-core';

let elementCounter = 0;
function uniqueTag(prefix = 'ca-test') {
  return `${prefix}-${++elementCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeContext(elementName: string): FeatureRegistrationContext {
  return {
    shellInjector: {} as never,
    runtimeConfig: { environment: 'test', assetBasePath: '/ui' },
    feature: {
      remoteName: 'test-remote',
      remoteEntry: './remoteEntry.json',
      exposedModule: './register',
      elementName,
      featureVersion: '1.0.0',
      contractVersion: '1.x',
      enabled: true,
    },
    logger: { event: vi.fn(), error: vi.fn() },
  };
}

const page: PageDefinition = { component: class {} as never, providers: [] };

beforeEach(() => {
  vi.clearAllMocks();
  createCustomElementMock.mockReturnValue(class extends HTMLElement {});
  createEnvironmentInjectorMock.mockReturnValue({ destroy: destroySpy });
});

describe('registration', () => {
  it('registers the requested page and reports its element name', async () => {
    const tag = uniqueTag();
    const feature = createFederatedFeature({ [tag]: async () => page });

    const result = await feature.register(makeContext(tag));

    expect(result.elementNames).toEqual([tag]);
    expect(customElements.get(tag)).toBeDefined();
  });

  it('loads only the requested page, never the others', async () => {
    const wanted = uniqueTag();
    const other = uniqueTag();
    const loadWanted = vi.fn(async () => page);
    const loadOther = vi.fn(async () => page);

    const feature = createFederatedFeature({ [wanted]: loadWanted, [other]: loadOther });
    await feature.register(makeContext(wanted));

    expect(loadWanted).toHaveBeenCalledOnce();
    // The whole point of the dynamic-import registry: a page's code is never
    // fetched because it happens to live in the same deployment unit.
    expect(loadOther).not.toHaveBeenCalled();
  });

  it('rejects an element the provider does not serve, naming what it does serve', async () => {
    const served = uniqueTag();
    const feature = createFederatedFeature({ [served]: async () => page });

    await expect(feature.register(makeContext('ca-not-served'))).rejects.toThrow(
      /unknown-element.*ca-not-served.*serves: .*/s
    );
  });
});

describe('idempotency and concurrency', () => {
  it('returns the same promise for concurrent calls rather than racing to define()', async () => {
    const tag = uniqueTag();
    const load = vi.fn(async () => page);
    const feature = createFederatedFeature({ [tag]: load });
    const context = makeContext(tag);

    const [a, b] = await Promise.all([feature.register(context), feature.register(context)]);

    expect(a).toBe(b);
    expect(load).toHaveBeenCalledOnce();
    expect(createCustomElementMock).toHaveBeenCalledOnce();
  });

  it('a repeated successful registration is a no-op', async () => {
    const tag = uniqueTag();
    const feature = createFederatedFeature({ [tag]: async () => page });
    const context = makeContext(tag);

    await feature.register(context);
    await feature.register(context);

    expect(createCustomElementMock).toHaveBeenCalledOnce();
  });
});

describe('failure handling', () => {
  it('evicts a rejected registration so a retry can succeed', async () => {
    const tag = uniqueTag();
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk fetch failed'))
      .mockResolvedValue(page);
    const feature = createFederatedFeature({ [tag]: load });
    const context = makeContext(tag);

    await expect(feature.register(context)).rejects.toThrow('chunk fetch failed');
    // Without eviction, one transient failure would poison this page for the
    // life of the document.
    await expect(feature.register(context)).resolves.toMatchObject({ elementNames: [tag] });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('destroys the page injector when registration fails before define()', async () => {
    const tag = uniqueTag();
    createCustomElementMock.mockImplementation(() => {
      throw new Error('element construction failed');
    });
    const feature = createFederatedFeature({ [tag]: async () => page });

    await expect(feature.register(makeContext(tag))).rejects.toThrow('element construction failed');
    // Otherwise every retry leaks an injector and whatever its providers built.
    expect(destroySpy).toHaveBeenCalledOnce();
  });

  it('does not destroy the injector once registration is committed', async () => {
    const tag = uniqueTag();
    const feature = createFederatedFeature({ [tag]: async () => page });

    await feature.register(makeContext(tag));

    // The element definition keeps resolving against this injector, and a
    // custom element cannot be unregistered.
    expect(destroySpy).not.toHaveBeenCalled();
  });

  it('treats a tag defined outside this provider as a collision', async () => {
    const tag = uniqueTag();
    customElements.define(tag, class extends HTMLElement {});

    const feature = createFederatedFeature({ [tag]: async () => page });

    await expect(feature.register(makeContext(tag))).rejects.toThrow(/collision.*already registered outside/s);
  });
});

describe('the commit point', () => {
  it('survives a logger that throws after define(), and stays owned', async () => {
    const tag = uniqueTag();
    const feature = createFederatedFeature({ [tag]: async () => page });
    const context = makeContext(tag);
    (context.logger.event as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('telemetry exploded');
    });

    // Once define() returns, registration is committed: a later failure must
    // not turn it into a rejected cached promise.
    await expect(feature.register(context)).resolves.toMatchObject({ elementNames: [tag] });

    // And the retry must see it as ours, not as a foreign collision — which
    // is what would happen if the promise had been evicted.
    await expect(feature.register(context)).resolves.toMatchObject({ elementNames: [tag] });
  });
});
