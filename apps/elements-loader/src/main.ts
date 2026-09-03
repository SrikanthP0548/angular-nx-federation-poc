/**
 * Stable loader referenced by every host page.
 *
 * This entry deliberately imports no Angular runtime. An unmigrated page can
 * include it and stop before Angular or any page implementation is downloaded.
 */
import { FEATURE_REGISTRY } from './feature-registry';
import { renderLoaderFailure } from './loader-failure';

async function startLoader(): Promise<void> {
  const host = document.querySelector<HTMLElement>('[data-angular-feature]');
  if (!host) {
    console.info('[loader] idle — no data-angular-feature on this page');
    window.dispatchEvent(new CustomEvent('loader-telemetry', { detail: { name: 'loader.idle' } }));
    return;
  }

  const featureKey = host.dataset['angularFeature'];
  if (!featureKey) {
    throw new Error('loader.start.failed: data-angular-feature is empty');
  }

  const feature = FEATURE_REGISTRY[featureKey];
  if (!feature) {
    throw new Error(`loader.feature.unknown: unknown feature key "${featureKey}"`);
  }

  const { bootstrapFeature } = await import('./bootstrap');
  await bootstrapFeature({ host, featureKey, feature });
}

startLoader().catch((error) => {
  console.error('[loader] startup failed', error);
  const host = document.querySelector<HTMLElement>('[data-angular-feature]');
  renderLoaderFailure(host, error);
});
