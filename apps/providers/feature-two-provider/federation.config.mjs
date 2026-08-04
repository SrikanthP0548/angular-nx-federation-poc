import { withNativeFederation } from '@angular-architects/native-federation/config';
import { sharedPackages, SHARED_MAPPINGS } from '../../../tools/federation-sharing.mjs';

export default withNativeFederation({
  // Logical remote name referenced by the runtime manifest.
  name: 'feature-two',

  // Only the registration adapter is exposed; page libraries stay private.
  exposes: {
    './register': './apps/providers/feature-two-provider/src/register.ts',
  },

  shared: sharedPackages(),
  sharedMappings: [...SHARED_MAPPINGS],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: { denseChunking: true },
});
