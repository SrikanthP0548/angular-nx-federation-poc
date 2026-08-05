import { withNativeFederation } from '@angular-architects/native-federation/config';
import { sharedPackages, SHARED_MAPPINGS } from '../../../tools/federation-sharing.mjs';

export default withNativeFederation({
  // Logical remote name referenced by the runtime manifest.
  name: 'pricing',

  // One exposed key per page — the key itself becomes the published filename
  // stem (e.g. pricing-search-<hash>.js), and each page becomes independently
  // addressable by the manifest rather than dispatched-to internally. Page
  // libraries themselves stay private; only these thin entry files are exposed.
  exposes: {
    './pricing-search': './apps/providers/pricing-provider/src/pricing-search.register.ts',
    './pricing-details': './apps/providers/pricing-provider/src/pricing-details.register.ts',
  },

  shared: sharedPackages(),
  sharedMappings: [...SHARED_MAPPINGS],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: { denseChunking: true },
});
