import { withNativeFederation } from '@angular-architects/native-federation/config';
import { sharedPackages, SHARED_MAPPINGS } from '../../../tools/federation-sharing.mjs';

export default withNativeFederation({
  // Logical remote name referenced by the runtime manifest.
  name: 'feature-three',

  // The exposes key becomes the published filename stem, so it's named after
  // the page this provider hosts rather than generically.
  exposes: {
    './feature-three': './apps/providers/feature-three-provider/src/register.ts',
  },

  shared: sharedPackages(),
  sharedMappings: [...SHARED_MAPPINGS],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: { denseChunking: true },
});
