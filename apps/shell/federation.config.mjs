import { withNativeFederation } from '@angular-architects/native-federation/config';
import { sharedPackages, SHARED_MAPPINGS } from '../../tools/federation-sharing.mjs';

export default withNativeFederation({
  name: 'shell',

  // Explicit lists, not shareAll(). The shell is the owner of every shared
  // package at runtime, including @angular/elements — which it does not use
  // itself, but must own so that providers negotiate against one instance
  // rather than whichever provider happens to load first.
  shared: sharedPackages(),

  // Without this, every tsconfig.base.json path entry becomes a shared
  // singleton. Must stay identical to the providers' configs.
  sharedMappings: [...SHARED_MAPPINGS],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: { denseChunking: true },
});
