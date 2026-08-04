/**
 * Standalone preview entry for the Pricing remote (http://localhost:4201).
 *
 * In production this app is never loaded as a page — the shell consumes
 * `./register` through federation. This entry exists so the domain team can
 * develop the page in isolation; it plays the shell's role locally by
 * creating an Angular environment and invoking the same registration
 * contract the shell uses.
 */
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
