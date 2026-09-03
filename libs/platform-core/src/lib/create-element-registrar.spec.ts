import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const { createElementRegistrar } = await import('./create-element-registrar');
import type {
  ElementRegistrationContext,
  FeatureDefinition,
  PageDefinition,
} from './platform-core';

let elementCounter = 0;
function uniqueTag() {
  return `ca-test-${++elementCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeContext(featureKey = 'test-feature'): ElementRegistrationContext {
  return {
    parentInjector: {} as never,
    runtimeConfig: { environment: 'test', assetBasePath: '/ui' },
    featureKey,
    logger: { event: vi.fn(), error: vi.fn() },
  };
}

const page: PageDefinition = { component: class {} as never, providers: [] };

function definition(elementName: string, loadPage = vi.fn(async () => page)): FeatureDefinition {
  return { elementName, loadPage };
}

beforeEach(() => {
  vi.clearAllMocks();
  createCustomElementMock.mockReturnValue(class extends HTMLElement {});
  createEnvironmentInjectorMock.mockReturnValue({ destroy: destroySpy });
});

describe('element registration', () => {
  it('loads the requested page and registers its custom element', async () => {
    const tag = uniqueTag();
    const registrar = createElementRegistrar();

    const result = await registrar.register(definition(tag), makeContext());

    expect(result).toEqual({ elementName: tag });
    expect(customElements.get(tag)).toBeDefined();
  });

  it('returns the same result for concurrent calls and defines once', async () => {
    const tag = uniqueTag();
    const loadPage = vi.fn(async () => page);
    const feature = definition(tag, loadPage);
    const registrar = createElementRegistrar();

    const [first, second] = await Promise.all([
      registrar.register(feature, makeContext()),
      registrar.register(feature, makeContext()),
    ]);

    expect(first).toBe(second);
    expect(loadPage).toHaveBeenCalledOnce();
    expect(createCustomElementMock).toHaveBeenCalledOnce();
  });

  it('treats a repeated successful registration as a no-op', async () => {
    const tag = uniqueTag();
    const feature = definition(tag);
    const registrar = createElementRegistrar();

    await registrar.register(feature, makeContext());
    await registrar.register(feature, makeContext());

    expect(createCustomElementMock).toHaveBeenCalledOnce();
  });

  it('evicts a rejected load so registration can retry', async () => {
    const tag = uniqueTag();
    const loadPage = vi
      .fn()
      .mockRejectedValueOnce(new Error('chunk fetch failed'))
      .mockResolvedValue(page);
    const feature = definition(tag, loadPage);
    const registrar = createElementRegistrar();

    await expect(registrar.register(feature, makeContext())).rejects.toThrow('chunk fetch failed');
    await expect(registrar.register(feature, makeContext())).resolves.toEqual({ elementName: tag });
    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it('destroys the child injector when registration fails before define', async () => {
    const tag = uniqueTag();
    createCustomElementMock.mockImplementation(() => {
      throw new Error('element construction failed');
    });
    const registrar = createElementRegistrar();

    await expect(registrar.register(definition(tag), makeContext())).rejects.toThrow(
      'element construction failed'
    );
    expect(destroySpy).toHaveBeenCalledOnce();
  });

  it('keeps the child injector alive after registration commits', async () => {
    const registrar = createElementRegistrar();

    await registrar.register(definition(uniqueTag()), makeContext());

    expect(destroySpy).not.toHaveBeenCalled();
  });

  it('rejects a tag registered outside this loader', async () => {
    const tag = uniqueTag();
    customElements.define(tag, class extends HTMLElement {});
    const registrar = createElementRegistrar();

    await expect(registrar.register(definition(tag), makeContext())).rejects.toThrow(
      /collision.*already registered outside this loader/s
    );
  });

  it('does not let telemetry failure undo a committed registration', async () => {
    const tag = uniqueTag();
    const registrar = createElementRegistrar();
    const context = makeContext();
    (context.logger.event as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('telemetry exploded');
    });

    await expect(registrar.register(definition(tag), context)).resolves.toEqual({ elementName: tag });
    await expect(registrar.register(definition(tag), context)).resolves.toEqual({ elementName: tag });
  });
});
