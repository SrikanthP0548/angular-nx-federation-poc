/**
 * Standalone preview entry.
 *
 * In production this app is never loaded as a page — the shell consumes
 * `./register` through federation. This exists so a page can be developed in
 * isolation; it plays the shell's role locally, invoking the same
 * registration contract the shell uses.
 */
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
