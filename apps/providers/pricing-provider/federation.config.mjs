import { withNativeFederation } from '@angular-architects/native-federation/config';
import { sharedPackages, SHARED_MAPPINGS } from '../../../tools/federation-sharing.mjs';

export default withNativeFederation({
  // Logical remote name referenced by the runtime manifest.
  name: 'pricing',

  // Only the registration adapter is exposed; page libraries stay private.
  exposes: {
    './register': './apps/providers/pricing-provider/src/register.ts',
  },

  shared: sharedPackages(),
  sharedMappings: [...SHARED_MAPPINGS],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: { denseChunking: true },
});
