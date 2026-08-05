import { createFederatedFeature } from '@company/shared-core';
import { PAGE_REGISTRY } from './page-registry';

/**
 * The only module this provider exposes through federation. The shell loads
 * it dynamically and calls `register()` with its own injector, so Angular and
 * the platform tokens stay singletons owned by the shell.
 */
export default createFederatedFeature(PAGE_REGISTRY);
